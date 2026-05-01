import { Injectable } from '@nestjs/common';
import { VerifyWebhookDto } from './verify.controller';

export interface SkillResult {
  skill: string;
  repoCount: number;
  score: number;
  verified: boolean;
}

export interface SkillsCallbackPayload {
  cvId: number;
  owner: string;
  status: 'verified' | 'unverified';
  results: SkillResult[];
  averageScore: number;
  verifiedSkills: string[];
  unverifiedSkills: string[];
}

@Injectable()
export class VerifyService {
  // Lance le traitement en arrière-plan sans bloquer la réponse HTTP
  processAsync(dto: VerifyWebhookDto): void {
    this.runPipeline(dto).catch(err =>
      console.error('[SkillsVerifier] Pipeline error:', err),
    );
  }

  private async runPipeline(dto: VerifyWebhookDto): Promise<void> {
    console.log(`[SkillsVerifier] Starting verification for CV #${dto.cvId} — skills: ${dto.skills.join(', ')}`);

    const results = await this.verifySkillsOnGitHub(dto.skills);
    const verifiedSkills = results.filter(r => r.verified).map(r => r.skill);
    const unverifiedSkills = results.filter(r => !r.verified).map(r => r.skill);
    const averageScore =
      results.reduce((sum, r) => sum + r.score, 0) / results.length;

    const payload: SkillsCallbackPayload = {
      cvId: dto.cvId,
      owner: dto.owner,
      status: verifiedSkills.length > 0 ? 'verified' : 'unverified',
      results,
      averageScore: Math.round(averageScore * 10) / 10,
      verifiedSkills,
      unverifiedSkills,
    };

    await this.sendCallback(dto.callbackUrl, payload);
  }

  private async verifySkillsOnGitHub(skills: string[]): Promise<SkillResult[]> {
    const results: SkillResult[] = [];

    for (const skill of skills) {
      // GitHub topic search: normalise le skill en lowercase-hyphenated
      const topic = skill.toLowerCase().replace(/[\s_.]+/g, '-');
      const url = `https://api.github.com/search/repositories?q=topic:${topic}&per_page=1`;

      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/vnd.github+json',
            // Identifie notre app auprès de GitHub (requis par leurs guidelines)
            'User-Agent': 'CvTech-SkillsVerifier/1.0',
          },
        });

        if (!response.ok) {
          console.warn(`[SkillsVerifier] GitHub API ${response.status} for skill "${skill}"`);
          results.push({ skill, repoCount: 0, score: 0, verified: false });
          continue;
        }

        const data = await response.json() as { total_count: number };
        const repoCount = data.total_count ?? 0;
        const score = this.computeScore(repoCount);

        console.log(`[SkillsVerifier] "${skill}" → ${repoCount} repos → score ${score}`);

        results.push({
          skill,
          repoCount,
          score,
          verified: score >= 4.0,
        });

      } catch (err) {
        console.error(`[SkillsVerifier] Failed to check "${skill}":`, err);
        results.push({ skill, repoCount: 0, score: 0, verified: false });
      }

      // Petite pause entre les appels pour respecter le rate limit GitHub (10 req/min sans token)
      await this.sleep(700);
    }

    return results;
  }

  // Score basé sur la popularité du skill sur GitHub
  private computeScore(repoCount: number): number {
    if (repoCount > 100_000) return 10.0;
    if (repoCount > 20_000)  return 9.0;
    if (repoCount > 5_000)   return 8.0;
    if (repoCount > 1_000)   return 7.0;
    if (repoCount > 500)     return 6.0;
    if (repoCount > 100)     return 5.0;
    if (repoCount > 10)      return 3.0;
    if (repoCount > 0)       return 1.5;
    return 0;
  }

  private async sendCallback(url: string, payload: SkillsCallbackPayload): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`[SkillsVerifier] Callback sent to ${url} → HTTP ${response.status}`);
    } catch (err) {
      console.error('[SkillsVerifier] Failed to send callback:', err);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

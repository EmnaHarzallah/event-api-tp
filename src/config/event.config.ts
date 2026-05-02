export const APP_EVENTS = {
    'CvCreated': 'cv.created',
    'CvUpdated': 'cv.updated',
    'CvDeleted': 'cv.deleted',
    'SkillsVerified': 'cv.skills.verified'
} as const;

export type CvEventType = typeof APP_EVENTS[keyof typeof APP_EVENTS];

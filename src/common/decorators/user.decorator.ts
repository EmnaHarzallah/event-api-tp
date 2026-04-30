import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  role: string;
}
//creer un decorateur pour extraire l'utilisateur authentifié de la requete (@GetUser() dans les controllers)
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Simulate user extraction (e.g. from a decoded JWT token)
    // Here we extract it from query or headers as an example
    return {
      id: (request.query.userId as string) || (request.headers['x-user-id'] as string) || 'Guest',
      role: (request.query.role as string) || (request.headers['x-role'] as string) || 'user',
    };
  },
);

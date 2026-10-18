import type { Request } from 'express';
import type { SessionUser } from './records';
import { object } from './content-validation';

export type ApiRequest = Request<Record<string, string>, unknown, unknown> & {
  user?: SessionUser | null;
};
export const requestBody = (req: ApiRequest): Record<string, unknown> =>
  object(req.body) ? req.body : {};

/** Only call after authenticated middleware. Fail closed if a route omits it. */
export function sessionUser(req: ApiRequest): SessionUser {
  if (!req.user) throw new Error('Authenticated route is missing a session.');
  return req.user;
}

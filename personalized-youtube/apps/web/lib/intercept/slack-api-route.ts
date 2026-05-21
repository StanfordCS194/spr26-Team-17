import { NextResponse } from 'next/server';
import { interceptUnavailable } from './api-response';
import { isSlackInterceptRuntimeAllowed, slackInterceptBlockedReason } from './slack-guard';

/** Block /api/slack/* when intercept is disabled (mock deploy or production without opt-in). */
export function slackRouteBlocked(): NextResponse | null {
  if (!isSlackInterceptRuntimeAllowed()) {
    return interceptUnavailable(slackInterceptBlockedReason(), 403);
  }
  return null;
}

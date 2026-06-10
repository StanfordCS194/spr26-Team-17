// Runtime guard: Slack intercept uses the operator's Chrome session — never expose on public deploy.

/** True when Slack API routes and live adapter may run (local dev / explicit opt-in). */
export function isSlackInterceptRuntimeAllowed(): boolean {
  const feed = (process.env.SHOWCASE_FEED_SOURCE ?? process.env.FEED_ADAPTER)?.toLowerCase();
  if (feed === 'mock') return false;
  if (process.env.NODE_ENV === 'production' && process.env.SLACK_INTERCEPT_ENABLED !== 'true') {
    return false;
  }
  return true;
}

export function slackInterceptBlockedReason(): string {
  return 'slack intercept disabled';
}

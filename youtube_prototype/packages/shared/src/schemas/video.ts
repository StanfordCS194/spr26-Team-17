import { z } from 'zod';

export const Channel = z.object({
  name: z.string(),
  avatar: z.string().url().or(z.string()),
  verified: z.boolean().default(false),
  subscriberCount: z.number().int().nonnegative().default(0),
});
export type Channel = z.infer<typeof Channel>;

export const Video = z.object({
  id: z.string(),
  title: z.string(),
  channel: Channel,
  thumbnail: z.string(),
  duration: z.string(),
  views: z.number().int().nonnegative(),
  postedAgo: z.string(),
  tags: z.array(z.string()).default([]),
  description: z.string().default(''),
  category: z.string(),
});
export type Video = z.infer<typeof Video>;

export const Short = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  views: z.number().int().nonnegative(),
  channel: Channel,
});
export type Short = z.infer<typeof Short>;

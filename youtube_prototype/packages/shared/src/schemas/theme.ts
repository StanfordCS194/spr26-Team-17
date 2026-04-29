import { z } from 'zod';

export const VideoCardDefaults = z.object({
  aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:4']).default('16:9'),
  thumbnailScale: z.number().min(0.5).max(2).default(1),
  titleWeight: z.number().int().min(100).max(900).default(500),
  channelNameWeight: z.number().int().min(100).max(900).default(400),
  showDescription: z.boolean().default(false),
  showViewCount: z.boolean().default(true),
  showPostedAgo: z.boolean().default(true),
  showDuration: z.boolean().default(true),
});
export type VideoCardDefaults = z.infer<typeof VideoCardDefaults>;

export const ThemeSchema = z.object({
  mode: z.enum(['light', 'dark']).default('light'),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FF0000'),
  fontScale: z.enum(['0.875', '1', '1.125', '1.25']).default('1'),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md'),
  videoCardDefaults: VideoCardDefaults.default({}),
});
export type Theme = z.infer<typeof ThemeSchema>;

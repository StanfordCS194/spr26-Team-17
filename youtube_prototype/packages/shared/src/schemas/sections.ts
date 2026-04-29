import { z } from 'zod';
import { Video, Short } from './video';

const baseSection = <T extends string, P extends z.ZodRawShape>(type: T, props: P) =>
  z.object({
    id: z.string(),
    type: z.literal(type),
    props: z.object(props),
  });

export const TopBar = baseSection('TopBar', {
  logoText: z.string().default('YouTube'),
  searchPlaceholder: z.string().default('Search'),
  compactSearch: z.boolean().default(false),
  showProfileChip: z.boolean().default(true),
});

export const Sidebar = baseSection('Sidebar', {
  collapsed: z.boolean().default(false),
  pinnedItems: z.array(z.string()).default(['Home', 'Shorts', 'Subscriptions', 'You']),
  showSubscriptions: z.boolean().default(true),
});

export const CategoryChips = baseSection('CategoryChips', {
  active: z.string().default('All'),
  chips: z.array(z.string()).default([
    'All', 'Music', 'Gaming', 'Live', 'News', 'Cooking', 'Comedy', 'Recently uploaded',
  ]),
});

export const VideoGrid = baseSection('VideoGrid', {
  columns: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).default(4),
  density: z.enum(['compact', 'cozy', 'comfortable']).default('cozy'),
  videos: z.array(Video).default([]),
});

export const RecommendedRow = baseSection('RecommendedRow', {
  headline: z.string().default('Recommended for you'),
  videos: z.array(Video).default([]),
});

export const ShortsRow = baseSection('ShortsRow', {
  visible: z.boolean().default(true),
  headline: z.string().default('Shorts'),
  shorts: z.array(Short).default([]),
});

export const ContinueWatchingRow = baseSection('ContinueWatchingRow', {
  visible: z.boolean().default(true),
  headline: z.string().default('Continue watching'),
  videos: z.array(Video).default([]),
});

export const FilterSummary = baseSection('FilterSummary', {
  visible: z.boolean().default(false),
  active: z.array(z.object({
    label: z.string(),
    kind: z.enum(['include', 'exclude', 'requireTag', 'blockChannel', 'sort']),
  })).default([]),
});

export const CustomNote = baseSection('CustomNote', {
  text: z.string().default(''),
  visible: z.boolean().default(false),
});

export const SectionSchema = z.discriminatedUnion('type', [
  TopBar,
  Sidebar,
  CategoryChips,
  VideoGrid,
  RecommendedRow,
  ShortsRow,
  ContinueWatchingRow,
  FilterSummary,
  CustomNote,
]);
export type Section = z.infer<typeof SectionSchema>;

export const SECTION_TYPES = [
  'TopBar', 'Sidebar', 'CategoryChips', 'VideoGrid', 'RecommendedRow',
  'ShortsRow', 'ContinueWatchingRow', 'FilterSummary', 'CustomNote',
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

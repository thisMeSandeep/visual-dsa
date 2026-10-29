/**
 * Every visualisation renderer the app has or will have (ALGORITHM-CATALOG §9). A scene names
 * the renderer that draws it, and each topic's meta names its main renderer.
 */
export const RENDERER_IDS = [
  // P0
  'array',
  'linked-list',
  'stack',
  'queue',
  'hash-table',
  'growth-chart',
  // P1
  'tree',
  'graph',
  'table',
  'call-stack',
  // P2
  'forest',
  'dp-table',
  'grid',
  'buckets',
] as const;

export type RendererId = (typeof RENDERER_IDS)[number];

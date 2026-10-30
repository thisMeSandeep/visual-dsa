/**
 * Renderer id → component (ARCHITECTURE §6.2). A topic that reuses an existing renderer needs
 * no viz code at all; new renderers are added here as their steps arrive (ALGORITHM-CATALOG §9).
 */
import type { ComponentType } from 'react';

import type { RendererId } from '@/engine/core/renderer';

import { AnalogyRenderer } from './analogy/renderer';
import { QueueRenderer } from './queue/renderer';
import { StackRenderer } from './stack/renderer';
import type { RendererProps } from './types';

export const RENDERERS: Partial<Record<RendererId, ComponentType<RendererProps>>> = {
  stack: StackRenderer,
  analogy: AnalogyRenderer,
  queue: QueueRenderer,
};

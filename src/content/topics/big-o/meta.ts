import type { TopicMeta } from '../../schema';

/** ALGORITHM-CATALOG F1 */
export const meta = {
  id: 'big-o',
  title: 'Big O Notation',
  summary: 'Describe how an algorithm’s work grows as its input grows.',
  category: 'foundations',
  priority: 'P0',
  renderer: 'growth-chart',
  glyph: 'big-o',
  chapters: [
    { id: 'why-growth', title: 'Why we measure growth' },
    { id: 'counting-steps', title: 'Counting steps' },
    { id: 'common-classes', title: 'The common classes' },
    { id: 'dropping-constants', title: 'Dropping constants' },
    { id: 'best-average-worst', title: 'Best, average and worst case' },
    { id: 'space', title: 'Space complexity' },
    { id: 'amortised', title: 'Amortised cost' },
  ],
  complexity: [
    { label: 'Constant', value: 'O(1)' },
    { label: 'Linear', value: 'O(n)' },
    { label: 'Quadratic', value: 'O(n²)' },
  ],
} satisfies TopicMeta;

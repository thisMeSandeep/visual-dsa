import type { SandboxConfig } from '../../schema';

/**
 * Big O Play mode (ALGORITHM-CATALOG F1 "Sandbox"): an n slider from 1 to 1,000 on a log scale,
 * and sample functions to run while a counter climbs to their curve. The catalog's per-class
 * toggles are the presets, each showing a set of curves.
 */
const ALL = ['constant', 'logarithmic', 'linear', 'linearithmic', 'quadratic', 'exponential'];

export const sandbox = [
  {
    topicId: 'big-o',
    id: 'growth',
    label: 'Growth',
    structure: 'big-o',
    operations: [
      {
        id: 'setN',
        label: 'n',
        input: 'slider',
        range: { param: 'n', min: 1, max: 1000, scale: 'log' },
      },
      { id: 'lookup', label: 'Lookup' },
      { id: 'loop', label: 'Loop' },
      { id: 'nested', label: 'Nested' },
      { id: 'halving', label: 'Halving' },
    ],
    presets: [
      {
        id: 'all',
        label: 'All six',
        input: { n: 8, curves: ALL },
        hint: 'Drag **n** and watch the curves pull apart. Run a loop to count its steps.',
      },
      {
        id: 'fast',
        label: 'Fast',
        input: { n: 100, curves: ['constant', 'logarithmic', 'linear'] },
        hint: 'The fast classes. Even at n = 1,000, log n is about 10. Try **Halving**.',
      },
      {
        id: 'slow',
        label: 'Slow',
        input: { n: 10, curves: ['linearithmic', 'quadratic', 'exponential'] },
        hint: 'The slow classes leave the chart quickly. Try **Nested** at a few sizes.',
      },
      {
        id: 'versus',
        label: 'n vs n²',
        input: { n: 20, curves: ['linear', 'quadratic'] },
        hint: 'Run **Loop**, then **Nested**. Double n and run them again.',
      },
    ],
    stats: [
      { label: 'n', key: 'n' },
      { label: 'Steps', key: 'steps' },
    ],
  },
] satisfies SandboxConfig[];

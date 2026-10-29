import { TOPIC_SANDBOXES } from './registry';
import type { SandboxConfig } from './schema';
import { validateSandboxes } from './validate';

const VALID: SandboxConfig = {
  topicId: 'stack',
  structure: 'stack',
  operations: [
    { id: 'push', label: 'Push', input: 'value' },
    { id: 'pop', label: 'Pop' },
  ],
  presets: [{ id: 'empty', label: 'Empty', input: { capacity: 3 }, hint: 'Try Pop.' }],
  stats: [{ label: 'Size', key: 'size' }],
};

const issues = (sandboxes: Record<string, unknown>) =>
  validateSandboxes(sandboxes).map((issue) => `${issue.path}: ${issue.message}`);

describe('sandbox validation', () => {
  it('accepts every registered sandbox', () => {
    expect(issues(TOPIC_SANDBOXES)).toEqual([]);
  });

  it('accepts a valid sandbox', () => {
    expect(issues({ stack: VALID })).toEqual([]);
  });

  it('reports schema problems and a wrong topic id', () => {
    expect(issues({ stack: { ...VALID, presets: [] } })).toEqual([
      expect.stringMatching(/^presets:/),
    ]);
    expect(issues({ queue: VALID })).toEqual([
      'topicId: Registered as "queue" but its topicId is "stack"',
    ]);
  });

  it('reports an unknown structure or operation', () => {
    expect(issues({ stack: { ...VALID, structure: 'heap' } })).toEqual([
      'structure: Unknown structure "heap"',
    ]);
    expect(
      issues({ stack: { ...VALID, operations: [{ id: 'shuffle', label: 'Shuffle' }] } }),
    ).toEqual(['operations.0.id: "stack" has no "shuffle"']);
  });

  it('reports a preset that does not build', () => {
    const preset = {
      id: 'over',
      label: 'Over',
      input: { values: ['1', '2'], capacity: 1 },
      hint: 'x',
    };
    expect(issues({ stack: { ...VALID, presets: [preset] } })).toEqual([
      expect.stringMatching(/^presets\.0: 2 values don't fit/),
    ]);
  });
});

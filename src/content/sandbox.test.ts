import { TOPIC_SANDBOXES } from './registry';
import type { SandboxConfig } from './schema';
import { validateSandboxes } from './validate';

const VALID: SandboxConfig = {
  topicId: 'stack',
  id: 'stack',
  label: 'Stack',
  structure: 'stack',
  operations: [
    { id: 'push', label: 'Push', input: 'value' },
    { id: 'pop', label: 'Pop' },
  ],
  presets: [{ id: 'empty', label: 'Empty', input: { capacity: 3 }, hint: 'Try Pop.' }],
  stats: [{ label: 'Size', key: 'size' }],
};

const CHECKER: SandboxConfig = {
  topicId: 'stack',
  id: 'brackets',
  label: 'Bracket checker',
  structure: 'brackets',
  operations: [{ id: 'check', label: 'Check', input: 'expression' }],
  presets: [{ id: 'balanced', label: 'Balanced', input: { expression: '(1)' }, hint: 'Check it.' }],
  stats: [{ label: 'Waiting', key: 'size' }],
};

const issues = (sandboxes: Record<string, unknown>) =>
  validateSandboxes(sandboxes).map((issue) => `${issue.path}: ${issue.message}`);

describe('sandbox validation', () => {
  it('accepts every registered sandbox', () => {
    expect(issues(TOPIC_SANDBOXES)).toEqual([]);
  });

  it('accepts one or more tools', () => {
    expect(issues({ stack: [VALID] })).toEqual([]);
    expect(issues({ stack: [VALID, CHECKER] })).toEqual([]);
  });

  it('reports schema problems, repeated tools and a wrong topic id', () => {
    expect(issues({ stack: [{ ...VALID, presets: [] }] })).toEqual([
      expect.stringMatching(/^0\.presets:/),
    ]);
    expect(issues({ stack: [VALID, VALID] })).toEqual([': Tool ids must be unique within a topic']);
    expect(issues({ queue: [VALID] })).toEqual([
      '0.topicId: Registered as "queue" but its topicId is "stack"',
    ]);
  });

  it('reports an unknown structure or operation, naming the tool', () => {
    expect(issues({ stack: [{ ...VALID, structure: 'heap' }] })).toEqual([
      '0.structure: Unknown structure "heap"',
    ]);
    expect(
      issues({ stack: [VALID, { ...CHECKER, operations: [{ id: 'shuffle', label: 'Shuffle' }] }] }),
    ).toEqual(['1.operations.0.id: "brackets" has no "shuffle"']);
  });

  it('reports a preset that does not build', () => {
    const preset = {
      id: 'over',
      label: 'Over',
      input: { values: ['1', '2'], capacity: 1 },
      hint: 'x',
    };
    expect(issues({ stack: [{ ...VALID, presets: [preset] }] })).toEqual([
      expect.stringMatching(/^0\.presets\.0: 2 values don't fit/),
    ]);
    const empty = { id: 'empty', label: 'Empty', input: { expression: '' }, hint: 'x' };
    expect(issues({ stack: [{ ...CHECKER, presets: [empty] }] })).toEqual([
      expect.stringMatching(/^0\.presets\.0: "expression" must be a non-empty string/),
    ]);
  });
});

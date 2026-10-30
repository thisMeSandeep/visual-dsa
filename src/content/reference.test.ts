import { TOPIC_IDS, TOPIC_REFERENCES } from './registry';
import { validateReferences } from './validate';

const issues = (references: Record<string, unknown>) =>
  validateReferences(references).map((issue) => `${issue.path}: ${issue.message}`);

describe('reference sheets', () => {
  it('accepts every registered sheet', () => {
    expect(issues(TOPIC_REFERENCES)).toEqual([]);
  });

  it('gives every MVP topic a sheet with at least one table (F-802)', () => {
    for (const id of TOPIC_IDS) {
      const blocks = TOPIC_REFERENCES[id]?.tabs.flatMap((tab) => tab.blocks) ?? [];
      expect(blocks.some((block) => block.kind === 'table')).toBe(true);
    }
  });

  it('reports a sheet under the wrong topic, a ragged table and repeated tab ids', () => {
    const stack = TOPIC_REFERENCES.stack!;
    expect(issues({ queue: stack })).toEqual([
      'topicId: Registered as "queue" but its topicId is "stack"',
    ]);
    const ragged = {
      topicId: 'stack',
      tabs: [
        { id: 'a', title: 'A', blocks: [{ kind: 'table', columns: ['x', 'y'], rows: [['1']] }] },
        { id: 'a', title: 'B', blocks: [{ kind: 'text', text: 'Hi' }] },
      ],
    };
    expect(issues({ stack: ragged })).toEqual([
      'tabs.0.blocks.0: Every table row needs one cell per column',
      'tabs: Tab ids must be unique',
    ]);
  });
});

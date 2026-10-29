import { TOPICS, TOPIC_IDS, getTopicMeta, isTopicId, topicsByCategory } from './registry';
import { LessonRecipeSchema, QuizSchema, ReferenceSchema, type TopicMeta } from './schema';
import { validateContent, validateTopicMetas } from './validate';

const validMeta: TopicMeta = {
  id: 'stack',
  title: 'Stack',
  summary: 'Last in, first out.',
  category: 'linear',
  priority: 'P0',
  renderer: 'stack',
  glyph: 'stack',
  chapters: [{ id: 'lifo', title: 'Last in, first out' }],
  complexity: [{ label: 'Push', value: 'O(1)' }],
};

const messages = (metas: Record<string, unknown>) =>
  validateTopicMetas(metas).map((issue) => `${issue.path}: ${issue.message}`);

describe('registered content', () => {
  it('is valid', () => {
    expect(validateContent()).toEqual([]);
  });

  it('registers the seven MVP topics in Home order', () => {
    expect(TOPICS.map((topic) => topic.id)).toEqual(TOPIC_IDS);
    expect(TOPIC_IDS).toHaveLength(7);
    expect(TOPICS.every((topic) => topic.priority === 'P0')).toBe(true);
  });
});

describe('registry lookups', () => {
  it('recognises topic ids', () => {
    expect(isTopicId('hash-table')).toBe(true);
    expect(isTopicId('heap')).toBe(false);
  });

  it('returns undefined for an unknown topic', () => {
    expect(getTopicMeta('hash-table')?.title).toBe('Hash Table');
    expect(getTopicMeta('not-a-topic')).toBeUndefined();
  });

  it('groups topics by category, keeping order', () => {
    expect(topicsByCategory().map((group) => group.category)).toEqual([
      'foundations',
      'linear',
      'hashing',
    ]);
  });
});

describe('meta validation catches broken content', () => {
  it('accepts a valid meta', () => {
    expect(messages({ stack: validMeta })).toEqual([]);
  });

  it('rejects a missing field', () => {
    const { title: _title, ...noTitle } = validMeta;
    expect(messages({ stack: noTitle })).toEqual([expect.stringMatching(/^title:/)]);
  });

  it('rejects an unknown category and renderer', () => {
    const issues = messages({ stack: { ...validMeta, category: 'misc', renderer: 'canvas' } });
    expect(issues).toEqual([
      expect.stringMatching(/^category:/),
      expect.stringMatching(/^renderer:/),
    ]);
  });

  it('rejects ids that are not kebab-case', () => {
    expect(
      messages({ stack: { ...validMeta, chapters: [{ id: 'Last In', title: 'x' }] } }),
    ).toEqual([expect.stringMatching(/^chapters\.0\.id: Use a kebab-case id/)]);
  });

  it('rejects duplicate chapter ids', () => {
    const chapters = [validMeta.chapters[0], validMeta.chapters[0]];
    expect(messages({ stack: { ...validMeta, chapters } })).toEqual([
      expect.stringMatching(/Chapter ids must be unique/),
    ]);
  });

  it('rejects unknown keys', () => {
    expect(messages({ stack: { ...validMeta, colour: 'blue' } })).toHaveLength(1);
  });

  it('rejects a meta registered under the wrong id', () => {
    expect(messages({ queue: validMeta })).toEqual([
      'id: Registered as "queue" but its id is "stack"',
    ]);
  });
});

describe('lesson, quiz and reference schemas', () => {
  it('requires a lesson to start with a chapter', () => {
    const recipe = { topicId: 'stack', segments: [{ kind: 'say', caption: 'Hello' }] };
    expect(LessonRecipeSchema.safeParse(recipe).success).toBe(false);
    expect(
      LessonRecipeSchema.safeParse({
        ...recipe,
        segments: [{ kind: 'chapter', chapterId: 'lifo' }, ...recipe.segments],
      }).success,
    ).toBe(true);
  });

  it('requires a quiz answer to be one of the options', () => {
    const question = {
      id: 'pop-returns',
      kind: 'multiple-choice',
      prompt: 'What does pop() return?',
      explanation: 'Pop removes and returns the top item.',
      options: [
        { id: 'top', text: 'The top item' },
        { id: 'bottom', text: 'The bottom item' },
      ],
      answer: 'top',
    };
    expect(QuizSchema.safeParse({ topicId: 'stack', questions: [question] }).success).toBe(true);
    expect(
      QuizSchema.safeParse({ topicId: 'stack', questions: [{ ...question, answer: 'middle' }] })
        .success,
    ).toBe(false);
  });

  it('requires one cell per column in reference tables', () => {
    const table = { kind: 'table', columns: ['Operation', 'Time'], rows: [['Push', 'O(1)']] };
    const reference = (rows: string[][]) => ({
      topicId: 'stack',
      tabs: [{ id: 'info', title: 'Info', blocks: [{ ...table, rows }] }],
    });
    expect(ReferenceSchema.safeParse(reference(table.rows)).success).toBe(true);
    expect(ReferenceSchema.safeParse(reference([['Push']])).success).toBe(false);
  });
});

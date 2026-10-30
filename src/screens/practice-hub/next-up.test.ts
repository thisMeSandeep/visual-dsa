import { nextUp } from './next-up';

const quiz = (topicId: string, score?: { best: number; total: number }) => ({
  topicId,
  questions: 10,
  score,
});

describe('nextUp', () => {
  it('suggests revising missed questions first, naming each topic once', () => {
    expect(
      nextUp([{ topicId: 'stack' }, { topicId: 'queue' }, { topicId: 'stack' }], [quiz('stack')]),
    ).toEqual({ kind: 'revise', count: 3, topicIds: ['stack', 'queue'] });
  });

  it('then the first quiz not tried, in Home order', () => {
    expect(
      nextUp([], [quiz('big-o', { best: 9, total: 9 }), quiz('array'), quiz('stack')]),
    ).toEqual({ kind: 'try', topicId: 'array', questions: 10 });
  });

  it('then the lowest score as a share of its quiz, ignoring perfect ones', () => {
    expect(
      nextUp(
        [],
        [
          quiz('big-o', { best: 9, total: 9 }),
          quiz('array', { best: 6, total: 9 }),
          quiz('stack', { best: 6, total: 10 }),
        ],
      ),
    ).toEqual({ kind: 'improve', topicId: 'stack', best: 6, total: 10 });
  });

  it('says so when every quiz is perfect', () => {
    expect(nextUp([], [quiz('stack', { best: 10, total: 10 })])).toEqual({ kind: 'all-perfect' });
  });
});

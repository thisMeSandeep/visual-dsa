import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useLessonNavigation } from '@/stores/lesson-navigation';
import { useProgress } from '@/stores/progress';

import { Chapters } from '.';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

describe('Chapters sheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLessonNavigation.getState().clearChapterRequest();
    useProgress.setState({ topics: {}, lastTopicId: undefined });
  });

  it('lists the lesson’s chapters, numbered as on the Topic screen, with the current one marked', async () => {
    await render(<Chapters topicId="stack" current="push-pop-peek" />);
    expect(
      screen.getByRole('button', { name: 'Chapter 1, Last in, first out, not started' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Chapter 2, Push, pop and peek, in progress' }),
    ).toBeSelected();
    expect(
      screen.getByRole('button', { name: 'Chapter 6, Overflow and underflow, not started' }),
    ).toBeOnTheScreen();
  });

  it('asks the lesson to jump to the picked chapter, then closes', async () => {
    await render(<Chapters topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: /Overflow and underflow/ }));
    expect(useLessonNavigation.getState().chapterRequest).toEqual({
      topicId: 'stack',
      chapterId: 'overflow-underflow',
    });
    expect(router.back).toHaveBeenCalled();
  });

  it('marks finished chapters', async () => {
    useProgress.setState({ topics: { stack: { completedChapters: ['lifo'] } } });
    await render(<Chapters topicId="stack" current="push-pop-peek" />);
    expect(
      screen.getByRole('button', { name: 'Chapter 1, Last in, first out, completed' }),
    ).toBeOnTheScreen();
  });
});

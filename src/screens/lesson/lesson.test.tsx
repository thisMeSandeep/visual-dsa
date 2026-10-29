import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useLessonNavigation } from '@/stores/lesson-navigation';
import { useProgress } from '@/stores/progress';
import { DEFAULT_SETTINGS, useSettings } from '@/stores/settings';

import { Lesson } from '.';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
// The Skia canvas can't run in Jest; it's checked visually on device.
jest.mock('@/viz/scene-view', () => ({ SceneView: () => null }));

const caption = (text: string) => screen.getByText(text);
const INTRO = 'A stack is a pile: you add to the top and take from the top. This one holds 4.';

/** The app renders inside GestureHandlerRootView; so do these tests. */
const renderLesson = (element: React.ReactElement) =>
  render(element, { wrapper: GestureHandlerRootView });

describe('Lesson player', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettings.setState(DEFAULT_SETTINGS);
    useProgress.setState({ topics: {}, lastTopicId: undefined });
  });

  it('opens on the first step with its caption and position', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    expect(caption(INTRO)).toBeOnTheScreen();
    expect(screen.getByText('Last in, first out')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Step 1 of \d+$/)).toBeOnTheScreen();
  });

  it('steps forward and back', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Next step' }));
    expect(caption('Push 23. First, check there’s room on the stack.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Previous step' }));
    expect(caption(INTRO)).toBeOnTheScreen();
  });

  it('switches between play and pause', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Play' })).toBeOnTheScreen();
  });

  it('cycles the playback speed and remembers it as the default', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Playback speed' }));
    expect(screen.getByText('1.5×')).toBeOnTheScreen();
    expect(useSettings.getState().defaultSpeed).toBe(1.5);
  });

  it('starts at the speed and code language saved in Settings', async () => {
    useSettings.setState({ defaultSpeed: 0.5, codeLanguage: 'javascript' });
    await renderLesson(<Lesson topicId="stack" />);
    expect(screen.getByText('0.5×')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Show code' }));
    expect(screen.getByRole('tab', { name: 'JavaScript', selected: true })).toBeOnTheScreen();
  });

  it('seeks with the scrubber’s accessibility actions', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    const scrubber = screen.getByRole('adjustable');
    await fireEvent(scrubber, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(screen.getByLabelText(/^Step 2 of \d+$/)).toBeOnTheScreen();
  });

  it('opens the chapter sheet with the current chapter', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Chapters' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/topic/[topicId]/chapters',
      params: { topicId: 'stack', current: 'lifo' },
    });
  });

  it('jumps to a chapter picked in the sheet', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await act(async () => {
      useLessonNavigation.getState().requestChapter('stack', 'overflow-underflow');
    });
    expect(
      caption('A fixed-size stack can run out of room, and any stack can run out of items.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Overflow and underflow')).toBeOnTheScreen();
    expect(useLessonNavigation.getState().chapterRequest).toBeNull();
  });

  it('can start at a chapter', async () => {
    await renderLesson(<Lesson topicId="stack" chapter="push-pop-peek" />);
    expect(
      caption('Three operations, all at the top: push adds, pop removes, peek only looks.'),
    ).toBeOnTheScreen();
  });

  it('shows the code with the current line following the steps', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Show code' }));
    expect(screen.getByRole('button', { name: 'Hide code', selected: true })).toBeOnTheScreen();
    // The intro step runs no code, so nothing is highlighted yet.
    expect(screen.queryByLabelText(/^Current line/)).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Next step' }));
    expect(
      screen.getByLabelText(/^Current line, line \d+: +if top is capacity - 1 then$/),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'JavaScript' }));
    expect(useSettings.getState().codeLanguage).toBe('javascript');
    expect(
      screen.getByLabelText(
        /^Current line, line \d+: +if \(this\.items\.length === this\.capacity\) \{$/,
      ),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Hide code' }));
    expect(screen.queryByRole('tab', { name: 'JavaScript' })).toBeNull();
  });

  it('saves where the learner is, and completes a chapter at its last step', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    expect(useProgress.getState()).toMatchObject({
      lastTopicId: 'stack',
      topics: { stack: { last: { chapterId: 'lifo', offset: 0 }, completedChapters: [] } },
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Next step' }));
    expect(useProgress.getState().topics.stack?.last).toEqual({ chapterId: 'lifo', offset: 1 });

    // The lifo chapter ends at step 8.
    const scrubber = screen.getByRole('adjustable');
    for (let i = 0; i < 6; i++) {
      await fireEvent(scrubber, 'accessibilityAction', {
        nativeEvent: { actionName: 'increment' },
      });
    }
    expect(screen.getByLabelText(/^Step 8 of \d+$/)).toBeOnTheScreen();
    expect(useProgress.getState().topics.stack?.completedChapters).toEqual(['lifo']);
  });

  it('resumes at the saved step', async () => {
    useProgress.setState({
      topics: { stack: { completedChapters: [], last: { chapterId: 'push-pop-peek', offset: 2 } } },
    });
    await renderLesson(<Lesson topicId="stack" />);
    expect(screen.getByLabelText(/^Step 11 of \d+$/)).toBeOnTheScreen();
    expect(screen.getByText('Push, pop and peek')).toBeOnTheScreen();
  });

  it('opens a step from a deep link, ahead of the saved position', async () => {
    useProgress.setState({
      topics: { stack: { completedChapters: [], last: { chapterId: 'push-pop-peek', offset: 2 } } },
    });
    await renderLesson(<Lesson topicId="stack" step={2} />);
    expect(caption('Push 23. First, check there’s room on the stack.')).toBeOnTheScreen();
  });

  it('explains when a topic has no lesson yet', async () => {
    await renderLesson(<Lesson topicId="queue" />);
    expect(screen.getByText(/written in a later step/)).toBeOnTheScreen();
  });
});

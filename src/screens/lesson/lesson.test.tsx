import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useLessonNavigation } from '@/stores/lesson-navigation';

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
  beforeEach(() => jest.clearAllMocks());

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

  it('cycles the playback speed', async () => {
    await renderLesson(<Lesson topicId="stack" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Playback speed' }));
    expect(screen.getByText('1.5×')).toBeOnTheScreen();
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
    expect(caption('Push 17. First, check there’s room on the stack.')).toBeOnTheScreen();
    expect(screen.getByText('Overflow and underflow')).toBeOnTheScreen();
    expect(useLessonNavigation.getState().chapterRequest).toBeNull();
  });

  it('can start at a chapter', async () => {
    await renderLesson(<Lesson topicId="stack" chapter="push-pop-peek" />);
    expect(caption('Pop. First, check the stack isn’t empty.')).toBeOnTheScreen();
  });

  it('explains when a topic has no lesson yet', async () => {
    await renderLesson(<Lesson topicId="queue" />);
    expect(screen.getByText(/written in a later step/)).toBeOnTheScreen();
  });
});

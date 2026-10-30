import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { config } from '@/config';
import { DEFAULT_SETTINGS, useSettings } from '@/stores/settings';

import { Sandbox } from '.';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
// The Skia canvas can't run in Jest; it's checked visually on device.
jest.mock('@/viz/scene-view', () => ({ SceneView: () => null }));

const renderSandbox = (topicId = 'stack') =>
  render(<Sandbox topicId={topicId} />, { wrapper: GestureHandlerRootView });

const stat = (label: string, value: string) => screen.getByLabelText(`${label}: ${value}`);
const press = (name: string | RegExp) => fireEvent.press(screen.getByRole('button', { name }));
const valueField = () => screen.getByLabelText(/^Value/);
const preset = (name: string) => fireEvent.press(screen.getByRole('radio', { name }));

/** Plays the current trace to its last step. */
const playToEnd = () =>
  act(async () => {
    jest.advanceTimersByTime(config.player.baseStepMs * 10);
  });

describe('Sandbox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useSettings.setState(DEFAULT_SETTINGS);
  });
  afterEach(() => jest.useRealTimers());

  it('opens on the first preset, with its hint and stats', async () => {
    await renderSandbox();
    expect(
      screen.getByText('A stack with room for 5. Push a number, or pop the top.'),
    ).toBeOnTheScreen();
    expect(stat('Size', '3')).toBeOnTheScreen();
    expect(stat('Capacity', '5')).toBeOnTheScreen();
    expect(stat('Top', '42')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'A few items', checked: true })).toBeOnTheScreen();
  });

  it('pushes a typed value, plays the steps, and can undo it', async () => {
    await renderSandbox();
    await fireEvent.changeText(valueField(), '7');
    await press('Push');
    await playToEnd();

    expect(screen.getByText('7 goes on top. It’s the new top.')).toBeOnTheScreen();
    expect(stat('Size', '4')).toBeOnTheScreen();
    expect(stat('Top', '7')).toBeOnTheScreen();
    expect(valueField().props.value).toBe('');

    await press('Undo');
    expect(screen.getByText('Undone: back to before the last change.')).toBeOnTheScreen();
    expect(stat('Size', '3')).toBeOnTheScreen();
  });

  it('explains invalid input and runs nothing', async () => {
    await renderSandbox();
    await press('Push');
    expect(screen.getByText('Type a number first, or tap Random.')).toBeOnTheScreen();

    await fireEvent.changeText(valueField(), '120');
    await press('Push');
    expect(screen.getByText('120 is outside the range 0–99.')).toBeOnTheScreen();
    expect(stat('Size', '3')).toBeOnTheScreen();

    // Typing again clears the message.
    await fireEvent.changeText(valueField(), '12');
    expect(screen.queryByText('120 is outside the range 0–99.')).toBeNull();
  });

  it('fills in a random value in range', async () => {
    await renderSandbox();
    await press('Random value');
    const value = Number(valueField().props.value);
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(config.engine.valueRange.min);
    expect(value).toBeLessThanOrEqual(config.engine.valueRange.max);
  });

  it('loads a preset and shows an underflow as a canvas step', async () => {
    await renderSandbox();
    await preset('Empty');
    expect(screen.getByText('An empty stack. Try Pop to see an underflow.')).toBeOnTheScreen();
    expect(stat('Size', '0')).toBeOnTheScreen();
    expect(stat('Top', '–')).toBeOnTheScreen();

    await press('Pop');
    await playToEnd();
    expect(
      screen.getByText('The stack is empty, so there’s nothing to pop. That’s an underflow.'),
    ).toBeOnTheScreen();
  });

  it('resets to the loaded preset', async () => {
    await renderSandbox();
    await preset('Full');
    await press('Pop');
    await playToEnd();
    expect(stat('Size', '4')).toBeOnTheScreen();

    await press('Reset');
    expect(screen.getByText('A full stack. Try Push to see an overflow.')).toBeOnTheScreen();
    expect(stat('Size', '5')).toBeOnTheScreen();
  });

  it('says when a topic has no sandbox yet', async () => {
    await renderSandbox('array');
    expect(screen.getByText(/arrives with its topic/)).toBeOnTheScreen();
  });

  it('switches to the bracket checker, with the preset expression ready to check', async () => {
    await renderSandbox();
    await fireEvent.press(screen.getByRole('radio', { name: 'Bracket checker' }));

    expect(screen.getByRole('radio', { name: 'Bracket checker', checked: true })).toBeOnTheScreen();
    expect(screen.getByLabelText('Expression').props.value).toBe('((5+3)+1)(2+9)');
    expect(
      screen.getByText('Every bracket has a partner. Tap Check to watch the stack match them.'),
    ).toBeOnTheScreen();

    await press('Check');
    await playToEnd();
    expect(
      screen.getByText(
        'The end, and the stack is empty: every bracket found its partner. Balanced.',
      ),
    ).toBeOnTheScreen();
  });

  it('checks any expression the learner types, and explains a bad one', async () => {
    await renderSandbox();
    await fireEvent.press(screen.getByRole('radio', { name: 'Bracket checker' }));

    await fireEvent.changeText(screen.getByLabelText('Expression'), '  ');
    await press('Check');
    expect(screen.getByText('Type an expression first, or pick a preset.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Expression'), '[ ( ] )');
    await press('Check');
    await playToEnd();
    expect(screen.getByLabelText('Expression').props.value).toBe('[(])');
    expect(screen.getByText('] can’t close the ( on top. Unbalanced.')).toBeOnTheScreen();
  });

  it('fills the field from the Unbalanced preset', async () => {
    await renderSandbox();
    await fireEvent.press(screen.getByRole('radio', { name: 'Bracket checker' }));
    await preset('Unbalanced');
    expect(screen.getByLabelText('Expression').props.value).toBe('(()');
  });
});

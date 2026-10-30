import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { config } from '@/config';
import { TOPIC_SANDBOXES } from '@/content/registry';
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

  it('runs array operations from an index field and a value field', async () => {
    await renderSandbox('array');
    const indexField = () => screen.getByLabelText('Index');
    await fireEvent.changeText(indexField(), '1');
    await fireEvent.changeText(valueField(), '99');
    await press('Insert');
    await playToEnd();
    expect(stat('Size', '5')).toBeOnTheScreen();
    expect(stat('Capacity', '8')).toBeOnTheScreen();
    // The value is used up; the index stays for the next operation.
    expect(valueField().props.value).toBe('');
    expect(indexField().props.value).toBe('1');

    await press('Get');
    await playToEnd();
    expect(screen.getByText(/^Index 1 holds 99\./)).toBeOnTheScreen();
  });

  it('explains a missing index and a missing value together', async () => {
    await renderSandbox('array');
    await press('Set');
    expect(screen.getByText('Type an index first, like 2.')).toBeOnTheScreen();
    expect(screen.getByText('Type a number first, or tap Random.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('inserts after a typed node in a linked list, and switches to the tail-pointer tool', async () => {
    await renderSandbox('singly-linked-list');
    expect(stat('Head', '12')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^Tail:/)).toBeNull();

    await press('Add after');
    expect(screen.getByText('Type the node to insert next to, like 7.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Node'), '7');
    await fireEvent.changeText(valueField(), '21');
    await press('Add after');
    await playToEnd();
    expect(stat('Size', '4')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Head and tail' }));
    expect(stat('Tail', '30')).toBeOnTheScreen();
  });

  it('puts a typed key and value into a hash table, and explains a bad key', async () => {
    await renderSandbox('hash-table');
    expect(stat('Keys', '3')).toBeOnTheScreen();
    const keyField = () => screen.getByLabelText('Key');

    await fireEvent.changeText(keyField(), 'R2D2');
    await press('Get');
    expect(screen.getByText('Keys are names made of letters, like Sid.')).toBeOnTheScreen();

    await fireEvent.changeText(keyField(), 'Kat');
    await fireEvent.changeText(valueField(), '9');
    await press('Put');
    await playToEnd();
    expect(stat('Keys', '4')).toBeOnTheScreen();
    expect(stat('Load', '0.57')).toBeOnTheScreen();
  });

  it('runs a Big O sample, and moves n with the slider once it settles', async () => {
    await renderSandbox('big-o');
    expect(stat('n', '8')).toBeOnTheScreen();
    await press('Loop');
    await playToEnd();
    expect(stat('Steps', '8')).toBeOnTheScreen();

    const slider = screen.getByTestId('slider-n');
    await fireEvent(slider, 'valueChange', config.sandbox.sliderPositions);
    expect(screen.getByText('n = 1000')).toBeOnTheScreen();
    await act(async () => {
      jest.advanceTimersByTime(config.sandbox.sliderSettleMs);
    });
    expect(stat('n', '1000')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
  });

  it('says when a topic has no sandbox yet', async () => {
    // Every MVP topic has a sandbox; take one away to see what a later topic shows.
    const missing = jest.replaceProperty(TOPIC_SANDBOXES, 'big-o', undefined);
    try {
      await renderSandbox('big-o');
      expect(screen.getByText(/arrives with its topic/)).toBeOnTheScreen();
    } finally {
      missing.restore();
    }
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

  it('sorts the numbers in the field, filled from a preset or typed', async () => {
    await renderSandbox('insertion-sort');
    const field = () => screen.getByLabelText('Numbers to sort');
    expect(field().props.value).toBe('29 10 14 37 13 5 42 21');

    await preset('Sorted');
    expect(field().props.value).toBe('4 12 19 27 33 41 48 56');

    await fireEvent.changeText(field(), '3, 1 2');
    await press('Sort');
    await playToEnd();
    expect(field().props.value).toBe('3 1 2');
    expect(screen.getByText('Sorted! Comparisons: 3. Shifts: 2.')).toBeOnTheScreen();

    await fireEvent.changeText(field(), '7');
    await press('Sort');
    expect(
      screen.getByText('Type at least 2 numbers, so there’s something to sort.'),
    ).toBeOnTheScreen();

    await press('Random numbers');
    expect(field().props.value.split(' ')).toHaveLength(config.structures.sorting.randomCount);
  });
});

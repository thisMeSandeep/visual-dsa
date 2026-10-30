import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { config } from '@/config';

import { CodePanel } from './code-panel';
import type { CodePanelSample } from './types';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }));

const SAMPLE: CodePanelSample = {
  source: 'push(value) {\n  items.push(value);\n}\n',
  lines: [
    [
      ['push', 'name'],
      ['(value) {', 'plain'],
    ],
    [
      ['  items.', 'plain'],
      ['push', 'name'],
      ['(value);', 'plain'],
    ],
    [['}', 'plain']],
  ],
  lineIds: { push: [1] },
};

const renderPanel = (props: Partial<React.ComponentProps<typeof CodePanel>> = {}) =>
  render(
    <CodePanel
      sample={SAMPLE}
      language="javascript"
      onLanguageChange={jest.fn()}
      lineId="push"
      {...props}
    />,
  );

describe('CodePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows each line and marks the current one', async () => {
    await renderPanel();
    expect(screen.getByLabelText('line 1: push(value) {')).toBeOnTheScreen();
    expect(screen.getByLabelText('Current line, line 2:   items.push(value);')).toBeOnTheScreen();
  });

  it('highlights nothing for a step without a code line', async () => {
    await renderPanel({ lineId: undefined });
    expect(screen.queryByLabelText(/^Current line/)).toBeNull();
  });

  it('offers every configured language and reports a switch', async () => {
    const onLanguageChange = jest.fn();
    await renderPanel({ onLanguageChange });
    expect(screen.getByRole('tab', { name: 'JavaScript', selected: true })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Pseudocode' }));
    expect(onLanguageChange).toHaveBeenCalledWith('pseudocode');
    expect(screen.getAllByRole('tab')).toHaveLength(config.app.codeLanguages.length);
    // Short names on the tabs, full names for screen readers.
    expect(screen.getByRole('tab', { name: 'C++' })).toBeOnTheScreen();
    expect(screen.getByText('JS')).toBeOnTheScreen();
  });

  it('shows the step’s variables, marking the ones that changed', async () => {
    await renderPanel({ vars: { i: '3', top: '42' }, previousVars: { i: '2', top: '42' } });
    expect(screen.getByLabelText('Variables: i is 3, top is 42')).toBeOnTheScreen();
  });

  it('keeps the watch row when a step has no variables', async () => {
    await renderPanel();
    expect(screen.getByLabelText('No variables at this step')).toBeOnTheScreen();
  });

  it('copies the code and confirms it for a moment', async () => {
    jest.useFakeTimers();
    await renderPanel();
    await fireEvent.press(screen.getByRole('button', { name: 'Copy code' }));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(SAMPLE.source);
    expect(screen.getByRole('button', { name: 'Copied' })).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(config.code.copiedFeedbackMs);
    });
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeOnTheScreen();
    jest.useRealTimers();
  });
});

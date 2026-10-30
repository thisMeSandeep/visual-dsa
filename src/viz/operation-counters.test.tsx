import { render, screen } from '@testing-library/react-native';

import { OperationCounters } from './operation-counters';

const ZERO = { comparisons: 0, swaps: 0, reads: 0, writes: 0 };

describe('OperationCounters', () => {
  it('shows only the counters that have counted something', async () => {
    await render(
      <OperationCounters
        counters={{ ...ZERO, comparisons: 3, reads: 2 }}
        previous={{ ...ZERO, comparisons: 2, reads: 2 }}
      />,
    );
    expect(screen.getByText('comparisons 3')).toBeOnTheScreen();
    expect(screen.getByText('reads 2')).toBeOnTheScreen();
    expect(screen.queryByText(/swaps/)).toBeNull();
    expect(screen.getByLabelText('3 comparisons, 2 reads')).toBeOnTheScreen();
  });

  it('shows nothing before anything is counted', async () => {
    await render(<OperationCounters counters={ZERO} />);
    expect(screen.queryByText(/comparisons/)).toBeNull();
  });
});

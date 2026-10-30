import { render, screen } from '@testing-library/react-native';

import { Legend } from '.';

describe('Legend sheet', () => {
  it('explains each group of states, and the other marks on the canvas', async () => {
    await render(<Legend />);
    expect(screen.getByRole('header', { name: 'Legend' })).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Look here: Orange means/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Error: .*dashed/)).toBeOnTheScreen();
    expect(screen.getByText(/A note on an orange chip/)).toBeOnTheScreen();
  });
});

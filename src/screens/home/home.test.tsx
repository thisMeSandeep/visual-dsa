import { render, screen } from '@testing-library/react-native';

import { Home } from '.';

describe('Home', () => {
  it('renders', async () => {
    await render(<Home />);
    expect(screen.getByTestId('home-screen')).toBeOnTheScreen();
  });
});

import { render, screen } from '@testing-library/react-native';

import { Icon } from './icon';
import { ICON_NAMES } from './icons';
import { GLYPH_NAMES, TopicGlyph } from './topic-glyph';

describe('Icon', () => {
  it.each(ICON_NAMES)('renders "%s"', async (name) => {
    await render(<Icon name={name} />);
  });

  it('is announced with its label when it carries meaning', async () => {
    await render(<Icon name="done" tone="success" label="Completed" />);
    expect(screen.getByLabelText('Completed')).toBeOnTheScreen();
  });

  it('is hidden from screen readers when decorative', async () => {
    await render(<Icon name="play" />);
    expect(screen.queryByRole('image')).toBeNull();
  });
});

describe('TopicGlyph', () => {
  it.each(GLYPH_NAMES)('renders "%s"', async (glyph) => {
    await render(<TopicGlyph glyph={glyph} category="linear" />);
  });
});

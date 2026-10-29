import { render, screen } from '@testing-library/react-native';

import { AppText, TEXT_VARIANTS, appTextClassName } from './app-text';

const classes = (className: string) => className.split(' ');
const count = (className: string, prefix: string) =>
  classes(className).filter((c) => c.startsWith(prefix)).length;

describe('appTextClassName', () => {
  it('uses the variant defaults', () => {
    expect(appTextClassName({ variant: 'display' })).toBe('font-sans-bold text-display text-ink');
    expect(appTextClassName({ variant: 'index' })).toBe('font-mono text-index text-muted');
  });

  it('defaults to body', () => {
    expect(appTextClassName()).toBe('font-sans text-body text-ink');
  });

  it('lets weight and tone override the defaults', () => {
    expect(appTextClassName({ variant: 'body', weight: 'medium', tone: 'primary' })).toBe(
      'font-sans-medium text-body text-primary',
    );
  });

  it('falls back to medium for bold mono, which is not loaded', () => {
    expect(appTextClassName({ variant: 'code', weight: 'bold' })).toContain('font-mono-medium');
  });

  it('appends layout classes last', () => {
    expect(appTextClassName({ variant: 'label' }, 'mt-2 flex-1')).toBe(
      'font-sans text-label text-muted mt-2 flex-1',
    );
  });

  it.each(TEXT_VARIANTS)('%s has exactly one family class and one colour class', (variant) => {
    const className = appTextClassName({ variant });
    expect(count(className, 'font-')).toBe(1);
    const toneClasses = classes(className).filter(
      (c) => c.startsWith('text-') && !c.startsWith(`text-${variant}`),
    );
    expect(toneClasses).toHaveLength(1);
  });
});

describe('AppText', () => {
  it('renders its text', async () => {
    await render(<AppText variant="caption">Two keys in one bucket is a collision.</AppText>);
    expect(screen.getByText('Two keys in one bucket is a collision.')).toBeOnTheScreen();
  });
});

import { config } from '.';

describe('config', () => {
  it('is frozen so values cannot be changed at runtime', () => {
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('offers the default code language', () => {
    expect(config.app.codeLanguages).toContain(config.app.defaultCodeLanguage);
  });
});

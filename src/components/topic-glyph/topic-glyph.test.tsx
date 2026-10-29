import { TOPICS } from '@/content/registry';

import { GLYPH_NAMES } from './glyphs';

describe('topic glyphs', () => {
  it.each(TOPICS.map((topic) => [topic.id, topic.glyph]))(
    '%s uses a glyph that exists (%s)',
    (_, glyph) => {
      expect(GLYPH_NAMES).toContain(glyph);
    },
  );
});

import { render } from '@testing-library/react-native';

import { TOPIC_IDS } from '@/content/registry';

import { TopicArt } from '.';
import { DRAWINGS } from './drawings';

describe('topic art', () => {
  it.each(TOPIC_IDS)('has a drawing for %s', (topicId) => {
    expect(DRAWINGS[topicId]).toBeDefined();
  });

  it('draws a topic with the category accent', async () => {
    const { toJSON } = await render(<TopicArt topicId="stack" category="linear" glyph="stack" />);
    expect(JSON.stringify(toJSON())).toContain('LIFO');
  });

  it('falls back to the glyph for a topic without a drawing', async () => {
    const { toJSON } = await render(<TopicArt topicId="heap" category="trees" glyph="stack" />);
    expect(JSON.stringify(toJSON())).not.toContain('LIFO');
    expect(toJSON()).not.toBeNull();
  });
});

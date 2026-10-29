/**
 * bun run validate:content
 *
 * Checks every topic against the content schemas, plus two things the schemas can't see:
 * every folder under src/content/topics is registered, and every glyph name exists.
 * Exits with code 1 when anything is wrong, so CI fails before broken content ships.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { GLYPH_NAMES } from '@/components/topic-glyph/glyphs';
import { TOPIC_IDS, TOPIC_METAS } from '@/content/registry';
import { validateContent, type ContentIssue } from '@/content/validate';

const TOPICS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'topics');

const registered = new Set<string>(TOPIC_IDS);
const glyphs = new Set<string>(GLYPH_NAMES);

const unregisteredFolders: ContentIssue[] = readdirSync(TOPICS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !registered.has(entry.name))
  .map((entry) => ({
    topicId: entry.name,
    path: '',
    message:
      'Folder exists in src/content/topics but is not in TOPIC_IDS (src/content/registry.ts)',
  }));

const unknownGlyphs: ContentIssue[] = Object.entries(TOPIC_METAS)
  .filter(([, meta]) => !glyphs.has(meta.glyph))
  .map(([topicId, meta]) => ({
    topicId,
    path: 'glyph',
    message: `No glyph named "${meta.glyph}". Known glyphs: ${GLYPH_NAMES.join(', ')}`,
  }));

const issues = [...validateContent(), ...unregisteredFolders, ...unknownGlyphs];

if (issues.length > 0) {
  console.error(`✗ Content has ${issues.length} problem(s):\n`);
  for (const issue of issues) {
    const where = issue.path ? `${issue.topicId} › ${issue.path}` : issue.topicId;
    console.error(`  ${where}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`✓ ${TOPIC_IDS.length} topics valid`);

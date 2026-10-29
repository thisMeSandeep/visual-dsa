/**
 * bun run validate:content
 *
 * Checks every topic against the content schemas and compiles every lesson, plus what content
 * alone can't see: every folder under src/content/topics is registered, every glyph name exists,
 * and every lesson scene exists with one caption per step.
 * Exits with code 1 when anything is wrong, so CI fails before broken content ships.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { GLYPH_NAMES } from '@/components/topic-glyph/glyphs';
import { TOPIC_IDS, TOPIC_LESSONS, TOPIC_METAS, TOPIC_QUIZZES } from '@/content/registry';
import { validateContent, type ContentIssue } from '@/content/validate';
import { SCENES } from '@/viz/scenes';

import { sceneIssues } from './lib/check-scenes';

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

const issues = [
  ...validateContent(),
  ...unregisteredFolders,
  ...unknownGlyphs,
  ...sceneIssues(TOPIC_LESSONS, SCENES),
];

if (issues.length > 0) {
  console.error(`✗ Content has ${issues.length} problem(s):\n`);
  for (const issue of issues) {
    const where = issue.path ? `${issue.topicId} › ${issue.path}` : issue.topicId;
    console.error(`  ${where}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `✓ ${TOPIC_IDS.length} topics valid, ${Object.keys(TOPIC_LESSONS).length} lesson(s) compiled, ` +
    `${Object.keys(TOPIC_QUIZZES).length} quiz(zes) checked`,
);

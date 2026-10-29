/**
 * bun run highlight
 *
 * Tokenises every code sample in src/content/topics/<topic>/code/ with Shiki and writes
 * src/content/generated/code-tokens.json (ARCHITECTURE §5.3). The app renders those tokens as
 * native text, so no highlighter ships to the device. Colours are not taken from Shiki: each
 * token gets a role (keyword, string…) and the code panel colours roles from tokens.css.
 *
 * Runs after `bun install` and before `start` and `validate:content`. Run it by hand after
 * editing a sample while Metro is running. Exits with code 1 when a sample is broken.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';

import { createHighlighter, type BundledLanguage } from 'shiki';

import { config, type CodeLanguage } from '@/config';
import type { CodeSample, CodeSamples, CodeToken } from '@/content/code-types';

import { mergeTokens, PSEUDOCODE_GRAMMAR, roleOf, stripLineMarkers } from './lib/code-tokens';

const ROOT = join(import.meta.dirname, '..');
const TOPICS_DIR = join(ROOT, 'src', 'content', 'topics');
const OUTPUT = join(ROOT, 'src', 'content', 'generated', 'code-tokens.json');

/** File extension and Shiki grammar for each language the app offers. */
const LANGUAGES: Record<CodeLanguage, { extension: string; grammar: string }> = {
  pseudocode: { extension: '.pseudo', grammar: PSEUDOCODE_GRAMMAR.name },
  javascript: { extension: '.js', grammar: 'javascript' },
};

/** Shiki needs a theme to tokenise. Its colours are never used, so any theme will do. */
const THEME = 'min-light';

const highlighter = await createHighlighter({
  themes: [THEME],
  langs: [PSEUDOCODE_GRAMMAR, 'javascript'],
});

function tokenise(code: string, grammar: string): CodeToken[][] {
  const { tokens } = highlighter.codeToTokens(code, {
    // Shiki's types list only its built-in grammars; the pseudocode grammar is loaded above.
    lang: grammar as BundledLanguage,
    theme: THEME,
    includeExplanation: 'scopeName',
  });
  return tokens.map((line) =>
    mergeTokens(
      line.flatMap((token) =>
        (token.explanation ?? [{ content: token.content, scopes: [] }]).map((piece): CodeToken => [
          piece.content,
          roleOf(piece.scopes.map((scope) => scope.scopeName)),
        ]),
      ),
    ),
  );
}

const languageOf = (extension: string) =>
  config.app.codeLanguages.find((language) => LANGUAGES[language].extension === extension);

const problems: string[] = [];
const samples: Record<string, Partial<Record<CodeLanguage, CodeSample>>> = {};

for (const topic of readdirSync(TOPICS_DIR, { withFileTypes: true })) {
  const codeDir = join(TOPICS_DIR, topic.name, 'code');
  if (!topic.isDirectory() || !existsSync(codeDir)) continue;

  const topicSamples: Partial<Record<CodeLanguage, CodeSample>> = {};
  for (const file of readdirSync(codeDir)) {
    const path = relative(ROOT, join(codeDir, file));
    const language = languageOf(extname(file));
    if (!language) {
      problems.push(`${path}: unknown extension; use one of the languages in config.app`);
      continue;
    }
    if (topicSamples[language]) {
      problems.push(`${path}: a second ${language} sample; each topic has one per language`);
      continue;
    }

    try {
      const { code, lineIds } = stripLineMarkers(readFileSync(join(codeDir, file), 'utf8'));
      const lines = tokenise(code, LANGUAGES[language].grammar);
      if (lines.length !== code.split('\n').length) {
        throw new Error('the highlighter returned a different number of lines');
      }
      topicSamples[language] = { source: `${code}\n`, lines, lineIds };
    } catch (error) {
      problems.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const language of config.app.codeLanguages) {
    if (!topicSamples[language]) {
      problems.push(
        `${relative(ROOT, codeDir)}: no ${language} sample (${LANGUAGES[language].extension})`,
      );
    }
  }
  samples[topic.name] = topicSamples;
}

if (problems.length > 0) {
  console.error(`✗ Code samples have ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

const output: CodeSamples = samples;
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(output)}\n`);
console.log(
  `✓ Highlighted code for ${Object.keys(samples).length} topic(s) → ${relative(ROOT, OUTPUT)}`,
);

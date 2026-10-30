# IMPLEMENTATION PLAN

A step-by-step build plan for Visual-DSA. It follows [ARCHITECTURE.md](./ARCHITECTURE.md), uses the stack in [TECH-STACK.md](./TECH-STACK.md) and the look in [VISUAL-SPEC.md](./VISUAL-SPEC.md), and delivers the features in [FEATURE.md](./FEATURE.md) and the topics in [ALGORITHM-CATALOG.md](./ALGORITHM-CATALOG.md).

## How to use this plan

- **One step = one reviewable change.** Each step ends in a working app (or a passing test suite) and a suggested commit message.
- **You commit.** After each step, review the changes and commit them yourself with the message given (adjusted if the step changed). Nothing is committed automatically.
- **Order matters.** Phases build on each other. The first end-to-end milestone (an animated Stack lesson) arrives at the end of Phase 4, so the riskiest part, the engine-to-canvas pipeline, is proven early.
- **Feature IDs** (F-xxx) link each step to FEATURE.md.
- **Testing happens in Expo Go on your phone.** Every "Done when" check means running `bun run start` (or `bun run start:tunnel` when the phone is on another network), scanning the QR code, and checking it on the device. There are no simulators or development builds. Each library is checked against Expo Go when it's installed (TECH-STACK §1).
- **No hard-coded values.** Colours, fonts and sizes come from `src/theme/tokens.css`, and tunable constants come from `src/config/`. Lint enforces this from Step 0.3 onward (ARCHITECTURE §9).
- **Before Step 0.1:** the project folder is not a Git repository yet. Run `git init` once before your first commit.

### Skills used per phase
| Steps | Skills |
|---|---|
| 0.1–0.3 | `expo-overview`, `expo-project-structure` |
| 1.1–1.2 | `uniwind`, `expo-design-system` |
| 1.3–1.4, 2.3 | `expo-design-system`, `expo-native-ui`, `expo-ui`, `vercel-react-native-skills` |
| 2.1 | `expo-router` |
| 4.1–4.4, 10.1 | `expo-animation`, `vercel-react-native-skills` |
| 6.1 | `expo-ui` (settings controls) |
| 9.5 | `dataviz` (growth chart) |
| 10.3–10.6 | `eas-app-stores`, `eas-update`, `eas-observe`, `eas-workflows` |

---

## Phase 0: Project setup

### Step 0.1: Scaffold the Expo app
**Goal:** a clean Expo SDK 58 TypeScript app with the `src/` layout.
- Create the app with `bun create expo-app` (SDK 58) in the project root, keeping `docs/` and `Dsa images/`.
- Move routes to `src/app/`, set the `@/*` → `src/*` path alias, and turn on TypeScript `strict`.
- Remove the template's demo screens and assets.
- Add ESLint (`eslint-config-expo`) and Prettier, plus `lint`, `typecheck` and `format` scripts.

**Done when:** the app opens to a blank screen in Expo Go on your phone, and `bun run lint` and `bun run typecheck` pass.

**Commit:**
```
chore: scaffold Expo SDK 58 app with TypeScript and src/ layout
```

### Step 0.2: App config for Expo Go
**Goal:** the app is configured and runs reliably in Expo Go.
- Configure `app.json`: name "Visual-DSA", scheme `visualdsa`, orientation `default` (portrait + landscape, F-106). Android edge-to-edge is always on in SDK 58, so it needs no setting.
- Confirm your phone's Expo Go supports SDK 58. `start` runs `expo start --go`, which shows the QR code; `start:tunnel` is for when the phone and computer aren't on the same network.
- Editor settings for Zed (`.zed/settings.json`): Prettier formats on save.
- No `expo-dev-client` and no `eas.json` yet. EAS is set up for release builds in Step 10.3.

**Done when:** the app opens in Expo Go on your phone and rotates between portrait and landscape. The custom `visualdsa://` scheme only works in real builds (Expo Go uses `exp://` links), so it's checked in Step 10.3.

**Commit:**
```
chore: configure app.json for Expo Go development
```

### Step 0.3: Folder skeleton, config module, lint rules and Jest
**Goal:** the architecture's folders and rules exist before any code goes in them.
- Create `src/{screens,components,viz,engine,content,stores,theme,config,hooks,utils}` and `scripts/` (ARCHITECTURE §3).
- Create `src/config/` with the `config` object and its first files (`app.ts`, `features.ts`). The other config files are added in the step that first needs them.
- ESLint import boundaries: `engine/` may import only `config/`, not React, React Native or other app folders; `viz/` must not import `content/`; only UI folders may import `theme/` (ARCHITECTURE §3).
- ESLint no-hard-coding rules (ARCHITECTURE §9.3): no colour literals outside `src/theme/`, no arbitrary Tailwind values, and `no-magic-numbers` outside `config/`, `theme/`, `content/` and tests.
- Set up Jest with `jest-expo` and React Native Testing Library, with one smoke test, and a `test` script. Run it with `bun run test`; `bun test` would start Bun's own runner instead.

**Done when:** `bun run test` passes, and lint fails on each of these: importing `react` in `src/engine/`, a `#3554D9` literal in a component, and a magic number in a screen.

**Commit:**
```
chore: add folder skeleton, config module, lint rules and Jest
```

---

## Phase 1: Design foundation

### Step 1.1: Uniwind and colour tokens
**Goal:** every colour from VISUAL-SPEC §2 is available as a token, in light and dark.
- Install and configure Uniwind (free) with Tailwind CSS v4: Metro plugin, and a `global.css` that only imports Tailwind, Uniwind and `src/theme/tokens.css`.
- In `tokens.css`, define the neutral, semantic, category and mode colours as `@variant light` / `@variant dark` blocks with the same variable names, including the `*-soft` tints (VISUAL-SPEC §2).
- Add the spacing and radius tokens (`@theme`), and the TS-only sizes (`@theme static`).
- `src/theme/index.ts`: typed token access (`useColor`, `useVizSizes`…) wrapping `useCSSVariable` / `Uniwind.getCSSVariable`.
- Theme override via `Uniwind.setTheme` (system / light / dark), held in memory for now; it gets persisted in Step 6.1.

**Done when:** a test screen switches every token between light and dark in Expo Go, and changing one hex value in `tokens.css` updates the app with no code change.

**Commit:**
```
feat(theme): add Uniwind with Visual-DSA colour tokens
```

### Step 1.2: Fonts and type scale
**Goal:** Atkinson Hyperlegible everywhere, with the VISUAL-SPEC §3 type scale. *(Done. The UI rework later switched to Manrope + JetBrains Mono, registered under role names so `src/theme/fonts.ts` is the only file that names a font.)*
- Install `@expo-google-fonts/atkinson-hyperlegible-next` and `@expo-google-fonts/atkinson-hyperlegible-mono` (Next 400/500/700, Mono 400/500).
- Load the fonts at runtime with `useFonts` in the root layout (no config plugin, so it works in Expo Go), and keep the splash screen up until they're ready.
- Add `--font-*` tokens (one per weight, matching the registered family names) and the type-scale tokens to `tokens.css`, giving text styles `display`, `title`, `caption`, `body`, `label`, `overline`, `value`, `code`…, used through an `<AppText>` component (variant, weight and tone props)

**Done when:** the test screen shows each text style in the right font, with tabular figures in Mono.

**Commit:**
```
feat(theme): load Atkinson Hyperlegible fonts and type scale
```

### Step 1.3: Icons and topic glyphs
**Goal:** one consistent way to draw icons.
- Install `phosphor-react-native`. Create `components/icons.ts`, which re-exports each icon from its own file (TECH-STACK §7b).
- Build the `<Icon>` wrapper with a size scale (18/20/22/24), token colours, and regular/fill weights.
- Build the custom topic glyphs (array, linked list, stack, queue, hash table, Big O curve) on the 24 grid in their category colours.

**Done when:** all icons and glyphs render in both themes, and the bundle includes only the icons we import.

**Commit:**
```
feat(ui): add Phosphor icon wrapper and topic glyphs
```

### Step 1.4: Base components
**Goal:** the shared components from VISUAL-SPEC §6.
- Button (primary, primary tinted, mode, pill, round icon, step, play), with press scale and haptics.
- Chip, ProgressBar (bar and segmented), StatStrip, TopicRow, ChapterRow, ContinueCard, Scrubber (visual only), FeedbackPanel.
- A dev-only `/dev/components` route that shows every component in both themes.

**Done when:** the components page matches the concept canvas in both themes, and all touch targets are at least 44pt.

**Commit:**
```
feat(ui): add base components from the visual spec
```

---

## Phase 2: Navigation and content shell

### Step 2.1: Routes and tabs
**Goal:** the full route map from ARCHITECTURE §8, with placeholder screens.
- `(tabs)` layout: Learn, Practice, Progress, Settings, with Phosphor tab icons (fill when active). *(After Step 10.1 the Progress tab was removed until it has real content: Learn, Practice, Settings.)*
- `topic/[topicId]` stack: index, learn, play, practice. The chapters and reference routes open as form sheets.
- Route files only read params and render a screen from `src/screens/`.

**Done when:** every route opens, the back gestures work, and the sheets present natively.

**Commit:**
```
feat(nav): add tab and topic routes with placeholder screens
```

### Step 2.2: Content schemas, registry and validator
**Goal:** topics are typed, validated data.
- Install Zod. Write `content/schema.ts` for TopicMeta, LessonRecipe, Quiz and Reference (ARCHITECTURE §4.3).
- Add `meta.ts` for the 7 MVP topics (titles, categories, chapters, complexity strips).
- Add `content/registry.ts` with lazy loaders, and `scripts/validate-content.ts` with a `validate:content` script.

**Done when:** `bun run validate:content` passes, and fails on a deliberately broken meta file.

**Commit:**
```
feat(content): add content schemas, topic registry and validator
```

### Step 2.3: Home and Topic screens
**Goal:** real Home and Topic detail screens built from content (F-101, F-102).
- Home: "Learn" title, a "Start here" card for the first topic (it becomes the Continue card once progress exists in Step 6.2), topics grouped by category using TopicRow with glyphs. The streak chip waits for real streak data (Step 13.4), so no invented numbers are shown.
- Topic detail: back and reference-sheet buttons, category overline, title, summary, stat strip, Start/Continue lesson + Sandbox / Practice buttons, chapter list. Unknown topic ids show a "Topic not found" state. The bookmark button arrives with bookmarks (P1).
- Home is a FlashList (it grows to 38 topics). Progress comes from a `useTopicProgress` hook that reports "not started" until the progress store exists (Step 6.2).

**Done when:** you can go from Home to any MVP topic's detail screen, and both screens match the concept canvas.

**Commit:**
```
feat(screens): build Home and Topic detail screens
```

---

## Phase 3: Engine core

### Step 3.1: Types, tracer, limits and RNG
**Goal:** the engine foundation from ARCHITECTURE §4–5.
- `engine/core/types.ts`: Scene, SceneElement, ElementState, Step, Caption, Trace.
- `engine/core/tracer.ts`: holds the model, calls `toScene` on each `step()`, counts comparisons/swaps/reads/writes, and records line ids, vars and captions.
- `engine/core/limits.ts` (2,000 steps per trace, size caps) and `engine/core/rng.ts` (seeded).
- Unit tests for all of the above.

**Done when:** the tests pass, the engine has no React imports, and the same seed always produces the same trace.

**Commit:**
```
feat(engine): add scene/step types, tracer, limits and seeded RNG
```

### Step 3.2: Player state machine
**Goal:** pure playback rules (ARCHITECTURE §5.5).
- `engine/player/machine.ts`: states `paused`, `playing`, `awaiting-input` and `ended`; actions `play`, `pause`, `next`, `prev`, `seek`, `setSpeed`, `tick` and `answer`.
- Unit tests for bounds, pause points and speed changes.

**Done when:** every transition in the diagram is covered by a test.

**Commit:**
```
feat(engine): add player state machine
```

### Step 3.3: Stack structure
**Goal:** the first real structure. Stack is the simplest, so it proves the pattern.
- `engine/structures/stack/`: model, `push`/`pop`/`peek`/`clear` with tracing, `toScene`, `describe`, plus overflow and underflow as error steps.
- Tests check the results and the trace shape (step count, states, line ids).

**Done when:** the tests pass, including overflow, underflow and an empty stack.

**Commit:**
```
feat(engine): implement traced stack operations
```

---

## Phase 4: Visualisation vertical slice (Stack)

### Step 4.1: Skia canvas and id-based animation
**Goal:** the viz pipeline from ARCHITECTURE §6.2.
- Install `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-worklets` and `react-native-gesture-handler`.
- `viz/canvas/`: `VizCanvas` plus `useAnimatedElements` (shared values per element id; enter, exit, move and restyle).
- `viz/state-style.ts`: maps ElementState to token names, resolved through `src/theme`.
- Extend `src/config/motion.ts` (it already holds press feedback from Step 1.4) with step durations, springs and the reduced-motion fade, and use it for every transition.
- Load the Atkinson fonts into Skia, and respect reduced motion.

**Done when:** a demo scene animates smoothly between two snapshots in Expo Go on your phone. Expo Go runs in development mode, so final frame-rate checks happen on a release build in Step 10.4.

**Commit:**
```
feat(viz): add Skia canvas with id-based step animation
```

### Step 4.2: Stack renderer
**Goal:** draw stack scenes exactly as in VISUAL-SPEC §7.
- `viz/renderers/stack/layout.ts` (pure, with tests) and `renderer.tsx`: U-container, items, `top` pointer, state colours.
- Register it in `viz/renderers/registry.ts`.

**Done when:** a push/pop trace renders and animates correctly, including the error state.

**Commit:**
```
feat(viz): add stack renderer
```

### Step 4.3: Player store
**Goal:** per-instance playback state (ARCHITECTURE §6.1).
- Install Zustand. Extend `src/config/player.ts` (it already holds speeds, default speed and pause-at-chapter-end from Step 3.2) with the base step duration and swipe threshold.
- Write `stores/create-player-store.ts`, which wraps the machine and runs the step timer at `config.player.baseStepMs / speed`.
- Add selector hooks for the current step, status and progress.

**Done when:** play, pause, speed and seek drive the canvas, and two stores run independently.

**Commit:**
```
feat(player): add per-instance player store with step timer
```

### Step 4.4: Lesson player screen
**Goal:** the lesson screen from the concept canvas (F-201, F-202, F-205, F-401, F-402, F-403).
- Header (close, title/chapter, chapters button), canvas, `caption` text with bold terms, scrubber, controls (speed, previous, play/pause, next, code placeholder).
- Swipe left/right to step, and a chapters sheet that jumps to a chapter.
- Wire it to a hard-coded Stack trace.

**Done when:** a Stack trace plays end to end with play, pause, step, scrub and speed controls. ✅ **Milestone: first animated lesson.**

**Commit:**
```
feat(lesson): build lesson player screen
```

---

## Phase 5: Lessons and code

### Step 5.1: Lesson compiler
**Goal:** lessons are recipes compiled into steps (ARCHITECTURE §5.4).
- `engine/lesson/compile.ts`: handles chapter, setup, trace, say, scene, interactive and predict segments, and captions that override the engine's. A `setup` segment creates the structure a lesson works on (it replaces the trace's old `from` option). It produces the `CompiledLesson` type from Step 4.4, and `getLesson()` switches from the hard-coded `stack-demo.ts` to compiled recipes (then delete the demo). The Stack demo becomes the first content recipe (`content/topics/stack/lesson.ts`), and `validate:content` compiles every lesson.
- Compiled-lesson snapshot tests, and memoisation on device.

**Done when:** a recipe compiles into the right steps and chapter index, and snapshots catch changes.

**Commit:**
```
feat(engine): add lesson compiler
```

### Step 5.2: Code pipeline and code panel
**Goal:** a synced code highlight (F-501, F-502 MVP, F-505, F-506).
- Install Shiki as a dev dependency. `scripts/highlight-code.ts` strips `@line` markers and outputs tokens and line ids per language.
- `viz/code-panel/`: native text spans, the current line in `signal-soft`, a language switch (pseudocode and JavaScript), and copy via `expo-clipboard`.
- The panel docks below the canvas in portrait and beside it in landscape, and can be collapsed.
- The Stack code samples (pseudocode and JavaScript, with `@line` markers) are written here so the panel has real code to follow; `validate:content` checks every line id a lesson uses is marked in every language.

**Done when:** the highlighted line follows the animation in both languages, and copy works.

**Commit:**
```
feat(code): add Shiki code pipeline and synced code panel
```

### Step 5.3: Stack lesson content
**Goal:** the complete Stack topic lesson (ALGORITHM-CATALOG L5).
- The 6-chapter recipe, plus the browser back button example (an analogy scene in `viz/scenes/`, drawn by the new `analogy` renderer) and the balanced parentheses example (a real bracket-checker trace, `brackets.check`, drawn by the stack renderer with the expression above the stack).
- `isBalanced` added to the Stack code samples, so the code panel follows the bracket checker too.
- The implementations chapter is captions over the array-backed stack for now; a side-by-side array vs linked-list picture can follow once the linked-list renderer exists (Step 9.3).

**Done when:** the whole lesson plays from the Topic screen, and content validation passes.

**Commit:**
```
content(stack): add stack lesson, examples and code
```

---

## Phase 6: Persistence and progress

### Step 6.1: Persisted stores and Settings
**Goal:** settings and progress survive restarts (F-1101–F-1104, F-1108).
- Install `expo-sqlite`. Write `stores/storage.ts` (an `expo-sqlite/kv-store` adapter for Zustand `persist`), and add `src/config/storage.ts` (keys and schema versions).
- `settings` store (theme, code language, default speed, haptics, reduced motion) and `progress` store, both with `version` and `migrate`.
- The splash screen waits for hydration.
- Settings screen built with `@expo/ui` controls: `Picker` for theme, code language, speed and reduced motion (speeds are a fixed list, so a picker rather than a slider), and `Switch` for haptics (shown once `config.features.haptics` is on). *(The UI rework later replaced the pickers with in-app segmented controls.)*
- The lesson player starts at the saved speed and code language, and changing either in a lesson saves it.

**Done when:** settings persist across app restarts, and the theme override works.

**Commit:**
```
feat(stores): add persisted settings and progress stores
```

### Step 6.2: Progress tracking and resume
**Goal:** "Continue where you left off" (F-104, F-1001).
- Record chapter completion and the last position (chapter id + offset). A chapter is complete when the learner reaches its last step.
- Home's Continue card and the topic progress counts read real data. `learn?step=N` deep links work. A lesson opened without a chapter or step resumes; stopping on a chapter's last step resumes at the next chapter.

**Done when:** you can quit mid-lesson, relaunch, and resume at the same step.

**Commit:**
```
feat(progress): track lesson progress and resume where you left off
```

---

## Phase 7: Sandbox

### Step 7.1: Sandbox framework with Stack
**Goal:** Play mode (F-601, F-602, F-603, F-606).
- `SandboxSession`: current model, history, undo and reset (ARCHITECTURE §6.4).
- Sandbox screen: canvas, stat strip, value input (Zod-validated), random value, operation buttons, and presets from content.
- Errors (overflow, underflow) are shown as canvas error steps.
- Each topic's Play mode is content (`content/topics/<topic>/sandbox.ts`: operations, presets with hints, stats), checked by `validate:content`.

**Done when:** you can push, pop, peek, undo, reset and load every preset, and invalid input is explained.

**Commit:**
```
feat(sandbox): add sandbox sessions with stack operations
```

### UI rework (done, between Steps 7.1 and 7.2)
Done outside the numbered steps, after testing on a phone; the commits are the `feat(ui)`, `feat(home)`, `feat(lesson)` and `refactor(theme)` ones after Step 7.1.
- Fonts: Manrope + JetBrains Mono, registered by role in `src/theme/fonts.ts` (the only file that names a typeface).
- Colour classes fixed: `--color-*: initial` had stopped Uniwind generating any colour class; lint now bans Tailwind's default palette instead.
- Home: a two-column grid of topic cards with hand-drawn line art; no Continue card. Floating capsule tab bar with a sliding pill.
- No Topic screen: a topic opens its lesson directly. The lesson is landscape and full screen (status and navigation bars hidden), with a top bar (speed, code, progress bar, chapters, reference, sandbox, practice), a chapter side panel and a hideable scrubber. The Reference sheet holds the summary and complexity.
- Sandbox: portrait with one compact dock; inputs stay above the keyboard (react-native-keyboard-controller).
- Settings: segmented controls for choices, native switches for on/off; the progress bar is a setting.

### Step 7.2: Bracket checker mini-tool
**Goal:** the Stack sandbox's "check your own expression" tool (ALGORITHM-CATALOG L5).
- An expression input on the Stack sandbox that runs `brackets.check` on what the learner types, with the balanced `((5+3)+1)(2+9)` and unbalanced `(()` presets. It fits the sandbox dock (the presets segmented control and the field with an accessory).
- The sandbox config gains an expression input kind; invalid expressions (empty, too long, too many brackets) are explained like values.
- Built as a second sandbox **tool**: a topic's sandbox is now a list of tools, with a switch in the dock when there's more than one.

**Done when:** any expression up to the length limit can be checked step by step, and both presets load.

**Commit:**
```
feat(sandbox): add bracket checker mini-tool to the stack sandbox
```

---

## Phase 8: Practice

### Step 8.1: Topic quizzes
**Goal:** practice questions with explanations (F-701, F-704, F-705, F-706).
- Question types: multiple choice, true/false, complexity.
- Quiz screen: segmented progress, option tiles, feedback panel (correct and wrong states), and a "see in lesson" link. It opens from the lesson's top bar (Practice) and from the Practice tab.
- Scores go to the progress store, and wrong answers go to the revise list on the Practice tab.
- Write the Stack quiz (at least 8 questions).

**Done when:** a full Stack quiz runs, its score is saved, and missed questions appear in the revise list.

**Commit:**
```
feat(practice): add topic quizzes with explanations and revise list
```

### Step 8.2: Predict the next step *(P1, deferred: skipped for now, done after Phase 9 or after the MVP)*
**Goal:** pause the animation and ask what happens next (F-702).
- The player enters `awaiting-input` at `predict` steps. The learner taps an element or option, and the answer is checked against the next step's scene.
- Add predict questions inline in the Stack lesson and in its quiz.

**Done when:** a predict question pauses playback, checks the answer, and continues.

**Commit:**
```
feat(practice): add predict-the-next-step questions
```

---

## Phase 9: Remaining MVP topics

Each topic step includes: the engine structure with tests → renderer (if new) with layout tests → lesson recipe and code → sandbox operations and presets → quiz (at least 8 questions). Follow ARCHITECTURE §13.

### Step 9.1: Queue
- Engine: enqueue, dequeue, front and circular buffer. Renderer: `queue` with front/rear pointers and a wrap-around view. Lesson L6, including the printer queue example.
- Sandbox: two tools, **Circular** and **Plain array** (the catalog's circular-buffer toggle), with capacity set by the presets.

**Commit:**
```
feat(queue): add queue engine, renderer, lesson, sandbox and quiz
```

### Step 9.2: Array
- Engine: get, set, push, insert, removeAt, search, dynamic resize. Renderer: `array` with indices, shifting and pointer labels. Lesson L1.
- Also: the sandbox gains `index` and `index-value` inputs (an Index field and a button grid), scenes gain a `source` slot for the old array while one grows, and the canvas fit animates so a growing drawing zooms out smoothly.

**Commit:**
```
feat(array): add array engine, renderer, lesson, sandbox and quiz
```

### Step 9.3: Linked lists (singly and doubly)
- Engine: insert at head/tail/after/before, delete, search, reverse, and backward traversal. Renderer: `linked-list` with single and double arrows and a tail-pointer toggle. Lessons L2 and L3.
- Also: one pointer-based engine serves both lists; a node being linked in or out is raised above the row (a `link` slot in scenes). The sandbox key field takes a node (`target-value` input) as well as an index.

**Commit:**
```
feat(linked-list): add singly and doubly linked lists with lessons and quizzes
```

### Step 9.4: Hash table
- Engine: put, get, remove, chaining, linear probing, tombstones, load factor and resize, plus selectable hash functions. Renderer: `hash-table` with buckets, chains, probe arrows and tombstones. Lesson H1 (10 chapters), including the phone book example.
- Also: a `callout` drawable (`h("Sid") = 288`), an `old` flag on bucket slots for the table being resized away from, and a Key field in the sandbox (`key` and `key-value` inputs).

**Commit:**
```
feat(hash-table): add hash table with chaining, probing, lesson and quiz
```

### Step 9.5: Big O
- Renderer: `growth-chart` with the user's `n` marker, drawn on our own canvas (no Victory Native: see TECH-STACK §9). Sandbox: the `n` slider and sample functions with live step counts. Lesson F1.
- Also: a validated sequential `curve-1…6` colour ramp, the engine's `foundations/` folder, an `@expo/ui` slider in the sandbox dock (`slider` input, log scale), and even button rows.

**Commit:**
```
feat(big-o): add growth chart, Big O lesson, sandbox and quiz
```

### Step 9.6: Reference sheets
- Reference sheet for every MVP topic: tabs, complexity table, key concepts and pitfalls (F-801–F-803). It opens from the lesson's top bar (there's no separate topic screen since the UI rework), and keeps today's summary and "How it scales" strip at the top.
- Also: a `heading` block for sub-headings inside a tab; `validate:content` checks every sheet.

**Commit:**
```
feat(reference): add reference sheets for MVP topics
```

---

## Phase 10: Polish and release

### Step 10.1: Counters and legend
- Live operation counters on the canvas (F-902), the state legend sheet, and the inline legend for states in the current step (F-306).
- Built as: a row above the lesson canvas (counters left, inline legend right) so neither covers the drawing; counters under the sandbox's stat chips; swatches painted from `STATE_PAINT`; the legend sheet at `/topic/[topicId]/legend`. Memory used (F-902) waits for a memory counter in the engine.

**Commit:**
```
feat(lesson): add operation counters and state legend
```

### Step 10.2: Accessibility and landscape pass
- Screen-reader announcements of each step's `a11y` summary, Dynamic Type, reduced motion, a contrast check against VISUAL-SPEC §9, touch targets, and landscape layouts for every screen (F-106, F-1104, F-1105).

**Commit:**
```
fix(a11y): accessibility and landscape layout pass
```

### Step 10.3: EAS setup and first preview build
This is the first time the app leaves Expo Go.
- Add `eas.json` with `preview` and `production` profiles, then link the project with `eas init`.
- App icon, splash screen and themed system bars. *(The icon and splash were made early, after Step 10.1: see VISUAL-SPEC §5 "App icon and splash". Check them on the preview build.)*
- Build an internal `preview` build and install it on your phone.

**Done when:** the preview build installs from the EAS link, behaves the same as in Expo Go, and a `visualdsa://` deep link opens the app.

**Commit:**
```
chore(release): add EAS config, app icon and splash
```

### Step 10.4: Performance on a release build
- Add EAS Observe (it needs a real build, so it isn't available in Expo Go).
- Profile the lessons on the preview build against the ARCHITECTURE §12 budgets, and fix any hot spots.

**Commit:**
```
perf: add EAS Observe and tune canvas performance
```

### Step 10.5: CI and E2E tests
- EAS Workflows: on each PR run lint, typecheck, Jest and content validation. On merge, build a preview and run Maestro in the cloud (open a topic → play the lesson → open the sandbox → take the quiz). No local simulator is needed. Details in TESTING.md.

**Commit:**
```
ci: add EAS workflows with lint, tests and Maestro E2E
```

### Step 10.6: Release candidate
- EAS Update channels (`preview`, `production`), store listing metadata, and the build shared with testers.

**Done when:** testers can install the build, and an over-the-air update reaches it. ✅ **Milestone: MVP release candidate.**

**Commit:**
```
chore(release): add update channels and store metadata
```

---

## After the MVP

The order follows ALGORITHM-CATALOG §10. Each topic uses the same recipe as Phase 9.

### v1.1: Searching, sorting and comparison
| Step | Work | Commit |
|---|---|---|
| 11.1 | Binary search (A1) on the array renderer | `feat(binary-search): add binary search lesson, sandbox and quiz` |
| 11.2 | Bubble, selection and insertion sort (A2–A4), as three separate topics | `feat(sorting): add bubble, selection and insertion sort` |
| 11.3 | Merge and quick sort (A5, A6), as two separate topics | `feat(sorting): add merge sort and quick sort` |
| 11.4 | Compare mode and race mode (F-901, F-904). *Skipped for now, after 11.3; to be done later* | `feat(compare): add side-by-side compare and race modes` |
| 11.5 | Two pointers and sliding window (A9, A10), as two separate topics | `feat(patterns): add two pointers and sliding window` |
| 11.6 | Recursion with the call-stack renderer (F2, F-504) | `feat(recursion): add recursion lesson and call stack view` |
| 11.7 | Python, Java and C++ code, live variables, haptics (F-502, F-503, F-307) | `feat(code): add more languages, live variables and haptics` |

**Step 11.1, as built:** a `sorted-array` structure in `engine/algorithms/searching/` (the array model, one slot per number, compared as numbers; unsorted input is allowed so the lesson and sandbox can show a miss). Array scenes now take a list of named pointers (`pointers`, ids `pointer-<label>`), and a pointer can sit `below` the row: the array renderer draws `low` and `high` under the indices and `mid` above. The topic is the first in the Algorithms category, with its own glyph and card drawing. Predict questions wait for Step 8.2.

**Step 11.2, as built:** three topics (Bubble Sort, Selection Sort, Insertion Sort), each with its own lesson, sandbox, quiz, reference sheet, code, glyph and card drawing. One engine, `engine/algorithms/sorting/`, registers each as a structure (`bubble-sort`, `selection-sort`, `insertion-sort`) with `sort` and `pass`; both take `{ from }` (rounds already done), so a lesson can show one pass or round per chapter on the same array. Values may carry a letter tag (`5a`) to show stability. The canvas gained swap arcs (VISUAL-SPEC §7) and a `held` slot for insertion sort's key. The sandbox gained a `values` input: a field of 2–12 numbers that presets and Random fill in, sorted by Sort.

**Step 11.3, as built:** two topics, Merge Sort and Quick Sort. Merge sort has its own model (`engine/algorithms/sorting/merge.ts`): the array plus a row per recursion level, items moving down a level when their range splits and back up, smallest first, when halves merge; the array renderer draws the levels as faint slots under the array (`level` slots, meta `levels`, `src/viz/renderers/array/levels.ts`). `{ depth: 1 }` splits once, for the lesson on merging two sorted halves. Quick sort (Lomuto) joins the in-place sorts with a new `pivot` canvas state, `j` above and `i` below, dimming outside the range being partitioned; `sortRandom` uses a seeded random pivot, and its `from` replays partitions out of sight from the array given. Hoare's partition is described in the lesson and reference, not animated.

**Step 11.5, as built:** two topics, Two Pointers and Sliding Window, in `engine/algorithms/patterns/` on the array model. Two pointers: `reverse` (from both ends), `pairSum` (sorted array; warns when unsorted) and `removeDuplicates` (`read` above, `write` below; the dropped tail is emptied). Sliding window: a model of the array plus k, with `maxSum`, `longestUnique` (numbers or single letters; a repeat is shown as a `collision`), `windowMax` (a monotonic deque: kept items `visited`, the front pointed at as `max`, its contents in the meta) and `widen`/`narrow` for k. The window's ends are `left` and `right` pointers below the row. Its sandbox has two tools, Fixed window and No repeats; the numbers field is now labelled "Numbers". Step 11.4 was skipped and stays open.

**Step 11.6, as built:** the Recursion topic (Foundations), on a new `call-stack` renderer (`viz/renderers/call-stack/`): frames stack upwards on the left (running `active`, returning `found` with its result, waiting plain), and for Fibonacci the call tree sits to the right (done calls `visited`, memo hits `found`). The engine (`engine/foundations/recursion/`) dry-runs each function first, so every call's column in the tree and the stack's tallest point are known from the start and nothing moves as calls appear. Functions: factorial, Fibonacci, Fibonacci with a memo, and a factorial with no base case that overflows; sandbox presets pick n. The catalog's `sum(array)` is left out (it teaches what factorial does). The general `tree` renderer, with pan and zoom, is still Step 12.1.

### v1.2: Trees
| Step | Work | Commit |
|---|---|---|
| 12.1 | `tree` renderer with tidy layout, plus pan and zoom (F-303, F-304) | `feat(viz): add tree renderer with pan and zoom` |
| 12.2 | Traversals and BST (T1, T2) | `feat(trees): add traversals and binary search tree` |
| 12.3 | Heap and priority queue (T3) | `feat(heap): add heap and priority queue` |
| 12.4 | AVL rotations (T4) | `feat(avl): add AVL tree with rotations` |
| 12.5 | Circular list and deque (L4, L7) | `feat(linear): add circular linked list and deque` |

### v1.3: Graphs
| Step | Work | Commit |
|---|---|---|
| 13.1 | `graph` renderer and graph editor (F-604) | `feat(viz): add graph renderer and editor` |
| 13.2 | Graph basics, BFS, DFS (G1–G3) | `feat(graphs): add graph basics, BFS and DFS` |
| 13.3 | Topological sort and Dijkstra with the table renderer (G4, G5) | `feat(graphs): add topological sort and Dijkstra` |
| 13.4 | Streaks, bookmarks and reminders (F-1002, F-1003), and the Progress tab back: per-topic progress, mastery and streaks | `feat(progress): add streaks, bookmarks and reminders` |

### Later (P2)
Trie, Red-Black and segment trees; MST, union-find and Bellman-Ford; heap, counting and radix sort; backtracking, DP and greedy; narration, shareable scenarios, achievements, stats dashboard, cloud sync and localisation. These will be planned in detail when v1.3 ships.

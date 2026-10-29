# TECH STACK

This is the stack for Visual-DSA, chosen to deliver the features in [FEATURE.md](./FEATURE.md). The base is **React Native with Expo**. Everything else below was picked to support three goals:

1. **Smooth 60fps visualisations** on mid-range Android phones, not just flagships.
2. **Offline-first**, with no backend needed for the MVP.
3. **Lessons are data, not code**, so new topics can be added without touching the rendering engine.
4. **Runs in Expo Go** during development, so every library must be one that Expo Go already includes (§1).
5. **No hard-coded values.** Colours and sizes live in design tokens and tunable constants live in config, so changing either never means editing code files (ARCHITECTURE.md §9).

> Versions: Expo **SDK 58** is the latest at the time of writing (Oct 2026). Always install packages with `bunx expo install <pkg>` so versions match the SDK. Major versions are listed below only where the API differs between majors.

---

## At a glance

| Layer | Choice | Covers |
|---|---|---|
| Framework | **Expo SDK 58** + React Native (New Architecture) + **TypeScript (strict)**, developed and tested in **Expo Go** | Everything |
| Navigation | **Expo Router** | F-101–F-106 |
| Visualisation canvas | **React Native Skia** (`@shopify/react-native-skia` v2) | F-301–F-306 |
| Animation | **Reanimated 4** (+ `react-native-worklets`) | F-202, F-301, F-401–F-403 |
| Gestures | **React Native Gesture Handler** | F-202, F-303, F-604 |
| Native UI controls | **`@expo/ui`** (bottom sheet, slider, picker, switch, menu) | F-203, F-402, F-1101–F-1107 |
| Lists | **FlashList v2** | Topic grid, chapter index, quiz lists |
| App state | **Zustand v5** | Player, sandbox, settings |
| Local persistence | **`expo-sqlite/kv-store`** (via Zustand `persist`), which is included in Expo Go | F-104, F-1001–F-1003, F-1108 |
| Design tokens | **`src/theme/tokens.css`**, the only place colours, fonts and sizes are defined | Whole app |
| App config | **`src/config/`**, the only place tunable constants are defined | Whole app |
| Content schema | **Zod v4** | Validating lesson / quiz content |
| Code highlighting | **Shiki** at build time, rendered as native `<Text>` spans | F-501–F-506 |
| Charts | **Victory Native** (Skia-based) | F-903 |
| Styling | **Uniwind** (Tailwind CSS v4), with theme tokens as CSS variables | F-1101, F-1104, F-1106 |
| Icons | **Phosphor** (`phosphor-react-native`) | Whole app |
| Fonts | **Manrope** (UI) + **JetBrains Mono** (code & values), via `@expo-google-fonts` | Whole app |
| Device APIs | `expo-haptics`, `expo-clipboard`, `expo-notifications`, `expo-speech`, `expo-localization` | F-307, F-505, F-1003, F-210, F-1111 |
| Testing | **Jest** (`jest-expo`) + **React Native Testing Library** + **Maestro** | See TESTING.md |
| Build & release | **EAS Build / Submit / Update / Workflows** | CI/CD, OTA lesson fixes |
| Monitoring | **EAS Observe** (performance), added with the first release build. Crash reporting (Sentry) is postponed. | Startup performance |

---

## 1. Core framework

**Expo SDK 58 + React Native (New Architecture) + TypeScript strict**

- The New Architecture (Fabric + JSI) is the default and is required by Reanimated 4 and Skia 2.
- **Development and testing happen in Expo Go** on a physical phone: run `bun run start` and scan the QR code. There are no simulators and no development builds.
  - **Phone on a different network from the Mac:** use `bun run start:tunnel`. In SDK 58, `--tunnel` uses Expo's own tunnel (`*.on.expo.app`), which needs `bunx expo login`. `bun run start:ngrok` is the fallback through ngrok. `@expo/ngrok` is a dev dependency so the CLI never prompts for a global install.
  - **Rule:** every dependency must already be included in Expo Go for SDK 58. Before adding a library, confirm it's in Expo Go (Expo SDK reference, `bunx expo install`). That rules out custom native code and config plugins that need a rebuild.
  - **Stack check:** Skia, Reanimated + worklets, Gesture Handler, `react-native-svg` (used by Phosphor), the expo-* modules, and `@expo/ui` universal components (SDK 56+) are expected to work in Expo Go. Uniwind's free version works in Expo Go (Pro does not). Each library is confirmed in Expo Go in the step that installs it.
  - **What changed because of Expo Go:** MMKV is replaced by `expo-sqlite/kv-store`. Fonts are loaded at runtime with `useFonts` instead of the `expo-font` config plugin. EAS Observe and Maestro E2E move to release builds.
  - **Release builds** for TestFlight and Google Play still use EAS Build, set up at the end of the MVP.
- **Package manager: Bun** (`bun install`, `bun run <script>`, `bunx expo install <pkg>`). Expo CLI and EAS Build both support Bun and detect it from the `bun.lock` lockfile, which gets committed. Points to keep in mind:
  - **Node stays installed.** Bun installs packages and runs scripts, but Expo CLI and Metro still run on Node. Use an LTS Node version that SDK 58 supports.
  - **Tests run with `bun run test`, never `bun test`.** `bun test` starts Bun's own test runner, which ignores the `jest-expo` preset. `bun run test` runs the Jest script.
  - **Install scripts:** Bun doesn't run dependencies' `postinstall` scripts unless the package is listed in `trustedDependencies`. If an install looks incomplete, check `bun pm untrusted` and trust only the packages that need it.
  - **Build scripts** (`scripts/*.ts`) run directly with `bun scripts/<name>.ts`, so no `tsx` or `ts-node` is needed.
  - Always add packages with `bunx expo install` (not plain `bun add`) so versions match SDK 58.
- **Linting/formatting:** ESLint (`eslint-config-expo`, flat config) + Prettier (`eslint-config-prettier` turns off rules that clash with Prettier). **ESLint is pinned to v9**, because `eslint-plugin-react` (bundled in Expo's config) doesn't support ESLint 10 yet. Revisit when it does.

## 2. Navigation: Expo Router

Expo Router gives file-based routes that map directly to the app's screens. Routes live in `src/app/` (routes only). The full folder layout and route table are in [ARCHITECTURE.md](./ARCHITECTURE.md) §3 and §8.

```
src/app/
  (tabs)/
    index.tsx                 # Home (F-101)
    practice.tsx              # Revise list / quizzes
    progress.tsx              # Stats & progress
    settings.tsx
  topic/[topicId]/
    index.tsx                 # Topic detail (F-102)
    learn.tsx                 # Lesson player (F-201)
    play.tsx                  # Sandbox (F-601)
    practice.tsx              # Topic quiz (F-701)
    chapters.tsx              # Chapter index sheet (F-203)
    reference.tsx             # Reference sheet (F-801)
```

- Typed routes, deep links for free (needed later for sharing scenarios, F-607), native stack transitions.
- Tabs use JS `Tabs` (`expo-router/js-tabs`) with our Phosphor icons rather than `NativeTabs`. See ARCHITECTURE §8 for the reasoning and typed-route setup.
- The chapter index (F-203) and reference sheet (F-801) open as **form sheets / modals**.

## 3. Visualisation engine (the core of the app)

This is the most important technical decision. **Rendering** is split from **algorithm logic**:

```
Algorithm (pure TS)  ──►  Step trace (JSON-like snapshots + events)  ──►  Renderer (Skia + Reanimated)
```

### 3a. Algorithm layer: plain TypeScript
- Every operation (push, insert, bubble sort, BFS...) is a **pure function or generator** that outputs a list of **steps**. Each step holds the structure state, the highlights, the pointer positions, the active code line, the variable values, and the caption.
- It has no React or UI imports, so it can be unit tested to 100% and reused by Learn, Play, Practice, and Compare.
- Going back a step means reading the previous snapshot, so reverse playback (F-202) and scrubbing (F-403) are free.

### 3b. Drawing: React Native Skia
- One GPU-accelerated canvas draws nodes, boxes, arrows, curved pointers, and labels. It handles hundreds of elements, such as large trees and graphs, much better than hundreds of `<View>`s.
- Skia supports paths, curved arrows (as in the reference's random-access and hash arrows), gradients, shadows, and text with custom fonts.
- **Alternative considered:** `react-native-svg`. It's simpler, but slower at many animated elements. It's kept only for static topic illustrations and icons.

### 3c. Motion: Reanimated 4
- Element positions and colours live in **shared values** and animate on the UI thread, so the JS thread being busy never causes stutter.
- Skia reads Reanimated shared values directly, so there's no bridge cost per frame.
- Reduced motion (F-1104) uses Reanimated's `useReducedMotion` to switch to cross-fades.

### 3d. Gestures: React Native Gesture Handler
- Swipe to change step, pinch/pan to zoom the canvas, drag to build graphs, long-press to edit.
- Runs on the UI thread together with Reanimated.

### 3e. Layout helpers
- Arrays, stacks, queues, and hash tables use simple custom layout math.
- **Trees** use a tidy-tree layout (Reingold–Tilford), written in-house as it's small.
- **Graphs** use a lightweight force-directed or layered layout. Start in-house and only add a library (e.g. `d3-force`, pure JS) if needed.

## 4. Native UI controls: `@expo/ui`

Real SwiftUI (iOS) and Jetpack Compose (Android) components, so the app feels native and not like a web view:

| Need | `@expo/ui` component |
|---|---|
| Chapter index, reference sheet, code panel on phones | `BottomSheet` |
| Playback speed (F-402) | `Slider` |
| Code language picker (F-502) | `Picker` |
| Settings toggles (theme, haptics) | `Switch`, `FieldGroup` |
| Overflow actions (Code / Quiz / Restart) | `Menu` |

Large scrolling lists such as the topic grid use **FlashList**. `@expo/ui`'s `List` is a settings-style grouped list and isn't virtualised.

## 5. State & storage

| Concern | Tool | Notes |
|---|---|---|
| Lesson player state (current step, playing, speed) | **Zustand** | Small, fast, no providers. Selectors avoid re-renders. |
| Sandbox state (current structure, operation history) | **Zustand** | Undo/redo built on the step trace. |
| Settings, progress, bookmarks, streaks, revise list | **Zustand + `persist` → `expo-sqlite/kv-store`** | Key-value storage backed by SQLite and included in Expo Go. Plenty fast for this data size. (MMKV was the first choice but needs a development build.) |
| Lesson & quiz content | **Bundled TS/JSON files**, validated by **Zod** | Ships inside the app, so it works offline (F-1108). |

- **Not needed for MVP:** a server, React Query, or SQLite. If progress data grows (e.g. detailed quiz history for the stats dashboard, F-1005), add **expo-sqlite + Drizzle ORM**.
- **Cloud sync (F-1110, P2):** postponed. Supabase (auth + Postgres) is the likely choice, syncing the same persisted state.

## 6. Content pipeline

Lessons are **data**, not screens:

```
src/content/
  topics/
    stack/
      meta.ts          # title, category, icon, chapters
      lesson.ts        # ordered steps referencing algorithm traces + captions
      quiz.ts          # questions, answers, explanations, links to steps
      reference.ts     # cheat-sheet tabs, complexity table
      code/            # implementations: pseudo, js, py, java, cpp
```

- **Zod schemas** validate all content at build/test time, so a broken lesson fails CI, not the user.
- **Code highlighting:** a build script (`bun run highlight`) runs **Shiki** (a dev dependency) over `code/` and outputs pre-tokenised JSON. Tokens carry a role (keyword, string…), not Shiki's colours, so syntax colours come from `tokens.css`. At runtime the app renders coloured `<Text>` spans with no parser shipped to the device. Each step points at a line ID, which drives the synced highlight (F-501).
- **EAS Update** can push corrected captions or quiz answers over the air without a store release.

## 7. Styling, icons & design system

### 7a. Styling: Uniwind

**Decision: Uniwind (Tailwind CSS v4 for React Native), not plain `StyleSheet`.**

Apart from the canvas, most screens are ordinary UI: the topic grid, topic detail, quiz, progress, settings, and reference-sheet tables. Utility classes make these quicker to build and keep spacing and typography consistent across the app.

| | `StyleSheet` + tokens | Uniwind |
|---|---|---|
| Extra dependencies | None | `uniwind` + `tailwindcss` v4, plus a Metro config plugin |
| Building screens | Verbose, one style object per element | Fast, with utility classes inline |
| Light/dark + themes | Manual: a theme hook, with colours passed around by hand | Built in: `dark:` variants and CSS-variable themes, switchable at runtime |
| Consistency | Depends on discipline | Enforced by the Tailwind spacing/type scale |
| Runtime cost | None | Small, because classes are compiled at build time |
| Skia canvas colours | Import the tokens file | Read the same theme variables with `useCSSVariable` |
| Third-party components | N/A | Wrap with `withUniwind` to accept `className` |

**How we use it**
- **One source of truth:** every design token (colours in light and dark, including the **state palette** for comparing/swapping/visited/found/collision/sorted, plus fonts, type sizes, spacing, radius and canvas sizes) is defined once in `src/theme/tokens.css`. `global.css` only imports Tailwind, Uniwind and that file. To change a colour, edit `tokens.css` and nothing else (ARCHITECTURE.md §9).
- **Screens and components** use `className`.
- **Skia canvas and Victory charts** read the same variables with `useCSSVariable`, so the canvas and the UI always match, including after a theme switch.
- **`@expo/ui` components** are real SwiftUI/Compose. They're styled through their own props, not `className`.
- **Escape hatch:** `StyleSheet` still works alongside Uniwind for any component that needs it.
- We use the free open-source core. The paid Pro tier isn't needed.

**Why not NativeWind:** NativeWind v4 is built on Tailwind v3. Uniwind targets Tailwind v4 and compiles at build time.

**Trade-off we accept:** Uniwind is newer and has a smaller community than plain `StyleSheet`, and it adds a build step. Because `StyleSheet` keeps working, this is low risk.

### 7b. Icons: Phosphor

**Decision: `phosphor-react-native`.**

Phosphor is clean and minimal, but much less common than Lucide, which has become the default look of quickly generated apps. Its **six weights** (thin, light, regular, bold, fill, duotone) give us a visual language that Lucide's outline-only set can't.

| Option | Verdict |
|---|---|
| **Phosphor** ✅ | 1,442 icons, six weights, MIT licence, uses `react-native-svg` (already in the stack). Includes icons specific to data structures. |
| Lucide | Rejected: too common, so the app would look generic. Outline only. |
| `@expo/vector-icons` | Font-based, and mixing sets leads to inconsistent styles. |
| `expo-symbols` | Icons differ per platform, so the look isn't consistent across iOS and Android. |

**Icons we need, all confirmed to exist:**
- **Player:** `Play`, `Pause`, `SkipForward`, `Rewind`, `ArrowUUpLeft` / `ArrowUUpRight` (undo/redo), `Gauge` (speed)
- **Lesson UI:** `ListNumbers` (chapters), `BookOpen` (reference), `Code`, `Copy`, `MagnifyingGlass`
- **Topic categories:** `Stack`, `Queue`, `Hash`, `TreeStructure`, `Graph`, `SortAscending`, `FlowArrow`, `Binary`, `BracketsCurly` / `BracketsSquare`, `GitBranch`
- **Progress:** `Flame` (streak), `BookmarkSimple`, `Trophy`
- **Settings:** `Sun` / `Moon`

**How we use the weights**
| Weight | Where |
|---|---|
| `regular` | Default for all UI icons (toolbar, buttons, list rows) |
| `fill` | Active/selected states: current tab, bookmarked step, completed topic |
| `duotone` | Accent spots only: category headers, empty states, achievement badges. The second tone comes from the theme. |
| `light` / `thin` / `bold` | Not used, to keep the set small and consistent |

**Rules**
- **Import each icon from its own file**, e.g. `import { PlayIcon } from 'phosphor-react-native/src/icons/Play'` (the `*Icon` names; plain `Play` is deprecated). Importing from the package root pulls in all 1,442 icons, because Metro doesn't reliably drop unused exports. A bundle check (Step 1.3) confirmed that only the registered icons ship.
- **Icons are registered by meaning** in `src/components/icons.ts` (`close`, `chapters`, `step-forward`, `streak`, `done`…). App code writes `<Icon name="chapters" />` and never imports Phosphor directly, so changing an icon, or the whole library, happens in that one file.
- **`<Icon name size tone weight label>`** (`src/components/icon.tsx`): sizes `xs` 18 / `sm` 20 / `md` 22 / `lg` 24 come from tokens, and the colour is a colour token. Icons are decorative (hidden from screen readers) unless a `label` is passed.
- **Jest:** Phosphor ships untranspiled TSX, so it's added to `transformIgnorePatterns` in `package.json`, alongside `uniwind`.
- **Topic card illustrations** (array boxes, linked-list chain, LIFO/FIFO) are **custom SVG/Skia artwork**, not library icons. They are part of the app's visual identity.
- **Maintenance note:** the last release was April 2026. Icons are static SVGs and the peer dependencies are loose, so this is low risk. Check it still installs when the Expo SDK is upgraded.

### 7c. Fonts & accessibility
- **Fonts: Manrope** for all UI text (headings, buttons, captions) and **JetBrains Mono** for code, array values, index labels and pointer labels.
  - **Why:** a sleek, modern geometric sans that stays calm at caption size and crisp at title size, with clear numerals. JetBrains Mono is designed for reading code, and it keeps easily confused characters apart (0/O, 1/l/I), which matters because values, indices and code are the main content.
  - **History:** the first choice was Atkinson Hyperlegible Next + Mono, picked for legibility. On a real phone its wide, rounded letters looked heavy and clunky, so the UI rework switched. Candidates compared on device: Manrope + JetBrains Mono, Geist (rejected as the default of many generated apps), IBM Plex, Red Hat Text + Mono and DM Sans + DM Mono.
  - **Packages:** `@expo-google-fonts/manrope` and `@expo-google-fonts/jetbrains-mono`, loaded at runtime with `useFonts` in the root layout. The `expo-font` config plugin isn't used because Expo Go can't apply config plugins. Only the weights we use are loaded (Manrope 400/500/700, JetBrains Mono 400/500).
  - **One place to change:** fonts are registered under role names (`app-sans`, `app-sans-medium`, `app-sans-bold`, `app-mono`, `app-mono-medium`) in `src/theme/fonts.ts`, the only file that names a typeface. Changing fonts means installing the packages and changing its five imports.
  - **Skia canvas:** the canvas loads the **same font files** through Skia's own font loader (by role, e.g. `FONT_FILES['app-mono-medium']`), so values and labels drawn on the canvas use the same typeface as the rest of the UI.
  - **Uniwind:** the `--font-*` tokens in `tokens.css` hold the role names. In React Native each weight is its own font family, so each weight gets its own token.
  - **Rejected on purpose:** Inter, Geist, Space Grotesk and Poppins, because they're the usual defaults in generated apps.
- Light/dark theme follows the system, with a user override (F-1101).
- Colour-blind-safe state palette paired with icons/patterns (F-1106).

## 8. Device features

| Package | Use | Priority |
|---|---|---|
| `expo-haptics` | Feedback on collision / swap / match (F-307) | P1 |
| `expo-clipboard` | Copy code (F-505) | P0 |
| `expo-notifications` | Opt-in streak reminders (F-1003), local only | P1 |
| `expo-speech` | Caption narration (F-210) | P2 |
| `expo-localization` + `i18next` | Translations (F-1111) | P2 |
| `expo-screen-orientation` | Portrait + landscape support (F-106) | P0 |
| `expo-splash-screen`, `expo-system-ui` | Launch experience, themed system bars | P0 |

## 9. Charts

- **Victory Native** for the Big O growth chart (F-903). It's built on Skia, so it matches the canvas and the theme.
- Operation counters (F-902) are plain animated text, so no chart library is needed.

## 10. Testing

The full strategy goes in `TESTING.md`. Tools:

| Level | Tool | What it covers |
|---|---|---|
| Unit | **Jest** (`jest-expo`) | Algorithm step generators (most important), layout math, Zod content validation |
| Component | **React Native Testing Library** | Player controls, quiz flow, settings |
| End-to-end | **Maestro** | Flows: open topic → play lesson → take quiz. Runs in the cloud on EAS Workflows against release builds, so no local simulator is needed. Day-to-day checks are manual in Expo Go. |
| Type safety | `tsc --noEmit` | Run in CI on every PR |

**Setup notes (Step 0.3):**
- Jest 30 with the `jest-expo` preset, configured under `"jest"` in `package.json`. `jest-expo` also needs `@react-native/jest-preset`.
- React Native Testing Library v14 renders with the `test-renderer` package, and its `render` is awaited (`await render(<Home />)`).
- `tsconfig.json` sets `"types": ["jest"]`, because TypeScript 6 no longer includes `@types/*` packages automatically.
- Tests sit next to the code they test (`home.test.tsx` beside `index.tsx`), never inside `src/app/` (every file there becomes a route).
- **Always `await` user events in tests.** In Testing Library v14, `fireEvent.press` and friends return Promises. An un-awaited press leaks state into the next test, which then fails for no visible reason.
- **Gesture Handler 3 uses hooks** (`usePanGesture`, `useTapGesture`… with `<GestureDetector gesture={…}>`). The `Gesture.Pan()` builder is deprecated. Callbacks are `onBegin` / `onActivate` / `onUpdate` / `onDeactivate` / `onFinalize`, and `runOnJS: true` lets them call stores directly.
- **Gestures in Jest:** `react-native-gesture-handler/jestSetup` is in `setupFiles`. Screens with gestures render inside `GestureHandlerRootView` in tests (`render(el, { wrapper: GestureHandlerRootView })`), as in the app. Gesture Handler calls Reanimated's `isSharedValue`, so the Reanimated mock includes it. Screens that draw with Skia mock `@/viz/scene-view` in tests: the canvas is checked visually.
- **FlashList in Jest:** `@shopify/flash-list/jestSetup` (layout mocks) is in `setupFiles`, and the package is in `transformIgnorePatterns` because it ships ES modules.
- **Two TypeScript projects:** the app (`tsconfig.json`, Jest types) and `scripts/` (`scripts/tsconfig.json`, Node types). `bun run typecheck` checks both, so app code can't accidentally use Node-only globals.
- **Reanimated in Jest** (`jest.setup.ts`): Reanimated 4.7's official mock imports the real package, whose native initializer throws under Jest. So `jest.setup.ts` mocks only the Reanimated APIs the app uses (`Animated.View`, `cubicBezier`, `useReducedMotion`…). **When code starts using a new Reanimated API, add it to that mock.** Worklets uses its official mock.

## 11. Build, release & CI/CD

- **EAS Build:** iOS and Android builds in the cloud. Profiles are `development`, `preview` (internal testers), and `production`.
- **EAS Submit:** sends builds to TestFlight and Google Play.
- **EAS Update:** over-the-air JS/content fixes on `preview` and `production` channels.
- **EAS Workflows:** CI that runs on each PR (lint, typecheck, Jest, content validation) and on merge (preview build + Maestro E2E).
- **Source control:** Git + GitHub.

## 12. Monitoring

- **EAS Observe** for cold start, time to interactive, and per-route performance, so slow devices are caught early. It needs its own native module, so it's added with the first EAS release build rather than in Expo Go.
- **Crash reporting: not included yet.** Until we add a tool, crashes are visible through **App Store Connect** and the **Google Play Console** crash reports. Revisit **Sentry** (`@sentry/react-native`) before the public launch or once the beta group grows.
- **Product analytics (optional, P1):** a privacy-friendly tool such as PostHog to track lesson completion and drop-off. It's opt-in and won't be added before launch.

---

## Summary: what is *not* in the stack, and why

| Not using | Reason |
|---|---|
| Backend / database server | MVP is fully offline. Supabase comes later, for sync only. |
| Redux | Zustand covers the same needs with far less boilerplate. |
| React Query / SWR | There's no network data in the MVP. |
| WebView-based visualisers (D3 in a WebView) | Can't reach native 60fps or gesture quality. This is the main weakness of many existing apps. |
| NativeWind | Uniwind targets Tailwind v4 and compiles at build time. |
| Sentry (for now) | Not needed before a public launch. Store-console crash reports cover early testing. |
| MMKV, development builds, simulators | Development happens in Expo Go on a real phone. `expo-sqlite/kv-store` covers storage. |
| Uniwind Pro | Needs a native rebuild, so it doesn't work in Expo Go. The free version covers our needs. |
| Lottie for visualisations | Animations must react to user input, so they can't be pre-baked. Lottie may still be used for onboarding illustrations. |

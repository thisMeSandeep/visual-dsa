# Visual-DSA

A React Native (Expo) mobile app that teaches data structures and algorithms through step-by-step animated visualisations. Each topic has three modes: **Learn** (guided lesson), **Play** (sandbox), and **Practice** (quizzes).

**Status:** planning is complete and implementation has not started. Work proceeds one step at a time from `docs/IMPLEMENTATION-PLAN.md`. Find the current step by comparing `git log` with the plan's commit messages.

## Docs: read the right one first

| When you need… | Read |
|---|---|
| What the product is and why | `docs/IDEA.md` |
| What to build, feature IDs (F-xxx), priorities (P0/P1/P2) | `docs/FEATURE.md` |
| Libraries, versions, Expo Go and Bun rules | `docs/TECH-STACK.md` |
| Colours, typography, spacing, components, canvas states, motion | `docs/VISUAL-SPEC.md` |
| Topics, lesson chapters, operations, complexity, renderers | `docs/ALGORITHM-CATALOG.md` |
| Folder layout, data model, engine, player, tokens and config rules | `docs/ARCHITECTURE.md` |
| What to do next, step by step, with commit messages | `docs/IMPLEMENTATION-PLAN.md` |
| Test strategy | `docs/TESTING.md` *(not written yet)* |

Reference screenshots of the app that inspired this one are in `Dsa images/`. They show the idea; our UI follows `VISUAL-SPEC.md`, not them.

## Rules that always apply

1. **Never commit, push or stage.** The user reviews and commits every change. At the end of each step, summarise what changed and give the step's 1–2 line commit message from the plan, adjusted if the work changed.
2. **One plan step at a time.** Finish the step's "Done when" checks, then stop for review. Don't start the next step unprompted.
3. **Expo Go only.** The user tests on a physical phone in Expo Go (SDK 58). There are no simulators and no development builds. Every dependency must already be included in Expo Go: no custom native code, no config plugins. EAS builds are used only for release (plan Phase 10). See `TECH-STACK.md` §1.
4. **Bun, not npm.** Use `bunx expo install <pkg>` to add packages (never plain `bun add`), `bun run <script>` for scripts, and `bun run test` for tests (**never** `bun test`). Node stays installed for Expo CLI and Metro.
5. **No hard-coded values in code files** (`ARCHITECTURE.md` §9):
   - Colours, fonts, type sizes, spacing, radii and canvas sizes go only in `src/theme/tokens.css`. TypeScript reads them through `src/theme/`.
   - Tunable constants (timings, speeds, limits, storage keys, flags) go only in `src/config/`, read as `config.*`.
   - Lesson data goes in `src/content/`.
   - No arbitrary Tailwind values (`bg-[#…]`). Lint enforces all of this.
6. **Respect the architecture boundaries** (`ARCHITECTURE.md` §3): `src/engine/` is pure TypeScript (it may import `config/` only, with no React or React Native); `src/app/` holds routes only; `viz/` never imports `content/`.
7. **Don't trust memory for Expo APIs.** Expo makes breaking changes every SDK. Check the SDK 58 docs (`https://docs.expo.dev/versions/v58.0.0/`, plus `https://docs.expo.dev/llms.txt`) or the matching skill before using an Expo, EAS or React Native API.
8. **Use skills.** Before working in an area, load the matching skill (see the "Skills used per phase" table in the plan): `expo-project-structure`, `uniwind`, `expo-router`, `expo-animation`, `expo-ui`, `expo-native-ui`, `expo-design-system`, `vercel-react-native-skills`, `eas-*`. Don't guess library APIs.
9. **Distinctive, not generic design.** Follow `VISUAL-SPEC.md`: soft cream and charcoal neutrals (no pure white or black), cobalt for actions, orange for "look here now", green for correct, category colours on glyphs only. Use Phosphor icons with no background tiles, and Atkinson Hyperlegible Next + Mono fonts. Avoid stock looks (Lucide, Inter, gradients, emoji, shadow-on-everything).

## Stack at a glance

Expo SDK 58 · TypeScript strict · Expo Router (`src/app`) · Uniwind (Tailwind v4) · React Native Skia + Reanimated 4 + Gesture Handler · `@expo/ui` · Zustand + `expo-sqlite/kv-store` · Zod · Shiki (build time) · Phosphor icons · Victory Native · Jest (`jest-expo`) + RNTL · Maestro on EAS (release only).

## Editor

The user works in **Zed** (not VS Code). Project settings live in `.zed/settings.json`. Don't add `.vscode/` files.

## Commands

Run these from the project root:

```bash
bun install                 # install dependencies
bun run start               # start Metro in Expo Go mode; scan the QR code
bun run start:tunnel        # same, when the phone isn't on the same network
bun run lint                # ESLint (includes no-hard-coding and boundary rules)
bun run typecheck           # tsc --noEmit
bun run format              # Prettier (format:check in CI)
bun run doctor              # expo-doctor: dependency and config health
bun run test                # Jest (from Step 0.3). NOT `bun test`
bun run validate:content    # Zod-check all topic content (from Step 2.2)
bunx expo install <pkg>     # add an Expo-compatible dependency
```

## Keep docs in sync

If a decision changes (a library, a rule, a token, the plan), update the relevant doc in `docs/` in the same step, and say so in the step summary.

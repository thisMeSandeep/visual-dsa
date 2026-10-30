# VISUAL SPEC

The visual language for Visual-DSA. It implements the look agreed on the UI concepts canvas (https://claude.ai/artifact/1937H4Uu89mfhRkjhMvNzV) and builds on the stack in [TECH-STACK.md](./TECH-STACK.md): Uniwind tokens, Phosphor icons, and Atkinson Hyperlegible Next + Mono.

---

## 1. Direction

**Soft cream, cobalt actions, colour with meaning.**

A calm, legible, uncluttered interface. Warm neutrals replace pure white and black, and every colour in the app has a single job.

### Principles

1. **Every colour means one thing.** Cobalt means "you can act". Orange means "look here now". Green means "correct / done". Category colours mean "what kind of topic". Colour is never decoration.
2. **Space instead of lines.** Separate content with whitespace. Hairlines are used only where structure needs them (tab bar, stat strips). No card borders, no drop shadows.
3. **Soft contrast, never weak contrast.** No `#FFFFFF` on `#000000`. Every text pair still meets WCAG AA (section 9).
4. **The visualisation is the hero.** Chrome around the canvas stays quiet so the data and the highlighted step stand out.
5. **One idea per screen.** One primary action per screen, one caption per step.
6. **Avoid generic tells.** No icon background tiles, no gradients, no emoji, no coloured left-border cards, no shadow-on-everything, no Inter.

---

## 2. Colour

All colours are tokens. Components never use raw hex values.

### 2.1 Neutrals

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#FAF8F4` | `#1A1917` | Screen background |
| `surface` | `#F0ECE4` | `#24221F` | Chips, secondary buttons, code panel, context blocks |
| `surface-raised` | `#FFFDF9` | `#2B2925` | Canvas cells/nodes, inputs, quiz tiles, cards (a step above `surface` in dark too, so cards read as layers) |
| `line` | `#E5E0D6` | `#34312C` | Hairlines (tab bar, stat strips), progress tracks |
| `line-strong` | `#DDD7CC` | `#3A3631` | Cell/node borders, outline buttons |
| `line-input` | `#8F877B` | `#6B655C` | Text input borders (≥3:1 for form controls) |
| `edge` | `#B5AEA2` | `#6B655C` | Arrows and connectors on the canvas |
| `ink` | `#22201C` | `#EEE9E0` | Primary text and icons |
| `ink-2` | `#4A463F` | `#CFC9BF` | Body copy under headings, secondary code |
| `muted` | `#6E685F` | `#A29C92` | Labels, captions, inactive tabs, indices |

### 2.2 Semantic colours

| Token | Light | Dark | Meaning | Where |
|---|---|---|---|---|
| `primary` | `#3554D9` | `#8199FF` | **Act** | Main buttons, active tab, progress bars, scrubber, links, current chapter |
| `on-primary` | `#FFFFFF` | `#14161F` | Text and icons on `primary` | |
| `primary-soft` | `primary` at 9–10% | `primary` at 16% | Tinted primary surfaces | Continue card, Pop/Peek buttons, current chapter row |
| `signal` | `#E8611F` | `#FF8044` | **Look here now** | Active/comparing elements, collision, new node, stack top, current code line, streak flame |
| `signal-ink` | `#B34815` | `#FF8A52` | Signal as text | Pointer labels (`top`, `j`), highlighted words |
| `signal-soft` | `signal` at 10–14% | `signal` at 16% | Fill behind signal elements | Callouts (`h("Sid") = 2`), code line highlight |
| `success` | `#2E9457` | `#4CC07A` | **Correct / done** | Completed check, correct answer, sorted/found elements |
| `success-ink` | `#1B7040` | `#4CC07A` | Success as text | "Correct" heading |
| `success-soft` | `success` at 8–10% | `success` at 18% | | Feedback panel, correct tile |
| `danger` | `#C7362F` | `#FF7A70` | **Error** | Overflow, underflow, key not found, invalid input |
| `danger-soft` | `danger` at 10% | `danger` at 18% | | Error banners |

> **Changes from the concept canvas:** `signal` was `#F06A2B` and is now `#E8611F` so that it reaches 3:1 as a graphic on cream. Signal text uses `signal-ink`. The amber category colour was darkened for the same reason (below).

### 2.3 Category colours

Used **only** for topic glyphs, category overlines and small category accents. Never for buttons or states.

| Category | Light | Dark | Text-safe variant (light) |
|---|---|---|---|
| Foundations | `#5C6B8A` slate | `#9AA6C2` | same |
| Linear structures | `#0E9384` teal | `#3CC4B2` | `#0B6F64` |
| Hashing | `#B57C06` amber | `#E5A93A` | `#9A6600` |
| Trees | `#A3458F` plum | `#D47FC1` | same |
| Graphs | `#7650D8` violet | `#A48BFF` | same |
| Algorithms (sort, search, DP) | `#2386C8` sky | `#5BB3F0` | `#1B6FA8` |

### 2.4 Mode colours

The three ways into a topic each have a fixed tint, used on the Topic screen buttons and on mode headers:

| Mode | Colour | Button style |
|---|---|---|
| Learn | `primary` | Solid `primary`, `on-primary` text |
| Sandbox | teal `#0E9384` | 10% tint, text `#0B6F64`, Shuffle icon |
| Practice | violet `#7650D8` | 10% tint, text `#5B3BB8`, GraduationCap icon |

### 2.5 Code syntax colours

Used **only** for code in the code panel, on the `surface` fill. Plain code (operators, variables, punctuation) is `ink`. Each colour reaches 4.5:1 on `surface` in both themes.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `code-keyword` | `#6A3FB0` | `#C3A6FF` | `if`, `return`, `class`, `this`, `new`, `true` |
| `code-name` | `#1F5F9E` | `#8CC2F5` | Function, method and class names |
| `code-string` | `#256B41` | `#93D6A8` | Strings |
| `code-number` | `#9A5800` | `#F0B866` | Numbers |
| `code-comment` | `#6E685F` | `#A29C92` | Comments |

### 2.6 Growth curve colours

Used **only** for the curves on the Big O growth chart. The classes are ordered (O(1) fastest … O(2ⁿ) slowest), so they form a **sequential** ramp in one hue (OKLCH 262), not a set of unrelated colours: slower classes are darker in light mode and brighter in dark mode. Every curve also carries a direct label, so colour is never the only way to tell them apart, and the curve in focus switches to `signal`. Both ramps pass the dataviz skill's validator (`--ordinal`: monotone lightness, steps ≥ 0.06 apart, the lightest step ≥ 2:1 on `surface`).

| Token | Class | Light | Dark |
|---|---|---|---|
| `curve-1` | O(1) | `#799EE3` | `#43629C` |
| `curve-2` | O(log n) | `#6185C8` | `#597AB6` |
| `curve-3` | O(n) | `#4A6DAE` | `#7092D0` |
| `curve-4` | O(n log n) | `#355695` | `#88ABEA` |
| `curve-5` | O(n²) | `#203F7C` | `#A1C5FF` |
| `curve-6` | O(2ⁿ) | `#0B2964` | `#BADFFF` |

### 2.7 Colour budget

- Each screen has **at most one** solid `primary` button.
- `signal` appears only inside the visualisation canvas and the code panel, plus the streak flame. It is never used for buttons.
- Category colours appear only on glyphs and overlines, never as large fills.

---

## 3. Typography

**Manrope** for all UI text. **JetBrains Mono** for values, indices, pointers, code, counters and Big-O notation. (Atkinson Hyperlegible was the first choice; on a real phone its wide, rounded letters looked heavy, so the UI rework switched to this sleeker pairing.)

Sizes and line heights are in points. These are the exact values in `src/theme/tokens.css` (`--text-*`).

| Style | Font | Size / line height | Weight | Default tone | Notes |
|---|---|---|---|---|---|
| `display` | Next | 34 / 38 | 700 | ink | Screen titles ("Learn", "Hash Table"), letter-spacing −0.68 |
| `title` | Next | 28 / 35 | 700 | ink | Quiz questions, letter-spacing −0.28 |
| `headline` | Next | 26 / 32 | 700 | ink | Card titles (Continue card), letter-spacing −0.26 |
| `caption` | Next | 19 / 28 | 400 (bold terms 700) | ink | **Lesson step captions**, the most important reading text |
| `body` | Next | 17 / 26 | 400 (list titles 500) | ink | Summaries, list titles |
| `body-sm` | Next | 15 / 22 | 400 (button labels 700) | ink-2 | Explanations, button labels |
| `label` | Next | 13 / 18 | 400 | muted | Secondary lines ("4 chapters"), stat labels |
| `overline` | Next | 12 / 16 | 500 | muted | UPPERCASE, letter-spacing 1.2, section labels |
| `tab` | Next | 12 / 16 | 400 (active 700) | muted | Small labels under icons (the floating tab bar uses `body-sm` bold for the current tab) |
| `value-xl` | Mono | 28 / 34 | 500 | ink | Quiz answer numbers |
| `value-lg` | Mono | 20 / 26 | 500 | ink | Canvas cell values |
| `value` | Mono | 16 / 22 | 500 | ink | Stack items, stats (`O(1)`), callouts |
| `code` | Mono | 13 / 24 | 400 | ink | Code panel |
| `index` | Mono | 12 / 16 | 400 | muted | Array indices, bucket numbers, step counters (`6 / 70`) |

**In code:** all text uses `<AppText variant="…" weight="…" tone="…">` from `src/components/app-text.tsx`. Weight is chosen through the font family (`font-sans-bold`), never through `font-weight`, because React Native needs one family per weight. Mono is loaded in 400 and 500 only. Bold words inside a caption use `<Strong>`.

**Rules**
- Use tabular numerals wherever digits line up (counters, scrubber, stats).
- Bold is reserved for the key terms in a caption (**Sid**, **collision**). Never bold a whole sentence.
- Every style scales with the system text size (Dynamic Type). The canvas reflows rather than clipping.

---

## 4. Spacing, layout & shape

### Spacing scale (4pt base)
`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48`

| Rule | Value |
|---|---|
| Screen side gutter | **24** |
| Top of content below safe area | 8–12 (headers), title starts ~60 from top |
| Gap between screen sections | **28** |
| Gap inside a group (title → subtitle) | 6–10 |
| Topic list row height | 62 |
| Chapter row height | 48 |
| Minimum touch target | **44 × 44** |
| Bottom padding above home indicator | 30–40 |

**Safe area:** a full screen puts its top safe-area padding on the screen container (`pt-safe`), never inside the scrolling content, so nothing scrolls under the status bar. Form sheets start below it already.

### Corner radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 10 | Canvas cells, nodes, callouts, code-line chips |
| `radius-md` | 12–14 | Chapter rows, inputs, small buttons, context blocks |
| `radius-lg` | 16 | Buttons, quiz tiles |
| `radius-xl` | 22–24 | Cards and panels (Continue card, feedback panel) |
| `radius-full` | 999 | Pills, round icon buttons, play button |

### Elevation
- **No shadows.** Depth comes from tints (`surface`, `primary-soft`) and space.
- Bottom sheets (reference) use a `surface-raised` sheet with a 36×4 grabber and a 40% scrim.
- **Side panel** (the lesson's chapter list): slides in from the right edge (250ms strong ease-out in, 200ms out; reduced motion fades), 2/5 of the width, `surface-raised` with a hairline `line-strong` left edge, over a `scrim` (`--color-scrim`, charcoal at 40% light / 60% dark) that closes it on tap. Header: `overline` topic name over a `headline` "Chapters", close button on the right; then chapter rows.

---

## 5. Iconography

- **Library:** Phosphor (`phosphor-react-native`).
- **Weights:** `regular` everywhere. `fill` for the active tab and for filled glyphs (Play/Pause, streak flame). `duotone` only for empty states and achievements.
- **Sizes:** 18 inside buttons, 20 for small icon buttons, 22 in headers, 24 in the tab bar.
- **Colour:** `ink` by default. `muted` for inactive tabs. `primary` for the active tab and for icons on primary-tinted controls (e.g. the code toggle). Mode colour on Sandbox/Practice buttons.
- **No background tiles.** Icons sit directly on the surface.
- **Topic glyphs:** custom line drawings on a 24 grid with a 1.7 stroke, rounded joins, drawn at 30px in the category colour. They show the structure itself (boxes in a row, chained boxes, stacked bars, bucket column; for binary search, three boxes with a pointer at the middle one over a range bracket).
- **Topic art:** larger line drawings on a 160 × 100 grid for Home's topic cards and the Continue card (`<TopicArt>`, `src/components/topic-art/`). Hairline strokes (`--art-stroke`, 1.1), rounded caps and joins, no fills except `surface-raised` inside cells. The structure is drawn in `ink-2`, labels in mono `--art-font` (9) `muted` (the system mono on Android, where react-native-svg misplaces the letters of runtime-loaded fonts; `SVG_MONO_FONT` in `src/theme/fonts.ts`), and **one accent** in the category colour for the part that tells the topic's story: the n² curve, the jump to `a[3]`, the head node, the item being pushed, the item leaving the queue, the colliding key, binary search's mid (its ruled-out half drawn in dashed `muted` outlines). Each topic has its own drawing (keyed by topic id); a topic without one shows its glyph.

Use `<Icon name="…">` with these registry names (`src/components/icons.ts`):

| Need | `name` | Phosphor icon |
|---|---|---|
| Close / back | `close`, `back` | `X`, `CaretLeft` |
| Chapters | `chapters` | `ListNumbers` |
| Play / pause / step | `play`, `pause` (fill), `step-back`, `step-forward` | `Play`, `Pause`, `CaretLeft`, `CaretRight` |
| Code panel / copy | `code`, `copy` | `Code`, `Copy` |
| Show / hide the lesson's progress bar | `timeline` | `SlidersHorizontal` |
| Reference sheet | `reference` | `BookOpen` |
| State legend | `legend` | `Swatches` |
| Reset / undo / random | `reset`, `undo`, `random` | `ArrowCounterClockwise`, `ArrowUUpLeft`, `Shuffle` |
| Bookmark | `bookmark` | `BookmarkSimple` |
| Tabs | `learn`, `practice`, `settings` (`progress` returns in Step 13.4) | `BookOpen`, `GraduationCap`, `Gear` (`ChartLineUp`) |
| Streak | `streak` (fill, `signal`) | `Flame` |
| Done / incorrect | `done` (`success`), `incorrect` (`danger`) | `Check`, `X` |
| Prediction prompt | `predict` (fill or duotone, violet) | `Lightbulb` |

### App icon and splash

The logo is a **line-art binary tree** (concept 5b, chosen from the boards in `assets/brand/`): a filled `signal` root over four hollow nodes, `ink` strokes, on the `surface` cream, like the drawings on the topic cards. Edges stop at the circles, so the nodes stay hollow on any background.

| Asset | File (`assets/images/`) | Look |
|---|---|---|
| App icon (iOS light, and the default) | `icon.png` | Tree on `surface` `#F0ECE4`, full bleed, no alpha (iOS rounds the corners) |
| iOS dark | `icon-dark.png` | Dark-theme `ink` and `signal` on dark `surface` |
| iOS tinted | `icon-tinted.png` | White tree on black; iOS tints it |
| Android adaptive | `android-icon-foreground.png` + `backgroundColor` `#F0ECE4` | Tree inside the 66% safe circle on a transparent layer |
| Android 13+ themed | `android-icon-monochrome.png` | White tree; the launcher colours it |
| Splash | `splash-icon.png`, `splash-icon-dark.png` | Tree on `background` (`#FAF8F4`, dark `#1A1917`), 160 wide |

Sources (SVG masters and the script that makes the PNGs) are in `assets/brand/source/`. The hex values in `app.json` are the tokens above, copied because app config can't read `tokens.css`. Expo Go shows its own icon and splash; these appear in real builds.

---

## 6. Components

### Buttons
| Variant | Spec |
|---|---|
| **Primary** | `primary` fill, `on-primary` label 16/700, height 56 (52 compact), `radius-lg`. One per screen. |
| **Primary tinted** | `primary-soft` fill, `primary` label. Used for secondary actions in the same group (Pop, Peek). |
| **Mode** | Mode tint fill + mode-ink label + icon (Sandbox, Practice). |
| **Pill** | Height 44, `radius-full`, used inside cards (Resume). |
| **Round icon** | 48 × 48 `surface` fill (speed, code toggle). Active state: `primary-soft` fill with `primary` icon. |
| **Step** | 56 × 56 with a 1.5 `line-strong` outline (previous / next). |
| **Play** | 72 × 72 `primary` fill, icon 24. The largest control on the lesson screen. |

Press feedback: scale to 0.97 over 120ms with a strong ease-out, on press-in (`PressableScale`, values in `config.motion.press`). With reduced motion on, the press becomes a 0.7 opacity change instead. A light haptic fires on press when `config.features.haptics` is on (P1). Disabled buttons sit at 40% opacity. Full-width rows (topic, chapter) never scale: they highlight with `active:bg-surface`.

**In code** (`src/components/`):

| Spec | Component |
|---|---|
| Primary / Primary tinted / Mode | `<Button variant="primary" \| "tinted" \| "sandbox" \| "practice">` |
| Heights 56 / 52 / Pill 44 | `<Button size="md" \| "compact" \| "pill">` |
| Header icon (44, no fill) / Round icon / Step / Play | `<IconButton variant="ghost" \| "round" \| "step" \| "play">`, `active` for the selected state, `text` for "1×" |
| 1.5pt outline | `border-control` utility (defined in `tokens.css`) |

### Continue card
`primary-soft` background, `radius-xl`, padding 24. Contents: overline "Continue" in `primary`, `headline` topic name, `label` position ("Collision · step 6 of 70"), with the topic art (112 wide, 8:5) to the right of the text; then a 4px progress bar (`primary` on a `primary` 18% track) and a Resume pill.

### Topic card
Home's topic tile, two per row with a 12 gap. `surface-raised` with a **hairline** `line-strong` outline (`border-hairline`, one physical pixel) and `radius-xl`, no shadow. Top: an 8:5 `surface` panel holding the topic art with 12 padding. Bottom, under a hairline `line` divider: the title in `body` bold with two lines reserved (so cards in a row line up), then one status line: the `label` chapter count before starting, a `ProgressBar` with mono `2/6` once started, or a `success` check with "Completed". The whole card is one button with press scale. In code: `<ArtCard>` (`src/components/art-card.tsx`) is the shared anatomy; `<TopicCard>` fills the status line with lesson progress.

**Quiz card** (Practice tab): the same card, so Learn and Practice feel like one app. Its status line is the quiz's question count before the first try, a `ProgressBar` with mono `8/10` for the best score, or a `success` check with "Perfect 9/9". In code: `<QuizCard>` (`src/components/quiz-card.tsx`).

### Topic row
*(Dev showcase only since the card grid; kept for compact lists.)* 30px category glyph · title (`body` 500) over `label` ("5 chapters") · trailing status: success `Check` when done, mono `2/5` when in progress, a `primary` dot plus count for the current topic. There are no dividers between rows.

### Chapter row
Mono number · title · trailing status. The current chapter gets a `primary-soft` row background, a `primary` number and a "Step 6" label. Completed chapters show a success check.

### Stat strip
Three equal columns between two `line` hairlines. `label` on top, mono `value` below (`O(1)`, `size 4`).

### Tab bar
Three tabs: Learn, Practice, Settings, in a **floating capsule**: inset 16 from the sides and 12 above the bottom safe area, `surface-raised` with a hairline `line-strong` outline (like the topic cards), fully rounded, 6 padding, no shadow. The current tab takes the remaining width and holds its `primary` filled icon (22) and its name in `body-sm` bold `primary`, on a 44-tall `primary-soft` pill that slides between tabs (§8). The other tabs are 56 × 44 targets showing only a `muted` regular icon, named for screen readers. Screens run full height behind the bar, so a tab screen's scrolling content ends with `TAB_BAR_CLEARANCE` (safe area + 96), and the page colour continues behind Android's navigation buttons. In code: `<FloatingTabBar>` (`src/components/floating-tab-bar.tsx`).

### Progress
- **Bar:** 4px, `radius-full`, `primary` on `line` (or a `primary` 18% track on tinted cards).
- **Segmented** (quiz): N equal segments with a 4px gap. Done segments are `primary`, the rest `line`.
- **Scrubber:** bar plus a 14px `primary` knob, with mono step numbers at each end.

### Inputs
Height 52, `surface-raised` fill, 1.5px `line-input` border, `radius-md`, mono values (`value` style). The label sits above in `label` style. Focus: 2px `primary` ring. Error: 2px `danger` border with the message below in `label` style, `danger` tone. In code: `<TextField label error>` (`src/components/text-field.tsx`); `labelHidden` keeps the label for screen readers only (when a placeholder says enough), and `accessory` puts a small control inside the field on the right (the sandbox's Random). **The keyboard never covers a field or its buttons:** any screen with a text input is wrapped in `<KeyboardAvoidingView behavior="padding">` from `src/components/keyboard-avoiding-view.tsx` (react-native-keyboard-controller), so the controls rise with the keyboard and flexible content (the canvas) shrinks.

### Quiz option tile
`radius-lg`, `surface-raised` with a 1.5px `line-strong` border. Three layouts: **value** (short answers such as `O(1)` or `42`: 92 tall, mono `value-xl` centred, two to a row), **word** (True / False: 92 tall, `headline` centred, two to a row) and **text** (sentences: at least 56 tall, `body` left-aligned, one per row). Answers up to `config.practice.tileAnswerMaxLength` characters are tiles; longer ones make the whole question a list. After answering: **correct** 2px `success` border, `success-soft` fill, check badge; **wrong pick** 2px `danger` border, `danger-soft` fill, `X` badge; the others fade to 50%. In code: `<OptionTile text state layout>`.

### Feedback panel
Bottom panel inset 16, `radius-xl`, `success-soft` (or `danger-soft`) fill. Heading in `success-ink` ("Correct"), then the explanation in `body-sm` `ink-2`, then a full-width primary button, or, when there's a second action ("See in lesson"), a tinted button and the primary one side by side.

### Code panel
`surface` block, `radius-lg`, mono 13/1.9, syntax colours from §2.5. Line numbers in `muted`. **Current line:** `signal-soft` row with `radius-sm`, and the line number in `signal-ink`. The panel scrolls to keep the current line in the middle (no animation with reduced motion). Long lines scroll sideways instead of wrapping.

The header holds the language pills on the left (selected: `primary-soft` fill, `primary` label in medium; others: `muted` label) and a ghost **Copy** button on the right, which shows a `Check` for 1.5 s after copying. The round code button in the player controls opens and closes it (active state when open). Docked under the canvas in portrait (at most 240pt tall, the canvas shrinks to fit) and beside it in landscape (half the width).

### Segmented control
One choice from a few, all visible at once: equal segments on a fully rounded `surface` track (4 padding), each 36 tall; the chosen one is a `primary-soft` pill with a bold `primary` label and, if it has one, a filled `primary` icon; the others have a medium `ink-2` label and a `muted` regular icon. A radio group for screen readers. In code: `<SegmentedControl label options value onChange>` (`src/components/segmented-control.tsx`). Used for settings and the sandbox presets.

### Chips
Pill, height 36, tinted fill (e.g. the streak chip: `signal` 12% fill, `Flame` fill icon, mono count, `muted` unit).

---

## 7. Visualisation canvas

The canvas follows the same tokens, which Skia reads from the theme (see section 10).

### Elements
| Element | Style |
|---|---|
| Cell / bucket / node | `surface-raised` fill, 1.5px `line-strong` border, `radius-sm`, mono value centred |
| Array cell | 46 × 52, value `value-lg` 20 |
| Array row | Every slot of the capacity drawn (empty ones as plain cells) in a 2px `line-strong` frame with 10 padding, `danger` when an index is out of bounds. Indices under the row; memory addresses under those when a lesson shows them. Pointers (`i`, `mid`) point down from above. Range pointers (binary search's `low` and `high`) point up from under the indices in `ink-2`, quieter than the `signal` pointer in focus; the row keeps room for them even while none show, so the drawing doesn't resize. Two pointers at one cell on the same side sit either side of their shared arrow (`low ↑ high`). Binary search dims the half it rules out (`dimmed`), marks mid `active` and a match `found`. Sorts mark the pair being compared `active`, two items trading places `swapping` (they move along a `--viz-swap-arc` (30) arc, the right-mover rising and the left-mover dipping, so they pass each other), and items in place `sorted`. Insertion sort's key is lifted out a cell's height above the row, over the gap, and the row keeps that room at rest too. A value's letter tag (`5a`, to show stability) is its cell's second line. Merge sort draws its **split levels** under the array: one row per level of recursion, `--viz-level-gap` (18) apart, as faint (`dimmed`) empty slots; each level adds a `--viz-split-gap` (14) wherever a range has split, and the rows are centred on each other like an upside-down tree. Items move down a row when their range splits and back up when it merges; outside the range being worked on they're `dimmed`. While a dynamic array grows, the old array (1.5px `line` frame, labelled "old array") sits 32 above the new one; each item moves down as it's copied, leaving a `dimmed` copy behind |
| Linked-list row | Nodes 46 × 44 (value only), 36 apart, joined by `edge` arrows clipped to the boxes; the arrow just re-aimed is `signal`. A doubly linked list draws `next` 6 above the centre line and `prev` 6 below. `null` (`muted`, `danger` on an error) follows the last node. A node being linked in or out is raised one row above (32 gap), dimmed when it's leaving. `head`, `tail`, `prev`, `cur`, `next` labels stack under their node in that order, each with an up arrow |
| Hash table | A vertical bucket column, indices to the left. **Chaining:** 44 × 40 buckets (a `•` when occupied) with chains running right: entries 84 × 44, key over its value in mono 12 `muted`, joined by `edge` arrows 36 apart. **Linear probing:** one 84 × 44 slot per bucket holding its entry; a tombstone is a `dimmed` `×` over "deleted"; a `signal` probe arrow runs down beside the slots from the bucket just tried to the next. The bucket in focus takes the step's state (active, collision, error). A callout row above the table is always reserved. While resizing, the old table stands left of the new one, labelled "old table" and "new table" underneath |
| Growth chart | A 260 × 170 plot with recessive `edge` axes marked only at 0 and their ends (and "steps" above the y-axis). The x-axis runs to the first of 10, 20, 50 … 1,000 that holds `n`, and the y-axis to 4 × that, so the curves keep their shapes as it zooms (old curves cross-fade into new ones). Curves are 2px `curve-*` lines, clipped where they leave the top; each has a direct label in `ink-2` (`signal-ink` in focus) where it ends, nudged apart when crowded. The `n` marker is a `signal` line with `n = 8` below it, and an 8px dot where it meets each curve. A sample run adds an `active` dot that climbs the marker, with a `steps = 37` callout above the chart, and turns `found` when it lands |
| Queue row | Like the array row, for the full capacity: `front` points down from above, `rear` up from below the indices. A circular buffer adds a wrap-around arc (`edge`) from the last slot back to slot 0; a plain array dims the slots before the front. A value that didn't fit shows just past the frame |
| Bucket | 44 × 40, a small `ink` dot when occupied |
| Linked node | Auto width, height 44, name 15/700 over mono 12 detail |
| Stack container | U-shape, 2px `line-strong` (`danger` on overflow / underflow), open top, 18px bottom radius. Drawn for the full capacity so the canvas never changes height; one slot above it shows a value that didn't fit. Items are 132 × 44, 8 apart, with 10 padding. The `top →` pointer sits to the left |
| Input row | An expression read left to right (bracket checker), above the structure: one 28 × 40 cell per character, 4 apart, mono value. Read characters are `dimmed`, the current one `active` (`found` when it matches, `error` when it fails), unread ones default. The structure is centred under the row |
| Analogy scene | Hand-built picture from the same parts. **Browser back button:** a window frame (1.5px `line-strong`, toolbar with a `‹ Back` label in `muted`, `signal-ink` when pressed) showing the current page as a stack-sized item, and a "Back stack" U-container to its right, 32 apart. Column labels in `label` style, `muted` |
| Edge / arrow | 1.5px `edge`, rounded caps, small open arrowhead |
| Index label | `index` style, `muted`, under array and queue cells, left of buckets |
| Pointer label | Mono 13, `signal-ink`, with a `signal` arrow (`top →`, `j`, `j+1`) |
| Callout | Mono 15, `signal-soft` fill, `radius-sm`, padding 8 × 12 (`h("Sid") = 2`) |
| Counters | Mono `index`, `ink-2` (`comparisons 7   reads 3`): only counters above 0, in the order comparisons, reads, writes, swaps; the one that changed on this step in `signal-ink`. In the lesson they sit at the left of a row above the canvas (never over it); in the sandbox, under the stat chips, on a line kept even when empty |

### State palette

Each state is shown by more than colour alone (border weight, fill, icon or label), so it stays readable for colour-blind users.

| State | Treatment |
|---|---|
| Default | `surface-raised` fill, 1.5px `line-strong` border |
| **Active / comparing / current** | 2px `signal` border, `signal-soft` fill |
| **New / inserted** | Same as active, plus an enter animation |
| **Collision** | Bucket gets a 2px `signal` border, its dot turns `signal`, and the caption names it |
| **Swapping** | Active style while the elements move along a short arc |
| **Pivot** (quick sort) | 2px `primary` border, `primary-soft` fill |
| **Visited** (graphs, trees) | `primary-soft` fill, `line-strong` border |
| **Found / sorted / done** | 2px `success` border, `success-soft` fill (plus a check on "found") |
| **Error** (overflow, not found) | 2px dashed `danger` border, `danger-soft` fill, message in the caption |
| **Dimmed** (out of focus) | 40% opacity |

A legend sheet listing these states is always one tap away. The lesson screen shows an inline legend only for the states visible in the current step: a `surface` capsule at the right of the row above the canvas, with the `Swatches` icon and, per state, a 14px swatch painted exactly as the canvas paints it plus its name (Current, New, Collision, Visited, Found, Error, Faded…). Tapping it opens the legend sheet: one row per group of look-alike states (swatches, bold name, what it means), then "Also on the canvas" (pointers, arrows, callouts, counters).

### Composition
- The canvas is centred in the free space between the header and the caption, with the 24 gutter.
- Captions sit **below** the canvas, never on top of it.
- One callout at most per step.

---

## 8. Motion

Built with Reanimated (see TECH-STACK.md).

| Motion | Spec |
|---|---|
| Element move / swap / resize | 400ms at 1×, ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)`. Timing, not a spring: no finger is involved (expo-animation skill). Every canvas duration is divided by the playback speed (0.25× to 4×). |
| Highlight in/out (state colours, border weight, dimming) | 150ms ease-out `cubic-bezier(0.23, 1, 0.32, 1)` |
| Insert / remove | Scale 0.9 → 1 with a fade in, 200ms. Removed elements fade out over 200ms, then leave. |
| Button press | Scale 0.97, 120ms, ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Reduced motion: opacity 0.7 instead. Rows highlight instead of scaling |
| Sheets | Native sheet spring |
| Screen transitions | Native stack transitions (Expo Router) |
| Tab bar pill | On a tab switch the cobalt pill slides and resizes to the new tab, the tabs re-flow to their new widths, and the new name fades in while the old one fades out, all together: 250ms ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)`. The screens themselves switch instantly; only the pill moves. Reduced motion: everything snaps. Values in `config.motion.tabBar`. |

**Reduced motion:** nothing moves or scales. Elements jump to their new place, and colours and fades take 150ms. Haptics follow their own setting.

All canvas values live in `config.motion.canvas`.

**Haptics (P1):** light on step change via swipe, medium on collision / swap / found, success notification on a correct answer.

---

## 9. Accessibility

Measured contrast on the light theme (`background` `#FAF8F4` unless noted):

| Pair | Ratio |
|---|---|
| `ink` on `background` | 15.3 : 1 |
| `ink-2` on `background` | 8.8 : 1 |
| `muted` on `background` | 5.2 : 1 |
| `muted` on `surface` | 4.7 : 1 |
| `on-primary` on `primary` | 6.1 : 1 |
| `primary` text on `primary-soft` | 5.1 : 1 |
| `success-ink` on `success-soft` | 5.2 : 1 |
| `signal-ink` on `background` | 5.1 : 1 |
| `signal` as a graphic on `background` | 3.2 : 1 |
| `line-input` on `background` | 3.3 : 1 |

Dark theme: `ink` 14.5:1, `muted` 6.4:1, `primary` text 6.6:1, `on-primary` on `primary` 6.8:1.

**Rules**
- Never use colour alone. Every state also has a border change, icon, label or pattern (section 7).
- Touch targets are at least 44 × 44.
- Every icon-only button has an accessibility label ("Previous step", "Show code").
- Each lesson step exposes a screen-reader summary of the canvas state (e.g. "Bucket 2 holds Jim and Sid. Collision.").
- Respect system text size, reduced motion and bold text.

---

## 10. Implementation notes

- **Every value in this spec is a token in `src/theme/tokens.css`**: colours (light and dark), fonts, type sizes, spacing, radii, icon sizes and canvas sizes. To change the look, edit that file and nothing else. No component contains a hex value, pixel size or font name (ARCHITECTURE.md §9). The token names match this document, e.g. `--color-background`, `--color-surface`, `--color-primary`, `--color-signal`, `--color-success-soft`, `--color-cat-hashing`.
- **Motion values** in §8 (durations, springs, press scale) are behaviour, so they live in `src/config/motion.ts`.
- **Screens** use class names such as `bg-background text-ink`, `bg-primary text-on-primary`, `text-muted`.
- **Soft tints** (`*-soft`) are defined as their own tokens (pre-mixed colours or colour-with-alpha), so components never compute alpha themselves.
- **Skia canvas** reads the same variables with `useCSSVariable` and passes them into Reanimated shared values. When the theme changes, the canvas colours update in step with the UI.
- **Fonts** are registered once per weight under role names (`app-sans`, `app-sans-medium`, `app-sans-bold`, `app-mono`, `app-mono-medium`). `src/theme/fonts.ts` decides which typeface fills each role; it is the only file that names a font.
- **Icons** all go through the `<Icon>` wrapper (TECH-STACK.md §7b), which takes a token colour, never a hex value.

---

## 11. Screen reference

These match the concept canvas.

| Screen | Key layout |
|---|---|
| **Home** | `display` "Learn" with a one-line `body-sm` subtitle (+ streak chip once streaks exist, P1) → each category: `overline` name with a `label` topic count on the right, then topic cards two per row → tab bar. No Continue card: each card shows its own progress, and the Topic screen's Continue button resumes |
| **Topic** | *(Removed in the UI rework: a topic opens its lesson directly. Summary and stats live in the reference sheet; Sandbox and Practice in the lesson's top bar.)* |
| **Lesson player** | **Always landscape and full screen**: the status bar and Android's navigation bar are hidden while it's open (immersive, like the reference), so the screen reaches every edge. Top bar (56, hairline below): back · topic name (`body-sm` bold) over chapter title (`label`) · speed · code · progress-bar toggle · chapters · reference · sandbox · practice (ghost icon buttons; code and progress bar show their active state) → canvas, with the code panel beside it when open → scrubber (can be hidden for a taller canvas; the choice is remembered) → one row: prev (step) · **play** · centred `caption` (two lines reserved) · a mono `index` "34 / 54" counter when the scrubber is hidden · next (step). Chapters open in a side panel |
| **Legend sheet** | Form sheet over the lesson, landscape: `title` "Legend" → the state groups (swatches · name · meaning) → "Also on the canvas" |
| **Reference sheet** | Category glyph + topic name overline → `title` "Reference" → summary → "How it scales" stat strip → the cheat sheet: a segmented control of its tabs (Overview, Complexity, Pitfalls, plus topic tabs such as Hashing) → the tab's blocks: `overline` headings, `body` text and bulleted lists (6px `muted` dots) in `ink-2` with key terms bold, and tables (hairline `line` border and row dividers, a `surface` header row in bold `label`, the first column taking the spare width, complexities and numbers in mono `code`) |
| **Sandbox** | Portrait. Back · `Sandbox` overline in `mode-sandbox-ink` over the topic title · undo · reset → the canvas in a `surface` panel (`radius-xl`) taking most of the screen, with the stats as small pills in its top corner (`label` name + mono `index` value on `surface-raised`, hairline `line` outline) → `caption` (two lines reserved) → scrubber (only when a trace has more than one step) → **the dock**: one `surface-raised` card (`radius-xl`, hairline `line-strong` outline, 12 padding, 12 from the screen edges) holding the tool switch when the topic has more than one tool (Stack: "Stack" / "Bracket checker"), the presets as a segmented control (on a `surface` track; the current one `primary-soft` with a bold `primary` label), the input next to the primary action (the value field with Random inside it, or the bracket checker's expression field, filled by its presets), and the other actions as tinted buttons in one row. The dock rises with the keyboard |
| **Practice (quiz)** | Close · segmented progress · mono "3/10" → `overline` (topic · question kind) + `title` question → mono context block on `surface` (when the question has one) → option tiles → after answering, the feedback panel pinned to the bottom with "See in lesson" and Continue / See results → results: `display` "Quiz done" (or "All correct"), mono score, the questions now on the revise list, Try again and Done |
| **Practice tab** | `display` "Practice" + `body-sm` subtitle → **Next up** card (`surface-raised`, hairline outline, `radius-xl`: `overline` "Next up" in `mode-practice-ink`, a `headline` suggestion, a `body-sm` detail, the topic glyph(s) on the right, and one `primary` button). It suggests, in order: revising missed questions ("Revise 3 missed questions", naming their topics), the first quiz not tried ("Try the Stack quiz"), the lowest score ("Beat your 6/10 in Queue"), or, when every quiz is perfect, says so with a `success` check and no button → `overline` "Topic quizzes" with "3 of 7 tried" → quiz cards, two to a row like Home. There's no Progress tab: chapter progress shows on Home's topic cards and scores here (F-1001); a Progress tab returns with streaks and stats (Step 13.4) |
| **Lesson (dark)** | Same as the lesson player, plus the code panel beside the canvas with the current line highlighted |
| **Settings** | `display` "Settings" over a `body-sm` note that changes save as you make them → sections (`overline` title, `surface-raised` card with a hairline `line-strong` outline and `radius-xl`, rows divided by `line` hairlines): Appearance (theme: Device / Light / Dark with icons), Lessons (code language, playback speed, progress bar), Motion and feel (reduce motion, haptics). A choice row has its `body` medium name and `label` hint, with a full-width **segmented control** underneath; an on/off row has a native `@expo/ui` switch (tinted `primary`) on the right |

---

## 12. Don'ts

- Don't use pure `#FFFFFF` or `#000000` for backgrounds or text.
- Don't put icons on coloured tiles or squircles.
- Don't use `signal` orange for buttons, or `primary` cobalt for canvas states.
- Don't add drop shadows, gradients, glassmorphism or emoji.
- Don't use more than one solid primary button per screen.
- Don't use colour alone to show a state.
- Don't put captions on top of the visualisation.
- Don't add dividers between list rows. Use space instead.

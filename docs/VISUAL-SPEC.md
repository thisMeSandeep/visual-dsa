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
| `surface-raised` | `#FFFDF9` | `#24221F` | Canvas cells/nodes, inputs, quiz tiles |
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

### 2.5 Colour budget

- Each screen has **at most one** solid `primary` button.
- `signal` appears only inside the visualisation canvas and the code panel, plus the streak flame. It is never used for buttons.
- Category colours appear only on glyphs and overlines, never as large fills.

---

## 3. Typography

**Atkinson Hyperlegible Next** for all UI text. **Atkinson Hyperlegible Mono** for values, indices, pointers, code, counters and Big-O notation.

| Style | Font | Size / line height | Weight | Notes |
|---|---|---|---|---|
| `display` | Next | 34 / 1.1 | 700 | Screen titles ("Learn", "Hash Table"), letter-spacing −0.02em |
| `title` | Next | 28 / 1.25 | 700 | Quiz questions |
| `headline` | Next | 26 / 1.2 | 700 | Card titles (Continue card) |
| `caption-lg` | Next | 19 / 1.5 | 400 (bold terms 700) | **Lesson step captions**, the most important reading text |
| `body` | Next | 17 / 1.5 | 400 | Summaries, list titles (500) |
| `body-sm` | Next | 15–16 / 1.5 | 400 | Explanations, button labels (700) |
| `label` | Next | 13–14 / 1.4 | 400 | Secondary lines ("4 chapters"), stat labels |
| `overline` | Next | 12 / 1.3 | 500–700 | UPPERCASE, letter-spacing 0.1em, section labels |
| `tab` | Next | 12 | 400 (active 700) | Tab bar labels |
| `value-lg` | Mono | 20–28 | 500 | Canvas cell values, quiz answer numbers |
| `value` | Mono | 15–17 | 500 | Stack items, stats (`O(1)`), callouts |
| `code` | Mono | 13 / 1.9 | 400 | Code panel |
| `index` | Mono | 12–13 | 400 | Array indices, bucket numbers, step counters (`6 / 70`) |

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
- Bottom sheets (chapter index, code, reference) use a `surface-raised` sheet with a 36×4 grabber and a 40% scrim.

---

## 5. Iconography

- **Library:** Phosphor (`phosphor-react-native`).
- **Weights:** `regular` everywhere. `fill` for the active tab and for filled glyphs (Play/Pause, streak flame). `duotone` only for empty states and achievements.
- **Sizes:** 18 inside buttons, 20 for small icon buttons, 22 in headers, 24 in the tab bar.
- **Colour:** `ink` by default. `muted` for inactive tabs. `primary` for the active tab and for icons on primary-tinted controls (e.g. the code toggle). Mode colour on Sandbox/Practice buttons.
- **No background tiles.** Icons sit directly on the surface.
- **Topic glyphs:** custom line drawings on a 24 grid with a 1.7 stroke, rounded joins, drawn at 30px in the category colour. They show the structure itself (boxes in a row, chained boxes, stacked bars, bucket column).

| Need | Phosphor icon |
|---|---|
| Close / back | `X`, `CaretLeft` |
| Chapters | `ListNumbers` |
| Play / pause / step | `Play` (fill), `Pause` (fill), `CaretLeft`, `CaretRight` |
| Code panel | `Code` |
| Reset / random | `ArrowCounterClockwise`, `Shuffle` |
| Bookmark | `BookmarkSimple` |
| Tabs | `BookOpen` (Learn), `GraduationCap` (Practice), `ChartLineUp` (Progress), `Gear` (Settings) |
| Streak | `Flame` (fill, `signal`) |
| Done / correct | `Check` (`success`) |
| Prediction prompt | `Lightbulb` (fill, violet) |

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

Press feedback: scale to 0.97 with 120ms plus a light haptic on the primary and play buttons.

### Continue card
`primary-soft` background, `radius-xl`, padding 24. Contents: overline "Continue" in `primary`, `headline` topic name, `label` position ("Collision · step 6 of 70"), then a 4px progress bar (`primary` on a `primary` 18% track) and a Resume pill.

### Topic row
30px category glyph · title (`body` 500) over `label` ("5 chapters") · trailing status: success `Check` when done, mono `2/5` when in progress, a `primary` dot plus count for the current topic. There are no dividers between rows.

### Chapter row
Mono number · title · trailing status. The current chapter gets a `primary-soft` row background, a `primary` number and a "Step 6" label. Completed chapters show a success check.

### Stat strip
Three equal columns between two `line` hairlines. `label` on top, mono `value` below (`O(1)`, `size 4`).

### Tab bar
Four tabs: Learn, Practice, Progress, Settings. `background` fill with a top `line` hairline. Active tab uses a `primary` fill icon and a bold label. Inactive tabs use `muted` regular icons.

### Progress
- **Bar:** 4px, `radius-full`, `primary` on `line` (or a `primary` 18% track on tinted cards).
- **Segmented** (quiz): N equal segments with a 4px gap. Done segments are `primary`, the rest `line`.
- **Scrubber:** bar plus a 14px `primary` knob, with mono step numbers at each end.

### Inputs
Height 52, `surface-raised` fill, 1.5px `line-input` border, `radius-md`, mono 17 for values. The label sits above in `label` style. Focus: 2px `primary` ring.

### Quiz option tile
Height 92, `radius-lg`, `surface-raised` with a `line-strong` border. Small "Bucket" label over a mono 28 value. **Correct:** 2px `success` border, `success-soft` fill, success check badge. **Wrong:** 2px `danger` border, `danger-soft` fill, `X` badge.

### Feedback panel
Bottom panel inset 16, `radius-xl`, `success-soft` (or `danger-soft`) fill. Heading in `success-ink` ("Correct"), then the explanation in `body-sm` `ink-2`, then a full-width primary button.

### Code panel
`surface` block, `radius-lg`, mono 13/1.9. Line numbers in `muted`. **Current line:** `signal-soft` background, with the line number in `signal-ink`. Docked under the canvas in portrait and beside it in landscape.

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
| Bucket | 44 × 40, a small `ink` dot when occupied |
| Linked node | Auto width, height 44, name 15/700 over mono 12 detail |
| Stack container | U-shape, 2px `line-strong`, open top, 18px bottom radius |
| Edge / arrow | 1.5px `edge`, rounded caps, small open arrowhead |
| Index label | `index` style, `muted`, above cells or left of buckets |
| Pointer label | Mono 13, `signal-ink`, with a `signal` arrow (`top →`, `j`, `j+1`) |
| Callout | Mono 15, `signal-soft` fill, `radius-sm`, padding 8 × 12 (`h("Sid") = 2`) |
| Counters | Mono 13, `ink-2` (`comparisons 7   swaps 3`) |

### State palette

Each state is shown by more than colour alone (border weight, fill, icon or label), so it stays readable for colour-blind users.

| State | Treatment |
|---|---|
| Default | `surface-raised` fill, 1.5px `line-strong` border |
| **Active / comparing / current** | 2px `signal` border, `signal-soft` fill |
| **New / inserted** | Same as active, plus an enter animation |
| **Collision** | Bucket gets a 2px `signal` border, its dot turns `signal`, and the caption names it |
| **Swapping** | Active style while the elements move along a short arc |
| **Visited** (graphs, trees) | `primary-soft` fill, `line-strong` border |
| **Found / sorted / done** | 2px `success` border, `success-soft` fill (plus a check on "found") |
| **Error** (overflow, not found) | 2px dashed `danger` border, `danger-soft` fill, message in the caption |
| **Dimmed** (out of focus) | 40% opacity |

A legend sheet listing these states is always one tap away. The lesson screen shows an inline legend only for the states visible in the current step.

### Composition
- The canvas is centred in the free space between the header and the caption, with the 24 gutter.
- Captions sit **below** the canvas, never on top of it.
- One callout at most per step.

---

## 8. Motion

Built with Reanimated (see TECH-STACK.md).

| Motion | Spec |
|---|---|
| Step transition (1× speed) | 400ms, ease-in-out. Scales with the playback speed (0.25× to 4×). |
| Element move / swap | Spring (damping ~18, stiffness ~180). Swaps move along a small arc so the elements don't overlap. |
| Highlight in/out | 150ms colour/opacity fade |
| Insert / remove | Scale 0.9 → 1 with a fade, 200ms |
| Button press | Scale 0.97, 120ms |
| Sheets | Native sheet spring |
| Screen transitions | Native stack transitions (Expo Router) |

**Reduced motion:** element moves become 150ms cross-fades, and springs and arcs are turned off. Haptics follow their own setting.

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
- **Fonts** are registered once per weight. Map `font-sans` to Atkinson Hyperlegible Next and `font-mono` to Atkinson Hyperlegible Mono.
- **Icons** all go through the `<Icon>` wrapper (TECH-STACK.md §7b), which takes a token colour, never a hex value.

---

## 11. Screen reference

These match the concept canvas.

| Screen | Key layout |
|---|---|
| **Home** | `display` "Learn" + streak chip → Continue card → categories with topic rows → tab bar |
| **Topic** | Back / bookmark → category overline with glyph → `display` title + summary → stat strip → primary "Continue lesson" + Sandbox / Practice mode buttons → chapter list |
| **Lesson player** | Close · title/chapter · chapters button → canvas (callout + structure) → `caption-lg` caption → scrubber → speed · prev · **play** · next · code |
| **Sandbox** | Back · title · reset → live structure with pointers → stat strip → value input + random → primary action + tinted secondary actions |
| **Practice** | Close · segmented progress → overline + `title` question → mono context block → 2×2 option tiles → feedback panel + Continue |
| **Lesson (dark)** | Same as the lesson player, plus the docked code panel with the current line highlighted |

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

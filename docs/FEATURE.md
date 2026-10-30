# FEATURES LIST

This list is based on [IDEA.md](./IDEA.md). Each feature has an ID so other docs (implementation plan, tests) can refer to it.

**Priority**
- **P0 (MVP):** required for the first release.
- **P1 (v1.x):** comes soon after launch.
- **P2 (Later):** nice to have, or depends on traction.

---

## 1. Home & Navigation

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-101 | Topic grid | Home screen with cards for each topic, each with an illustration, title, and progress ring. Grouped by category (Foundations, Linear, Hashing, Trees, Graphs, Algorithms). | P0 |
| F-102 | Topic detail screen | Overview of a topic: short summary, list of chapters, and buttons to enter **Learn / Play / Practice**. | P0 |
| F-103 | Search | Search topics and chapters by name (e.g. "collision", "BFS"). | P1 |
| F-104 | Continue where you left off | Home banner that resumes the last lesson at the exact step. | P0 |
| F-105 | Learning paths | Curated sequences such as "Beginner", "Interview in 2 weeks", "Graphs deep-dive". | P2 |
| F-106 | Portrait + landscape | Every screen works in both orientations. The canvas reflows instead of forcing landscape. | P0 |

## 2. Learn Mode: Guided Lessons

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-201 | Step-based lessons | Each lesson is a sequence of steps. Each step has a visual state and one short caption. A step counter shows progress (e.g. `9 / 58`). | P0 |
| F-202 | Next / previous step | Large buttons plus swipe left/right to move between steps. The animation runs forward, or in reverse when going back. | P0 |
| F-203 | Chapter index | Bottom sheet listing named chapters (e.g. *Introduction → Hash function → Insert Jim → Collision → Search*). Tap to jump. | P0 |
| F-204 | Rich captions | Captions support **bold** terms, inline code, and tappable glossary words that open a definition. | P0 |
| F-205 | Focus highlighting | The active element is lit and the rest are dimmed. Arrows and pointers show movement (e.g. `A[0]`, `top`, `h("Jim") = 16`). | P0 |
| F-206 | Real-world examples | Analogy scenes inside a lesson (browser back-stack, phone book, print queue, maps for graphs). | P1 |
| F-207 | Worked examples | Named example sections inside a topic (e.g. "Example 2: Balancing parentheses"). | P0 |
| F-208 | Interactive steps | Some steps let the user act (tap Push/Pop, pick a bucket) before the lesson continues. | P1 |
| F-209 | Restart lesson | Reset the lesson to step 1. | P0 |
| F-210 | Narration (audio) | Optional text-to-speech for captions, for hands-free learning. | P2 |

## 3. Visualisation Canvas

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-301 | Native animations | Smooth 60fps transitions for insert, delete, swap, move, and highlight, built with Reanimated plus Skia/SVG. | P0 |
| F-302 | Structure renderers | Reusable renderers for array, linked list (singly/doubly/circular), stack, queue/deque, hash table (chaining + open addressing), tree, heap, trie, graph, DP table/grid. | P0 (linear + hash), P1 (trees, graphs), P2 (DP) |
| F-303 | Pan & zoom | Pinch to zoom and drag to pan large structures (trees, graphs, long arrays). Double-tap to fit. | P1 |
| F-304 | Auto-layout | Trees and graphs lay out cleanly without overlap and re-layout with animation as they change. | P1 |
| F-305 | Pointer & variable labels | Floating labels for `i`, `j`, `head`, `tail`, `top`, `low/mid/high`, etc., which move with the animation. | P0 |
| F-306 | Colour semantics | Consistent colours for states (comparing, swapping, visited, found, collision, sorted). A legend is available on demand. | P0 |
| F-307 | Haptic feedback | Light haptics on key events: collision, swap, match found, stack overflow. | P1 |

## 4. Playback Controls

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-401 | Play / pause | Autoplay through the steps. | P0 |
| F-402 | Speed control | 0.25× to 4× speed slider. | P0 |
| F-403 | Timeline scrubber | Drag to any step. The visual state updates instantly. | P1 |
| F-404 | Step granularity | Toggle between "operation" steps (one insert) and "micro" steps (every comparison). | P2 |

## 5. Code Panel

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-501 | Synced code highlighting | The line currently running is highlighted alongside the animation. | P0 |
| F-502 | Multiple languages | Pseudocode, JavaScript, Python, Java, C++. Switch at any time while the highlight stays in sync. | P0 (pseudo + 1 lang), P1 (rest) |
| F-503 | Live variables | A watch panel shows variable values at the current step (`i = 3`, `top = 5`, `load = 0.6`). | P1 |
| F-504 | Call stack view | For recursive algorithms, shows the stack of calls growing and shrinking. | P2 |
| F-505 | Copy code | Copy the full implementation to the clipboard. | P0 |
| F-506 | Collapsible / split view | The code panel docks below the canvas in portrait and beside it in landscape. Can be collapsed. | P0 |

## 6. Play Mode: Sandbox

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-601 | Custom input | Enter your own data (array values, keys, strings, graph edges). | P0 |
| F-602 | Random & preset inputs | One-tap random input plus edge-case presets: empty, single, sorted, reversed, duplicates, worst-case. | P0 |
| F-603 | Free operations | Run any supported operation on the live structure (push/pop, insert/delete/search, enqueue/dequeue, traverse, sort). | P0 |
| F-604 | Graph / tree editor | Tap to add nodes, drag to connect edges, long-press to set weights or delete. | P1 |
| F-605 | Configurable parameters | Hash table size, hash function, collision strategy, heap type (min/max), graph directed/weighted. | P1 |
| F-606 | Error states | Show overflow, underflow, key-not-found, and invalid-input states visually instead of failing silently. | P0 |
| F-607 | Save & share scenario | Save a sandbox state and share it as a link/QR that opens the same setup. | P2 |

## 7. Practice Mode: Quizzes & Challenges

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-701 | Topic quiz | Multiple-choice and true/false questions at the end of each topic. | P0 |
| F-702 | Predict the next step | The animation pauses and asks "Which bucket does Sid go to?" or "What does pop() return?". The user taps an answer on the canvas. | P1 |
| F-703 | Order the steps | Drag shuffled steps into the correct order of the algorithm. | P2 |
| F-704 | Complexity quiz | Pick the time/space complexity for an operation or a code snippet. | P1 |
| F-705 | Explanations | Every answer shows *why*, and links back to the relevant lesson step. | P0 |
| F-706 | Revise list | Wrong answers are added to a personal revision queue. | P1 |

## 8. Reference Sheet

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-801 | Topic cheat sheet | Tabbed reference panel per topic (e.g. Info / Hashing / Load factor / Tombstones), openable from any lesson. | P0 |
| F-802 | Complexity tables | Average and worst case time plus space for each operation. | P0 |
| F-803 | Key concepts & pitfalls | Short bullet points of definitions, gotchas, and when to use the structure. | P0 |
| F-804 | Interview patterns | Common problems that use this structure, with links to their visualisations. | P2 |

## 9. Compare & Complexity

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-901 | Side-by-side compare | Run two algorithms (e.g. bubble vs quick sort) on the same input at the same time. | P1 |
| F-902 | Operation counters | Live count of comparisons, swaps, reads/writes, and memory used. | P0 |
| F-903 | Big O growth chart | Interactive chart of n vs operations, with the user's current input marked on the curve. | P1 |
| F-904 | Race mode | Run several sorts on the same input and see which finishes first. | P2 |

## 10. Progress & Motivation

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-1001 | Per-topic progress | Lessons completed, quiz score, and a mastery level per topic. Chapters done show on Home's topic cards and the best quiz score on the Practice tab; there's no separate Progress tab until streaks and stats arrive (Step 13.4). A mastery level waits for that tab. | P0 |
| F-1002 | Bookmarks | Bookmark any lesson step to come back to later. | P1 |
| F-1003 | Streaks | Daily learning streak with a gentle reminder notification (opt-in). | P1 |
| F-1004 | Achievements | Badges for milestones (first sandbox run, all sorting done, 7-day streak). | P2 |
| F-1005 | Stats dashboard | Time spent, topics mastered, and weak areas. | P2 |

## 11. Settings, Accessibility & Platform

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-1101 | Light / dark / system theme | Full theming, including canvas colours. | P0 |
| F-1102 | Default code language | Choose the preferred language for the code panel. | P0 |
| F-1103 | Default animation speed | Remember the user's preferred playback speed. | P0 |
| F-1104 | Reduced motion | Respect the OS setting by using cross-fades instead of motion and shorter animations. | P0 |
| F-1105 | Dynamic type & screen readers | Scalable text. Screen-reader descriptions of each step's state. | P1 |
| F-1106 | Colour-blind safe palette | State colours are distinguishable and paired with icons/patterns, never colour alone. | P1 |
| F-1107 | Haptics toggle | Turn haptic feedback on or off. | P1 |
| F-1108 | Offline-first | All lessons, visualisers, and quizzes work with no network. Progress is stored locally. | P0 |
| F-1109 | Tablet layout | Wider layouts on tablets, with the canvas, code, and caption visible together. | P1 |
| F-1110 | Account & cloud sync | Optional sign-in to sync progress across devices. | P2 |
| F-1111 | Localisation | UI and lesson captions translatable (English first). | P2 |

---

## MVP Summary (P0)

The first release ships with:

- **Topics:** Big O, Array, Linked List (singly + doubly), Stack, Queue, Hash Table
- **Learn:** step lessons with captions, swipe navigation, chapter index, highlighting, worked examples
- **Canvas:** smooth native animations, pointer labels, colour semantics
- **Playback:** play/pause and speed
- **Code:** synced highlighting in pseudocode + one language, copy code
- **Play:** custom/random input, free operations, visual error states
- **Practice:** topic quiz with explanations
- **Reference:** cheat sheet with complexity tables
- **Platform:** portrait + landscape, light/dark theme, reduced motion, offline-first, local progress

# MOBILE APP IDEA - VISUAL-DSA

## One-liner

Visual-DSA is a React Native mobile app that teaches data structures and algorithms through step-by-step animated walkthroughs. You watch each operation happen, you can rewind it, and then you run it yourself on your own input.

## The problem

Most people learn DSA from text, static diagrams, or long videos. None of these show what happens *between* steps: which pointer moved, why a bucket collided, which element got swapped. Learners memorise code without building a picture of how the structure behaves. Existing visualisers are mostly desktop websites that feel awkward on a phone, and the good mobile ones are closed, limited in topics, or look dated.

## What the reference app gets right

The screenshots in `Dsa images/` come from an existing Android app. Its core pattern works and is worth keeping:

| Pattern | What it looks like in the reference |
|---|---|
| **Topic grid home** | Cards with an illustration and a title (Big O, Array, Linked List, Doubly Linked List, Stack, Queue, ...). |
| **Slide-based lessons** | Each topic is a numbered sequence of frames (e.g. Array 9/58, Hash Table 6/70). Forward and back buttons step through them. |
| **Visual + one caption** | A single visual on top and one short sentence below that explains the current frame. Easy to read on a phone. |
| **Highlight what matters** | The active element is lit and the rest are dimmed (`A[0]`). Arrows show random access. The current parenthesis gets a highlight. |
| **Real-world analogies** | Stack shown as a browser back-stack. Hash table shown as a phone book (`h("Jim") = 16`). |
| **Worked examples inside a topic** | "Example 1: Back Stack", "Example 2: Balancing parentheses", "Insertion", "Search". |
| **Interactive moments** | Push/Pop buttons on a live stack. Scrollable hash-table buckets. |
| **Chapter index** | A "Slides" sheet lists named chapters (Introduction, Hash function, Insert Jim, Collision, Chain Sid, Search, ...) so you can jump around. |
| **Reference sheet** | A tabbed "book" panel (Info, Hashing, Load factor, Tombstones) with complexity tables and key concepts. |
| **Overflow actions** | Code, Quiz, and Restart for each topic. |

## Where it falls short (our opportunity)

- **Looks dated.** Flat grey background, small touch targets, and no dark mode. It feels like a slide deck, not an app.
- **Landscape-only.** Every screen is landscape, so the phone has to be rotated just to learn.
- **Mostly passive.** You tap "next" 50–70 times. Interaction is limited to a few Push/Pop buttons.
- **Fixed data.** You can't use your own input such as an array to sort, keys to hash, or a graph to traverse.
- **Code is separate from the animation.** Code sits behind a menu. You can't see which line runs while the animation plays.
- **No playback control.** No autoplay, speed control, or scrubbing. You can only go one step forward or back.
- **No progress or motivation.** No streaks, completion tracking, or review of weak topics.
- **Limited topic depth.** The visible catalog covers basic structures. Trees, graphs, DP, and interview patterns are where learners struggle most.

## Our vision

**"Watch it, step through it, then break it yourself."**

Every topic moves through three modes:

1. **Learn**: a guided, narrated walkthrough like the reference app, but polished, animated, and responsive in both portrait and landscape.
2. **Play**: a sandbox. Enter your own data, run any operation (insert, delete, search, sort, traverse), and watch the structure respond live.
3. **Practice**: quizzes and "predict the next step" challenges that test understanding, not memory.

## Key features (beyond the reference)

- **Playback controls.** Play/pause, step forward/back, a speed slider, and a scrubbable timeline across every step.
- **Synced code panel.** The current line of pseudocode or real code (JS / Python / Java / C++) highlights as the animation runs. Variables are shown live (`i = 3`, `top = 5`).
- **Custom input.** Type or randomise inputs. Edge-case presets: empty, single element, sorted, reverse-sorted, duplicates.
- **Predict-the-step quizzes.** The animation pauses and asks "which bucket does Sid go to?" or "what does pop return?" before revealing the answer.
- **Algorithm comparison.** Run two sorts side by side on the same input and compare steps, swaps, and comparisons.
- **Complexity made visible.** Live counters for comparisons and swaps, plus a Big O growth chart tied to the input size you chose.
- **Gesture-first UI.** Swipe to step, pinch to zoom large trees and graphs, drag nodes in the graph editor.
- **Modern design.** Light and dark themes, smooth native animations, haptic feedback on key events (collision, swap, match), and accessible text sizes.
- **Progress and retention.** Per-topic completion, streaks, bookmarks, and a "revise" list built from wrong quiz answers.
- **Offline-first.** All lessons and visualisers work without a network connection.

## Topic scope (high level)

The full list will live in `ALGORITHM-CATALOG.md`. At a high level:

- **Foundations:** Big O, recursion, memory/arrays
- **Linear structures:** array, linked lists (singly/doubly/circular), stack, queue, deque
- **Hashing:** hash functions, chaining, open addressing, load factor, tombstones
- **Trees:** BST, AVL / red-black, heap, trie, segment tree
- **Graphs:** BFS, DFS, Dijkstra, topological sort, MST (Prim/Kruskal), union-find
- **Algorithms:** sorting, searching, two pointers, sliding window, backtracking, dynamic programming

## Target users

- **CS students** learning DSA for the first time who need intuition, not only definitions.
- **Interview preppers** who want fast visual revision of patterns before a coding round.
- **Self-taught developers** filling gaps without a classroom.
- **Teachers** who want something to show on a projector or share with a class.

## Why mobile, why React Native

Learners already revise on their phones during commutes, breaks, and before interviews. A phone also suits this content well: short focused steps, touch and gesture interaction, and haptics. React Native gives one codebase for iOS and Android with native-quality animation through Reanimated and drawing through Skia/SVG. The detailed choices go in `TECH-STACK.md`.

## Success looks like

- A first-time learner can explain *why* a hash collision happens or *how* a stack balances parentheses after one lesson.
- Users run the sandbox on their own inputs and don't only tap "next".
- The app looks and feels like a modern native app, not a slide deck in a WebView.

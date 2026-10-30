# ALGORITHM CATALOG

Every topic Visual-DSA teaches, with its lesson outline, sandbox operations, complexity and the visualisation it needs. Priorities match [FEATURE.md](./FEATURE.md). Category colours and canvas states come from [VISUAL-SPEC.md](./VISUAL-SPEC.md).

**Priority**
- **P0 (MVP):** ships in the first release.
- **P1 (v1.x):** comes soon after launch.
- **P2 (Later):** nice to have, or depends on traction.

---

## 1. Overview

| ID | Topic | Category | Priority | Renderer | Chapters |
|---|---|---|---|---|---|
| F1 | Big O Notation | Foundations | **P0** | `growth-chart` | 7 |
| F2 | Recursion | Foundations | P1 | `call-stack` + `tree` | 6 |
| L1 | Array | Linear | **P0** | `array` | 8 |
| L2 | Singly Linked List | Linear | **P0** | `linked-list` | 8 |
| L3 | Doubly Linked List | Linear | **P0** | `linked-list` | 5 |
| L4 | Circular Linked List | Linear | P1 | `linked-list` | 4 |
| L5 | Stack | Linear | **P0** | `stack` | 6 |
| L6 | Queue | Linear | **P0** | `queue` | 6 |
| L7 | Deque | Linear | P1 | `queue` | 4 |
| H1 | Hash Table | Hashing | **P0** | `hash-table` | 10 |
| T1 | Binary Tree & Traversals | Trees | P1 | `tree` | 6 |
| T2 | Binary Search Tree | Trees | P1 | `tree` | 7 |
| T3 | Heap & Priority Queue | Trees | P1 | `tree` + `array` | 7 |
| T4 | AVL Tree | Trees | P1 | `tree` | 6 |
| T5 | Trie | Trees | P2 | `tree` | 5 |
| T6 | Red-Black Tree | Trees | P2 | `tree` | 6 |
| T7 | Segment Tree | Trees | P2 | `tree` + `array` | 5 |
| G1 | Graph Basics | Graphs | P1 | `graph` | 5 |
| G2 | Breadth-First Search | Graphs | P1 | `graph` + `queue` | 5 |
| G3 | Depth-First Search | Graphs | P1 | `graph` + `stack` | 5 |
| G4 | Topological Sort | Graphs | P1 | `graph` + `queue` | 4 |
| G5 | Dijkstra's Shortest Path | Graphs | P1 | `graph` + `table` | 6 |
| G6 | Minimum Spanning Tree (Prim, Kruskal) | Graphs | P2 | `graph` | 6 |
| G7 | Union-Find | Graphs | P2 | `forest` + `array` | 5 |
| G8 | Bellman-Ford | Graphs | P2 | `graph` + `table` | 4 |
| A1 | Binary Search | Algorithms | P1 | `array` | 5 |
| A2 | Bubble Sort | Algorithms | P1 | `array` | 5 |
| A3 | Selection Sort | Algorithms | P1 | `array` | 4 |
| A4 | Insertion Sort | Algorithms | P1 | `array` | 5 |
| A5 | Merge Sort | Algorithms | P1 | `array` (split levels) | 6 |
| A6 | Quick Sort | Algorithms | P1 | `array` | 6 |
| A7 | Heap Sort | Algorithms | P2 | `tree` + `array` | 4 |
| A8 | Counting & Radix Sort | Algorithms | P2 | `array` + `buckets` | 5 |
| A9 | Two Pointers | Algorithms | P1 | `array` | 4 |
| A10 | Sliding Window | Algorithms | P1 | `array` | 4 |
| A11 | Backtracking | Algorithms | P2 | `grid` + `tree` | 5 |
| A12 | Dynamic Programming | Algorithms | P2 | `dp-table` | 7 |
| A13 | Greedy Algorithms | Algorithms | P2 | `array` / `timeline` | 4 |

**Totals:** 38 topics: 7 P0, 20 P1, 11 P2.

---

## 2. Conventions for every topic

### 2.1 Lesson shape
Each topic follows the same arc so that learners know what to expect:

1. **What it is.** A definition in one or two captions, with the structure shown at rest.
2. **Real-world example.** An analogy scene (phone book, browser back button, print queue).
3. **Core operations.** One chapter per operation, each animated step by step.
4. **Edge cases.** Empty, full, single element, duplicates, worst case.
5. **Complexity.** A stat strip plus a short chapter on *why* each cost is what it is.
6. **Recap.** A summary step that links to the Sandbox and to Practice.

### 2.2 Content rules
- **Captions** are at most about 120 characters (two lines at 19px on a phone). Bold only the key terms.
- **Example data fits a phone in portrait:** arrays of 6–8 cells, values 0–99, at most 6–10 hash buckets, trees at most 4 levels deep, graphs of 5–8 nodes.
- **Names** come from a short, friendly, international set for keys (Sam, Jim, Ben, Sid, Kat, Ana, Leo, Mia).
- **Code** is shown as pseudocode plus JavaScript in the MVP. Python, Java and C++ come in P1. Every step references the code line it executes.
- **Each topic** has a sandbox with edge-case presets and at least 8 practice questions, of which at least 3 are "predict the next step".

### 2.3 Fields used below
- **Chapters:** the lesson outline, in order.
- **Sandbox:** the operations a user can run in Play mode, plus their parameters.
- **Complexity:** time per operation (average / worst where they differ) and space.
- **States:** which canvas states from VISUAL-SPEC §7 the topic uses.
- **Presets:** edge-case inputs offered in the sandbox.
- **Practice ideas:** sample "predict the next step" questions.

---

## 3. Foundations

### F1 · Big O Notation (P0)
Category glyph: rising curves · Renderer: `growth-chart` (our own canvas) + live step counter

**Chapters**
1. Why we measure growth, not seconds
2. Counting steps in a loop
3. The common classes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)
4. Dropping constants and smaller terms
5. Best, average and worst case
6. Space complexity
7. Amortised cost (dynamic array push) *(preview, full detail in L1)*

**Sandbox:** an `n` slider (1–1,000, on a log scale so small n is easy to reach). Presets choose which classes are on the chart (all six, fast, slow, n vs n²). Run small sample functions (constant lookup, single loop, nested loop, halving loop) and watch the step counter climb the `n` marker to their curve.

**Practice ideas:** "This loop halves `n` each time. Which class is it?" · "Which curve is lowest at n = 1,000?"

---

### F2 · Recursion (P1)
Renderer: `call-stack` (frames growing and shrinking) + `tree` (recursion tree)

**Chapters:** Base case and recursive case · The call stack · Factorial · Fibonacci and its repeated work · Memoisation preview · Stack overflow

**Sandbox:** run `factorial(n)`, `fib(n)` or `sum(array)`. Step into and out of each call. Toggle memoisation for `fib`.

**Complexity:** factorial O(n) time and O(n) stack · naive fib O(2ⁿ) · memoised fib O(n)
*As built:* the `call-stack` renderer draws the stack and, for Fibonacci, its own small call tree (the full `tree` renderer comes with v1.2). The sandbox runs factorial, Fibonacci, Fibonacci with a memo, and a factorial with no base case, for n set by presets (fact up to 7, fib up to 6). `sum(array)` was left out: it teaches the same as factorial.

---

## 4. Linear structures

### L1 · Array (P0)
Glyph: four boxes in a row · Renderer: `array`

**Chapters**
1. Contiguous memory and indices
2. Access by index (random access)
3. Traversal
4. Linear search
5. Insert at the end and at an index (shifting right)
6. Delete at an index (shifting left)
7. Dynamic arrays: capacity, doubling, amortised O(1) push
8. 2D arrays *(P1 chapter)*

**Sandbox:** `get(i)`, `set(i, x)`, `push(x)`, `insert(i, x)`, `removeAt(i)`, `search(x)`, with an index field beside the value field. It's always a dynamic array: capacity comes from the presets, and a push or insert into a full array doubles it (up to the 12-item limit).

| Operation | Time |
|---|---|
| Access / update by index | O(1) |
| Search (unsorted) | O(n) |
| Push to end (dynamic) | O(1) amortised, O(n) on resize |
| Insert / delete at index | O(n) |
| Space | O(n) |

**States:** active (current index), new (inserted), dimmed (shifted cells mid-move), found, error (index out of bounds)
**Presets:** empty, single, full capacity (forces a resize), duplicates
**Practice ideas:** "Insert 7 at index 2. Which values move?" · "Capacity is 4 and size is 4. What happens on `push`?"

---

### L2 · Singly Linked List (P0)
Glyph: three chained boxes · Renderer: `linked-list`

**Chapters**
1. Nodes and `next` pointers
2. Head (and optional tail) pointer
3. Traversal
4. Insert at head
5. Insert at tail and after a node
6. Delete a node (re-linking)
7. Search
8. Reverse a list *(classic interview problem)*

**Sandbox:** `insertHead(x)`, `insertTail(x)`, `insertAfter(node, x)`, `delete(x)`, `search(x)`, `reverse()`, with a Node field beside the value field. The tail-pointer toggle is two tools, **Head only** and **Head and tail**.

| Operation | Time |
|---|---|
| Access by position | O(n) |
| Insert / delete at head | O(1) |
| Insert at tail | O(1) with a tail pointer, otherwise O(n) |
| Delete a value | O(n) (find, then O(1) re-link) |
| Search | O(n) |
| Space | O(n) |

**States:** active (current pointer), new, found, dimmed, error (value not found)
**Presets:** a few nodes (its hint suggests deleting the head and the tail), empty, single node, long list (8 nodes, so it fits until pan and zoom arrive in Step 12.1)
**Practice ideas:** "After `prev.next = cur.next`, which node is unreachable?" · "During reverse, what does `prev` point to after step 3?"

---

### L3 · Doubly Linked List (P0)
Renderer: `linked-list` (two arrows per link)

**Chapters:** `prev` pointers · Insert at both ends · Delete a known node in O(1) · Traverse backwards · Trade-off: extra memory per node

**Sandbox:** the L2 operations (without reverse) plus `insertBefore(node, x)`, `traverse()` and `traverseBackward()`. It always keeps a tail pointer.

**Complexity:** insert/delete at either end O(1) · delete a known node O(1) · search O(n) · space O(n) (two pointers per node)

---

### L4 · Circular Linked List (P1)
**Chapters:** Last node points to head · Traversal without a null end · Insert / delete · Use case: round-robin scheduling
**Complexity:** same as L2. Insert at head is O(1) when a tail pointer is kept.

---

### L5 · Stack (P0)
Glyph: stacked bars · Renderer: `stack`

**Chapters**
1. Last in, first out
2. Push, pop and peek
3. Example 1: browser back button
4. Example 2: balancing parentheses
5. Implementations: array-backed vs linked-list-backed
6. Overflow and underflow

**Sandbox:** `push(x)`, `pop()`, `peek()`, `clear()`. Parameter: capacity (for overflow). Mini-tool: run the parentheses checker on your own expression.

| Operation | Time |
|---|---|
| Push / pop / peek | O(1) |
| Search | O(n) |
| Space | O(n) |

**States:** active (`top` pointer), new (pushed), error (overflow / underflow)
**Presets:** empty (pop → underflow), full (push → overflow), balanced `((5+3)+1)(2+9)`, unbalanced `(()`
**Practice ideas:** "The stack is [7, 4, 2] with 2 on top. What does `pop()` return?" · "At this `)`, what's on top of the stack?"

---

### L6 · Queue (P0)
Glyph: row of boxes with an arrow · Renderer: `queue`

**Chapters**
1. First in, first out
2. Enqueue, dequeue and front
3. Example: printer queue
4. Naive array queue and why it wastes space
5. Circular buffer (head/tail wrap-around)
6. Preview: queues in BFS

**Sandbox:** `enqueue(x)`, `dequeue()`, `front()`, `clear()`. Two tools act as the circular-buffer toggle: **Circular** (head and tail indices wrap) and **Plain array** (freed slots are wasted). Capacity comes from the presets.

| Operation | Time |
|---|---|
| Enqueue / dequeue / front | O(1) |
| Space | O(n) |

**States:** active (front and rear pointers), new, dimmed (dequeued slot), error (empty / full)
**Presets:** circular: a few items, empty, full, wrap-around (tail index past the end); plain array: a few items, wasted slots
**Practice ideas:** "head = 4, tail = 1, capacity = 6. How many items are in the queue?"

---

### L7 · Deque (P1)
**Chapters:** Both ends open · Push/pop at front and back · Circular-buffer implementation · Use case: sliding-window maximum (links to A10)
**Complexity:** all end operations O(1)

---

## 5. Hashing

### H1 · Hash Table (P0)
Glyph: bucket column with a chain · Renderer: `hash-table` (vertical bucket list, chains to the right)

**Chapters** *(based on the reference app, rebuilt)*
1. Introduction: buckets and key-value pairs (phone book example)
2. Hash function: key → index (`h(key) % size`)
3. Inserting keys
4. Collision
5. Separate chaining
6. Search
7. Delete
8. Load factor and resizing (rehash every key)
9. Open addressing: linear probing *(quadratic probing and double hashing as P1 extensions)*
10. Tombstones (deleting under open addressing)

**Sandbox:** `put(key, value)`, `get(key)`, `remove(key)`, with a Key field (a name of up to 6 letters) beside the value field. The collision strategy is the tool (Chaining / Probing); the presets set the hash function (sum of char codes, polynomial ×31, or "bad hash" counting letters), the table size (2–12 buckets, so the column fits a phone) and how near the 0.75 resize threshold it starts.

| Operation | Average | Worst |
|---|---|---|
| Insert | O(1) | O(n) |
| Search | O(1) | O(n) |
| Delete | O(1) | O(n) |
| Resize | O(n), amortised O(1) per insert | |
| Space | O(n + m) for m buckets | |

**States:** active (target bucket), collision, new (inserted node), found, dimmed (tombstone), error (key not found)
**Presets:** Chaining: sum hash, better (polynomial) hash, bad hash (many collisions), near resize. Probing: sum hash, tombstone (delete then search past it), bad hash, near resize. There's no empty preset: Remove empties a table.
**Practice ideas:** "h(Kat) = 17, size = 6. Which bucket?" · "Load factor is 0.75 and the limit is 0.75. What happens on the next insert?" · "Under linear probing, where does Leo land if buckets 3 and 4 are full?"

---

## 6. Trees (P1–P2)

### T1 · Binary Tree & Traversals (P1)
Renderer: `tree` (tidy layout, see TECH-STACK §3e)
**Chapters:** Nodes, root, leaves, height · Pre-order · In-order · Post-order · Level-order (with a queue) · Recursive vs iterative traversal
**Sandbox:** build a tree by tapping, then run any traversal and watch the visit order fill a result array.
**Complexity:** every traversal O(n) time · O(h) stack (O(w) queue for level-order)

### T2 · Binary Search Tree (P1)
**Chapters:** The BST property · Search · Insert · Min / max · Delete: leaf, one child, two children (in-order successor) · Why unbalanced trees degrade
**Sandbox:** `insert`, `search`, `delete`, `min`, `max`. Preset: insert a sorted sequence to show a degenerate tree.
| Operation | Average | Worst |
|---|---|---|
| Search / insert / delete | O(log n) | O(n) |

### T3 · Heap & Priority Queue (P1)
Renderer: `tree` and `array` side by side, kept in sync
**Chapters:** Complete binary tree · Array representation (`2i+1`, `2i+2`) · Insert and sift up · Extract-min and sift down · Build a heap in O(n) · Priority queue uses · Min-heap vs max-heap
**Sandbox:** `insert`, `extract`, `peek`, `heapify(array)`. Toggle: min or max heap.
**Complexity:** peek O(1) · insert O(log n) · extract O(log n) · build O(n)

### T4 · AVL Tree (P1)
**Chapters:** Balance factor · Why we rebalance · LL and RR rotations · LR and RL rotations · Insert with rebalancing · Delete with rebalancing
**Complexity:** search / insert / delete O(log n)

### T5 · Trie (P2)
**Chapters:** Characters on edges · Insert a word · Search a word · Prefix search (autocomplete) · Delete
**Complexity:** insert / search O(L) for a key of length L · space O(total characters)

### T6 · Red-Black Tree (P2)
**Chapters:** Colour rules · Recolouring · Rotations · Insert cases · Delete overview · Comparison with AVL
**Complexity:** search / insert / delete O(log n)

### T7 · Segment Tree (P2)
**Chapters:** Range queries · Building the tree · Query · Point update · Lazy propagation preview
**Complexity:** build O(n) · query / update O(log n)

---

## 7. Graphs (P1–P2)

All graph topics use the `graph` renderer (nodes and edges, with optional weights and directions), plus an editor in Sandbox (tap to add a node, drag to add an edge, long-press to set a weight).

### G1 · Graph Basics (P1)
**Chapters:** Vertices and edges · Directed vs undirected · Weighted edges · Adjacency matrix vs adjacency list · Degree, paths, cycles
**Complexity (space):** matrix O(V²) · list O(V + E)

### G2 · Breadth-First Search (P1)
Renderer: `graph` + `queue`
**Chapters:** Explore level by level · The queue · Visited set · Shortest path in unweighted graphs · BFS tree
**Complexity:** O(V + E)
**States:** active (current node), visited, new (just discovered), found (target)

### G3 · Depth-First Search (P1)
Renderer: `graph` + `stack`
**Chapters:** Go deep, then backtrack · Recursive vs explicit stack · Visited set · Detecting cycles · Connected components
**Complexity:** O(V + E)

### G4 · Topological Sort (P1)
**Chapters:** Dependencies (course prerequisites) · In-degree · Kahn's algorithm · Detecting a cycle (no valid order)
**Complexity:** O(V + E)

### G5 · Dijkstra's Shortest Path (P1)
Renderer: `graph` + `table` (distance and previous-node columns) + priority queue strip
**Chapters:** Weighted shortest paths · Distance table · Relaxing an edge · The priority queue · Rebuilding the path · Why negative weights break it
**Complexity:** O((V + E) log V) with a binary heap

### G6 · Minimum Spanning Tree (P2)
**Chapters:** What a spanning tree is · Prim's algorithm · Kruskal's algorithm · Cycle check with union-find · Comparing the two · Use case: network cabling
**Complexity:** Prim O(E log V) · Kruskal O(E log E)

### G7 · Union-Find (P2)
Renderer: `forest` + parent `array`
**Chapters:** Disjoint sets · Find · Union · Path compression · Union by rank
**Complexity:** near O(1) amortised per operation (inverse Ackermann, α(n))

### G8 · Bellman-Ford (P2)
**Chapters:** Relax every edge V−1 times · Negative weights · Detecting a negative cycle · Comparison with Dijkstra
**Complexity:** O(V · E)

---

## 8. Algorithms

All sorting and searching topics use the `array` renderer with comparison/swap counters (F-902). They also support **Compare** and **Race** mode (F-901, F-904).

### Searching

#### A1 · Binary Search (P1)
**Chapters:** Requires sorted input · low / mid / high pointers · Halving the range · Not found · Variants: first / last occurrence
**Complexity:** O(log n) time · O(1) space (iterative)
**States:** active (mid), dimmed (discarded half), found
**Sandbox:** Search, First and Last for a typed or random value. Presets: sorted (8), 12 items, duplicates, unsorted (to see it miss), one item. Stats: size, items still in range, sorted or not.
**Built as:** the `sorted-array` structure (`engine/algorithms/searching/`): the array model with one slot per number, drawn by the `array` renderer with `mid` above and `low`/`high` below.

### Sorting

| ID | Algorithm | Best | Average | Worst | Space | Stable | Priority |
|---|---|---|---|---|---|---|---|
| A2 | Bubble Sort | O(n)* | O(n²) | O(n²) | O(1) | Yes | P1 |
| A3 | Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No | P1 |
| A4 | Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes | P1 |
| A5 | Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | P1 |
| A6 | Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No | P1 |
| A7 | Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No | P2 |
| A8 | Counting Sort | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | P2 |
| A8 | Radix Sort | O(d(n + k)) | O(d(n + k)) | O(d(n + k)) | O(n + k) | Yes | P2 |

\* With the early-exit check when a pass makes no swaps.

**Chapter outlines**
- **A2 Bubble:** Adjacent compare and swap · One pass bubbles the largest value to the end · Passes and the sorted tail · Early exit · Why it's O(n²)
- **A3 Selection:** Find the minimum · Swap it into place · Growing the sorted prefix · Why it isn't stable
- **A4 Insertion:** Like sorting playing cards · Shift larger values right · Insert the key · Nearly sorted input is fast · Used inside hybrid sorts
- **A5 Merge:** Divide in half · Recurse down to single elements · Merge two sorted halves · The recursion levels (log n) · Extra space · Stability
- **A6 Quick:** Choose a pivot · Partition (Lomuto, then Hoare as an extension) · Recurse on each side · Bad pivots and the worst case · Random pivot
- **A7 Heap:** Build a max-heap · Swap root with the end · Sift down · Repeat
- **A8 Counting/Radix:** Counting occurrences · Prefix sums · Stable placement · Radix digit by digit

**Sandbox (all sorts):** custom or random arrays (5–12 values). Presets: sorted, reverse-sorted, all equal, few unique values, nearly sorted.
*As built (A2–A4):* each sort is its own topic. The sandbox takes 2–12 typed numbers or 8 random ones; presets are Mixed, Reversed, Sorted, Nearly and Repeats (few unique). "All equal" is left to typing, since the preset switch holds five. Bubble sort's `j`, selection sort's `min` and `j` (with `i` below) are pointers; insertion sort lifts its key above the row while bigger items shift right under it.
*As built (A5, A6):* merge sort is drawn as split levels (one faint row per recursion level under the array). Quick sort uses Lomuto with a `pivot` state, `j` above and `i` below; its sandbox adds a **Random pivot** button. Hoare's partition is explained, not animated.
**States:** active/comparing, swapping, sorted, dimmed (inactive range), plus a pivot marker for quick sort
**Practice ideas:** "After pass 1 on [5,3,8,1,9,2], what's the last element?" · "Which element does Lomuto pick as the pivot?" · "Which sort is fastest on this nearly sorted input?"

### Patterns

#### A9 · Two Pointers (P1)
**Chapters:** Pointers from both ends · Pair sum in a sorted array · Removing duplicates in place · When the pattern applies
**Complexity:** O(n) time · O(1) space
*As built:* reverse and pair sum use `left` and `right` from above; remove duplicates uses `read` above and `write` below. Sandbox: Pair sum (a typed target), Reverse, Remove repeats; presets sorted, repeats, unsorted (to see a pair missed), two items.

#### A10 · Sliding Window (P1)
**Chapters:** Fixed-size window (max sum of k) · Variable window (longest substring without repeats) · Expanding and shrinking · Monotonic deque for window maximum (links to L7)
**Complexity:** O(n) time
*As built:* the window's ends are `left` and `right` below the row; the lesson's variable window runs on letters, the sandbox's on numbers. Sandbox: two tools, Fixed window (Max sum, Max of each, k − 1, k + 1) and No repeats (Longest).

#### A11 · Backtracking (P2)
Renderer: `grid` (board) + `tree` (decision tree)
**Chapters:** Choose, explore, un-choose · Subsets · Permutations · N-Queens · Pruning
**Complexity:** exponential in general (subsets O(2ⁿ), permutations O(n!))

#### A12 · Dynamic Programming (P2)
Renderer: `dp-table` (cells fill in order, with arrows showing which cells each one depends on)
**Chapters:** Overlapping subproblems · Memoisation (top-down) · Tabulation (bottom-up) · Climbing stairs · 0/1 Knapsack · Longest Common Subsequence · Edit distance
**Complexity:** knapsack O(n·W) · LCS / edit distance O(m·n)

#### A13 · Greedy Algorithms (P2)
**Chapters:** Locally best choice · Activity selection · Coin change (where greedy fails) · Proof idea: exchange argument
**Complexity:** activity selection O(n log n) (dominated by sorting)

---

## 9. Renderers needed

Each renderer is a reusable Skia component that draws step snapshots (see TECH-STACK §3). Build order follows topic priority.

| Renderer | Draws | First needed by | Priority |
|---|---|---|---|
| `array` | Indexed cells, pointer labels, ranges, swaps | L1, all sorts | **P0** |
| `linked-list` | Nodes, single/double arrows, head/tail labels | L2, L3 | **P0** |
| `stack` | U-container, vertical items, `top` pointer | L5 | **P0** |
| `queue` | Horizontal slots, front/rear pointers, circular view | L6 | **P0** |
| `hash-table` | Bucket column, chains, probe arrows, tombstones | H1 | **P0** |
| `growth-chart` | Big O curves plus the user's `n` marker | F1 | **P0** |
| `analogy` | Hand-built real-world example scenes (browser back button, phone book), one picture per caption | L5, H1 | **P0** |
| `code-panel` | Synced code with the current line (shared by all) | All | **P0** |
| `tree` | Tidy-layout binary/n-ary trees, rotations | T1–T7, F2 | P1 |
| `graph` | Nodes, weighted/directed edges, editor | G1–G8 | P1 |
| `table` | Distance/previous tables, generic key-value tables | G5, G8 | P1 |
| `call-stack` | Stack frames with arguments and return values | F2 | P1 |
| `forest` | Multiple small trees (union-find) | G7 | P2 |
| `dp-table` | 2D grid that fills with dependency arrows | A12 | P2 |
| `grid` | Board/maze cells (N-Queens) | A11 | P2 |
| `buckets` | Digit/count buckets | A8 | P2 |

---

## 10. Release waves

| Wave | Topics |
|---|---|
| **MVP (P0)** | F1 Big O · L1 Array · L2 Singly Linked List · L3 Doubly Linked List · L5 Stack · L6 Queue · H1 Hash Table |
| **v1.1** | A1 Binary Search · A2–A6 Sorting (enables Compare/Race) · A9 Two Pointers · A10 Sliding Window · F2 Recursion |
| **v1.2** | T1 Traversals · T2 BST · T3 Heap · T4 AVL · L4 Circular List · L7 Deque |
| **v1.3** | G1 Basics · G2 BFS · G3 DFS · G4 Topological Sort · G5 Dijkstra |
| **Later (P2)** | T5–T7 · G6–G8 · A7, A8, A11–A13 |

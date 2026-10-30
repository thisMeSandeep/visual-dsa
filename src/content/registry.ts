/**
 * Every topic the app knows about. Metas are small and loaded up front (Home lists them all).
 * Lessons, sandboxes, quizzes and reference sheets are registered here under their topic ids.
 */
import type { LessonRecipeInput } from '@/engine/lesson/recipe';

import type {
  LessonRecipe,
  Quiz,
  Reference,
  SandboxConfig,
  TopicCategory,
  TopicMeta,
} from './schema';
import { lesson as arrayLesson } from './topics/array/lesson';
import { meta as array } from './topics/array/meta';
import { reference as arrayReference } from './topics/array/reference';
import { quiz as arrayQuiz } from './topics/array/quiz';
import { sandbox as arraySandbox } from './topics/array/sandbox';
import { lesson as binarySearchLesson } from './topics/binary-search/lesson';
import { meta as binarySearch } from './topics/binary-search/meta';
import { reference as binarySearchReference } from './topics/binary-search/reference';
import { quiz as binarySearchQuiz } from './topics/binary-search/quiz';
import { sandbox as binarySearchSandbox } from './topics/binary-search/sandbox';
import { lesson as bigOLesson } from './topics/big-o/lesson';
import { meta as bigO } from './topics/big-o/meta';
import { reference as bigOReference } from './topics/big-o/reference';
import { quiz as bigOQuiz } from './topics/big-o/quiz';
import { sandbox as bigOSandbox } from './topics/big-o/sandbox';
import { lesson as doublyLinkedListLesson } from './topics/doubly-linked-list/lesson';
import { meta as doublyLinkedList } from './topics/doubly-linked-list/meta';
import { reference as doublyLinkedListReference } from './topics/doubly-linked-list/reference';
import { quiz as doublyLinkedListQuiz } from './topics/doubly-linked-list/quiz';
import { sandbox as doublyLinkedListSandbox } from './topics/doubly-linked-list/sandbox';
import { lesson as hashTableLesson } from './topics/hash-table/lesson';
import { meta as hashTable } from './topics/hash-table/meta';
import { reference as hashTableReference } from './topics/hash-table/reference';
import { quiz as hashTableQuiz } from './topics/hash-table/quiz';
import { sandbox as hashTableSandbox } from './topics/hash-table/sandbox';
import { lesson as queueLesson } from './topics/queue/lesson';
import { meta as queue } from './topics/queue/meta';
import { reference as queueReference } from './topics/queue/reference';
import { quiz as queueQuiz } from './topics/queue/quiz';
import { sandbox as queueSandbox } from './topics/queue/sandbox';
import { lesson as singlyLinkedListLesson } from './topics/singly-linked-list/lesson';
import { meta as singlyLinkedList } from './topics/singly-linked-list/meta';
import { reference as singlyLinkedListReference } from './topics/singly-linked-list/reference';
import { quiz as singlyLinkedListQuiz } from './topics/singly-linked-list/quiz';
import { sandbox as singlyLinkedListSandbox } from './topics/singly-linked-list/sandbox';
import { lesson as stackLesson } from './topics/stack/lesson';
import { meta as stack } from './topics/stack/meta';
import { reference as stackReference } from './topics/stack/reference';
import { quiz as stackQuiz } from './topics/stack/quiz';
import { sandbox as stackSandbox } from './topics/stack/sandbox';

/** Topic ids in the order Home lists them. */
export const TOPIC_IDS = [
  'big-o',
  'array',
  'singly-linked-list',
  'doubly-linked-list',
  'stack',
  'queue',
  'hash-table',
  'binary-search',
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

/** Each meta under the id it is registered as. Validation checks the two match. */
export const TOPIC_METAS: Record<TopicId, TopicMeta> = {
  'big-o': bigO,
  array,
  'singly-linked-list': singlyLinkedList,
  'doubly-linked-list': doublyLinkedList,
  stack,
  queue,
  'hash-table': hashTable,
  'binary-search': binarySearch,
};

/**
 * Each written lesson under its topic id. Typed as the engine's recipe shape too, so a schema
 * change that the compiler can't read fails the typecheck.
 */
export const TOPIC_LESSONS: Partial<Record<TopicId, LessonRecipe & LessonRecipeInput>> = {
  stack: stackLesson,
  queue: queueLesson,
  array: arrayLesson,
  'singly-linked-list': singlyLinkedListLesson,
  'doubly-linked-list': doublyLinkedListLesson,
  'hash-table': hashTableLesson,
  'big-o': bigOLesson,
  'binary-search': binarySearchLesson,
};

/** Each topic's Play mode (one or more tools), under its topic id. */
export const TOPIC_SANDBOXES: Partial<Record<TopicId, readonly SandboxConfig[]>> = {
  stack: stackSandbox,
  queue: queueSandbox,
  array: arraySandbox,
  'singly-linked-list': singlyLinkedListSandbox,
  'doubly-linked-list': doublyLinkedListSandbox,
  'hash-table': hashTableSandbox,
  'big-o': bigOSandbox,
  'binary-search': binarySearchSandbox,
};

/** Each topic's quiz, under its topic id. */
export const TOPIC_QUIZZES: Partial<Record<TopicId, Quiz>> = {
  stack: stackQuiz,
  queue: queueQuiz,
  array: arrayQuiz,
  'singly-linked-list': singlyLinkedListQuiz,
  'doubly-linked-list': doublyLinkedListQuiz,
  'hash-table': hashTableQuiz,
  'big-o': bigOQuiz,
  'binary-search': binarySearchQuiz,
};

/** Each topic's reference sheet (F-801 – F-803), under its topic id. */
export const TOPIC_REFERENCES: Partial<Record<TopicId, Reference>> = {
  stack: stackReference,
  queue: queueReference,
  array: arrayReference,
  'singly-linked-list': singlyLinkedListReference,
  'doubly-linked-list': doublyLinkedListReference,
  'hash-table': hashTableReference,
  'big-o': bigOReference,
  'binary-search': binarySearchReference,
};

/** All topics in Home order. */
export const TOPICS: readonly TopicMeta[] = TOPIC_IDS.map((id) => TOPIC_METAS[id]);

export function isTopicId(value: string): value is TopicId {
  return (TOPIC_IDS as readonly string[]).includes(value);
}

/** The meta for a route param, or undefined for an unknown topic. */
export function getTopicMeta(id: string): TopicMeta | undefined {
  return isTopicId(id) ? TOPIC_METAS[id] : undefined;
}

/** Topics grouped by category, keeping Home order inside each group. Empty groups are left out. */
export function topicsByCategory(): { category: TopicCategory; topics: TopicMeta[] }[] {
  const groups = new Map<TopicCategory, TopicMeta[]>();
  for (const topic of TOPICS) {
    groups.set(topic.category, [...(groups.get(topic.category) ?? []), topic]);
  }
  return [...groups].map(([category, topics]) => ({ category, topics }));
}

/** A topic's chapter titles by id, as the lesson compiler takes them. */
export function chapterTitles(meta: TopicMeta): Record<string, string> {
  return Object.fromEntries(meta.chapters.map((chapter) => [chapter.id, chapter.title]));
}

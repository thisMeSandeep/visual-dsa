/**
 * Every topic the app knows about. Metas are small and loaded up front (Home lists them all);
 * lessons, quizzes and reference sheets are added here as lazy loaders when they exist.
 */
import type { TopicCategory, TopicMeta } from './schema';
import { meta as array } from './topics/array/meta';
import { meta as bigO } from './topics/big-o/meta';
import { meta as doublyLinkedList } from './topics/doubly-linked-list/meta';
import { meta as hashTable } from './topics/hash-table/meta';
import { meta as queue } from './topics/queue/meta';
import { meta as singlyLinkedList } from './topics/singly-linked-list/meta';
import { meta as stack } from './topics/stack/meta';

/** Topic ids in the order Home lists them. */
export const TOPIC_IDS = [
  'big-o',
  'array',
  'singly-linked-list',
  'doubly-linked-list',
  'stack',
  'queue',
  'hash-table',
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

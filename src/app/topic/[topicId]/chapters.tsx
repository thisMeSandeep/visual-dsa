import { useLocalSearchParams } from 'expo-router';

import { Chapters } from '@/screens/chapters';

export default function ChaptersRoute() {
  const { topicId, current } = useLocalSearchParams<{ topicId: string; current?: string }>();
  return <Chapters topicId={topicId} {...(current ? { current } : {})} />;
}

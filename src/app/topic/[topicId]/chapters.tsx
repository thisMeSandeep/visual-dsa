import { useLocalSearchParams } from 'expo-router';

import { Chapters } from '@/screens/chapters';

export default function ChaptersRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <Chapters topicId={topicId} />;
}

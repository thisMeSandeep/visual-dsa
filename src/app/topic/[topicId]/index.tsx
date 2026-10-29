import { useLocalSearchParams } from 'expo-router';

import { Topic } from '@/screens/topic';

export default function TopicRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <Topic topicId={topicId} />;
}

import { useLocalSearchParams } from 'expo-router';

import { TopicPractice } from '@/screens/practice';

export default function TopicPracticeRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <TopicPractice topicId={topicId} />;
}

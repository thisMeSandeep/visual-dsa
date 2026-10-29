import { useLocalSearchParams } from 'expo-router';

import { Lesson } from '@/screens/lesson';

export default function LessonRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <Lesson topicId={topicId} />;
}

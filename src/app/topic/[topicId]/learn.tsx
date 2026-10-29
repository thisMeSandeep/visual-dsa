import { useLocalSearchParams } from 'expo-router';

import { Lesson } from '@/screens/lesson';

export default function LessonRoute() {
  const { topicId, chapter } = useLocalSearchParams<{ topicId: string; chapter?: string }>();
  return <Lesson topicId={topicId} {...(chapter ? { chapter } : {})} />;
}

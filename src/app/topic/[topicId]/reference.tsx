import { useLocalSearchParams } from 'expo-router';

import { Reference } from '@/screens/reference';

export default function ReferenceRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <Reference topicId={topicId} />;
}

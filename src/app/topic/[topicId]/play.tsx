import { useLocalSearchParams } from 'expo-router';

import { Sandbox } from '@/screens/sandbox';

export default function SandboxRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <Sandbox topicId={topicId} />;
}

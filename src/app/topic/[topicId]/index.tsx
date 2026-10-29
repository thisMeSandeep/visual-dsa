import { Redirect, useLocalSearchParams } from 'expo-router';

/** There's no separate topic page: a topic opens its lesson, which resumes where it left off. */
export default function TopicRoute() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  return <Redirect href={{ pathname: '/topic/[topicId]/learn', params: { topicId } }} />;
}

import { router } from 'expo-router';

import { Button } from '@/components/button';

import { ScreenPlaceholder } from '../placeholder';

/** Lesson player (F-201). */
export function Lesson({ topicId }: { topicId: string }) {
  return (
    <ScreenPlaceholder
      back
      overline={topicId}
      title="Lesson"
      note="The lesson player arrives in Step 4.4."
    >
      <Button
        label="Chapters"
        variant="tinted"
        icon="chapters"
        onPress={() => router.push({ pathname: '/topic/[topicId]/chapters', params: { topicId } })}
      />
    </ScreenPlaceholder>
  );
}

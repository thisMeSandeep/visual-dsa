import { router } from 'expo-router';

import { Button } from '@/components/button';

import { ScreenPlaceholder } from '../placeholder';

/** Topic detail: summary, complexity, the three modes and the chapter list (F-102). */
export function Topic({ topicId }: { topicId: string }) {
  return (
    <ScreenPlaceholder
      back
      overline={topicId}
      title="Topic"
      note="The real topic screen arrives in Step 2.3. These links open every route of a topic."
    >
      <Button
        label="Continue lesson"
        icon="play"
        iconWeight="fill"
        onPress={() => router.push({ pathname: '/topic/[topicId]/learn', params: { topicId } })}
      />
      <Button
        label="Sandbox"
        variant="sandbox"
        icon="random"
        onPress={() => router.push({ pathname: '/topic/[topicId]/play', params: { topicId } })}
      />
      <Button
        label="Practice"
        variant="practice"
        icon="practice"
        onPress={() => router.push({ pathname: '/topic/[topicId]/practice', params: { topicId } })}
      />
      <Button
        label="Chapters"
        variant="tinted"
        icon="chapters"
        onPress={() => router.push({ pathname: '/topic/[topicId]/chapters', params: { topicId } })}
      />
      <Button
        label="Reference"
        variant="tinted"
        icon="reference"
        onPress={() => router.push({ pathname: '/topic/[topicId]/reference', params: { topicId } })}
      />
    </ScreenPlaceholder>
  );
}

import { useLocalSearchParams } from 'expo-router';

import { Lesson } from '@/screens/lesson';

/** `/topic/<id>/learn` resumes; `?chapter=<id>` opens a chapter; `?step=N` opens step N. */
export default function LessonRoute() {
  const { topicId, chapter, step } = useLocalSearchParams<{
    topicId: string;
    chapter?: string;
    step?: string;
  }>();
  const stepNumber = step === undefined ? undefined : Number(step);
  return (
    <Lesson
      topicId={topicId}
      {...(chapter ? { chapter } : {})}
      {...(stepNumber === undefined || Number.isNaN(stepNumber) ? {} : { step: stepNumber })}
    />
  );
}

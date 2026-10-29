import { ScreenPlaceholder } from '../placeholder';

/** Chapter index, presented as a form sheet (F-203). */
export function Chapters({ topicId }: { topicId: string }) {
  return (
    <ScreenPlaceholder
      sheet
      overline={topicId}
      title="Chapters"
      note="The chapter list arrives with the lesson player in Step 4.4. Drag the sheet up or down."
    />
  );
}

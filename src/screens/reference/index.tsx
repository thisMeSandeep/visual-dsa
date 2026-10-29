import { ScreenPlaceholder } from '../placeholder';

/** Reference sheet, presented as a form sheet (F-801). */
export function Reference({ topicId }: { topicId: string }) {
  return (
    <ScreenPlaceholder
      sheet
      overline={topicId}
      title="Reference"
      note="Cheat sheets with complexity tables arrive in Step 9.6."
    />
  );
}

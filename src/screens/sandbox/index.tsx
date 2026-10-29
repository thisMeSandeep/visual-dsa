import { ScreenPlaceholder } from '../placeholder';

/** Sandbox / Play mode (F-601). */
export function Sandbox({ topicId }: { topicId: string }) {
  return (
    <ScreenPlaceholder
      back
      overline={topicId}
      title="Sandbox"
      note="The sandbox arrives in Step 7.1."
    />
  );
}

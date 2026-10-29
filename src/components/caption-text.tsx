import { captionSegments, captionText } from '@/content/captions';
import type { Caption } from '@/engine/core/types';

import { AppText, Strong } from './app-text';

/** A step's caption at caption size, with its key terms in bold (VISUAL-SPEC §3). */
export function CaptionText({ caption }: { caption: Caption }) {
  return (
    <AppText variant="caption" accessibilityLiveRegion="polite">
      {captionSegments(captionText(caption)).map((segment, index) =>
        segment.bold ? <Strong key={index}>{segment.text}</Strong> : segment.text,
      )}
    </AppText>
  );
}

/**
 * The scroll offset that puts a line in the middle of the code panel, kept within the code so
 * the panel never scrolls past its first or last line.
 */
export function centredOffset({
  lineTop,
  lineHeight,
  viewportHeight,
  contentHeight,
}: {
  lineTop: number;
  lineHeight: number;
  viewportHeight: number;
  contentHeight: number;
}): number {
  const centred = lineTop - (viewportHeight - lineHeight) / 2;
  return Math.max(0, Math.min(centred, contentHeight - viewportHeight));
}

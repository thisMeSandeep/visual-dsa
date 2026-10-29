type Size = { width: number; height: number };

/**
 * Scale (never above 1) and offset that fit `content` inside `viewport`, centred. A tall stack
 * shrinks to fit the lesson's canvas area; a small one stays at full size in the middle.
 */
export function fitContent(viewport: Size, content: Size) {
  const scale =
    content.width > 0 && content.height > 0
      ? Math.min(1, viewport.width / content.width, viewport.height / content.height)
      : 1;
  return {
    scale,
    offsetX: (viewport.width - content.width * scale) / 2,
    offsetY: (viewport.height - content.height * scale) / 2,
  };
}

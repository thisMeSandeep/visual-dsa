/** SVG path helpers shared by renderers' layouts. Pure; points are canvas points. */

/** A rectangle with corners of radius `r`, e.g. the frame around a queue's or an array's slots. */
export function roundedRect(
  left: number,
  top: number,
  right: number,
  bottom: number,
  r: number,
): string {
  return (
    `M ${left + r} ${top} H ${right - r} A ${r} ${r} 0 0 1 ${right} ${top + r} ` +
    `V ${bottom - r} A ${r} ${r} 0 0 1 ${right - r} ${bottom} H ${left + r} ` +
    `A ${r} ${r} 0 0 1 ${left} ${bottom - r} V ${top + r} A ${r} ${r} 0 0 1 ${left + r} ${top} Z`
  );
}

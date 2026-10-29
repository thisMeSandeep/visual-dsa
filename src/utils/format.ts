/** "1 chapter", "7 chapters" */
export function chapterCount(count: number): string {
  return count === 1 ? '1 chapter' : `${count} chapters`;
}

export const segmentAndWrap = (text: string, maxWidth: number, measureFn: (t: string) => number): string[] => {
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });

  for (const para of paragraphs) {
    if (para.length === 0) {
      lines.push("");
      continue;
    }
    const segments = segmenter.segment(para);
    let currentLine = "";
    for (const { segment } of segments) {
      const testLine = currentLine + segment;
      if (measureFn(testLine) > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = segment;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
};
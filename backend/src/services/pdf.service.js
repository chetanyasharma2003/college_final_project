const ascii = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[^\x20-\x7E]/g, '?')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const MAX_CHARS = 85; // keeps Helvetica 11pt text inside the A4 margins

// Wrap one line at spaces (hard-split very long words) so nothing is cut off at the page edge.
export function wrapLine(text, width = MAX_CHARS) {
  const out = [];
  let rest = String(text ?? '');
  if (rest.length <= width) return [rest];
  let indent = '';
  while (rest.length > width - indent.length) {
    const room = width - indent.length;
    let cut = rest.lastIndexOf(' ', room);
    if (cut <= 0) cut = room;
    out.push(indent + rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
    indent = '  ';
  }
  if (rest) out.push(indent + rest);
  return out;
}

export function createTextPDF(lines, { title = 'Government Scheme Report' } = {}) {
  const safeTitle = ascii(title).slice(0, 100);
  const contentLines = [safeTitle, '', ...lines.flatMap((line) => wrapLine(String(line ?? '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '?')).map(ascii))];
  const chunks = [];
  for (let index = 0; index < contentLines.length; index += 45) chunks.push(contentLines.slice(index, index + 45));
  if (!chunks.length) chunks.push([safeTitle]);

  const objects = [null];
  const pageIds = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  chunks.forEach((pageLines, pageIndex) => {
    const contentId = 4 + pageIndex * 2;
    const pageId = contentId + 1;
    pageIds.push(`${pageId} 0 R`);
    const text = pageLines.map((line, lineIndex) =>
      `${lineIndex === 0 ? '50 790 Td' : '0 -16 Td'} (${line}) Tj`
    ).join('\n');
    const stream = `BT\n/F1 11 Tf\n${text}\nET`;
    objects[contentId] = `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
  });
  objects[2] = `<< /Type /Pages /Kids [${pageIds.join(' ')}] /Count ${pageIds.length} >>`;

  let document = '%PDF-1.4\n';
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(document, 'ascii');
    document += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(document, 'ascii');
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) document += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  document += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(document, 'ascii');
}

export default { createTextPDF, wrapLine };

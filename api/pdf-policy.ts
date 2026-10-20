const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const forbidden = new Set([
  '/JavaScript', '/JS', '/Launch', '/AA', '/EmbeddedFiles',
  '/EmbeddedFile', '/Filespec', '/EF', '/XFA', '/AcroForm', '/RichMedia',
  '/RichMediaContent', '/Movie', '/Sound', '/SubmitForm', '/ImportData',
  '/GoToR', '/GoToE', '/Rendition', '/Collection', '/SetOCGState',
  '/Hide', '/ResetForm', '/Trans', '/Thread',
]);

/** Inspect qpdf's parsed objects, including compressed objects and escaped names.
 * This is a restrictive document policy, not a general malware-free guarantee. */
export function inspectPdfObjects(document: unknown) {
  if (!object(document) || !Array.isArray(document.qpdf) ||
      !object(document.encrypt) || document.encrypt.encrypted !== false ||
      !Array.isArray(document.pages) || !document.pages.length || document.pages.length > 500)
    throw new Error('Unsupported PDF structure, encryption or page count');
  const pending: unknown[] = [document.qpdf];
  let visited = 0;
  while (pending.length) {
    if (++visited > 100_000) throw new Error('PDF object limit exceeded');
    const value = pending.pop();
    if (Array.isArray(value)) { pending.push(...value); continue; }
    if (!object(value)) continue;
    for (const [key, child] of Object.entries(value)) {
      if (forbidden.has(key) || (typeof child === 'string' && forbidden.has(child)))
        throw new Error('Active PDF content is not allowed');
      // A static opening page/zoom destination is harmless. Action dictionaries
      // (including indirect ones) are rejected rather than executed on opening.
      if (key === '/OpenAction' && !(Array.isArray(child) &&
          typeof child[0] === 'string' && /^\d+ \d+ R$/.test(child[0]) &&
          ['/XYZ', '/Fit', '/FitH', '/FitV', '/FitR', '/FitB', '/FitBH', '/FitBV'].includes(String(child[1])) &&
          child.slice(2).every(v => v === null || typeof v === 'number')))
        throw new Error('Automatic PDF actions are not allowed');
      if (key === '/URI' && (typeof child !== 'string' || !/^u:https?:\/\//i.test(child)))
        throw new Error('Unsupported PDF link');
      if (key === 'stream' && object(child) && object(child.dict) && '/F' in child.dict)
        throw new Error('External PDF streams are not allowed');
      pending.push(child);
    }
  }
}

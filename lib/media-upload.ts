/** Read an upload without submitting partial or unreadable file contents. */
export function readMediaUpload(file: File): Promise<{ name: string; mime: string; base64: string }> {
  if (!file.size || file.size > 5 * 1024 * 1024)
    return Promise.reject(new Error('Choose a non-empty file up to 5 MB.'));
  if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.type))
    return Promise.reject(new Error('Choose a PNG, JPEG, WebP or PDF file.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File could not be read. Please choose it again.'));
    reader.onabort = () => reject(new Error('File reading was cancelled. Please choose it again.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string' || !result.startsWith('data:') || !result.includes(';base64,')) {
        reject(new Error('File could not be read. Please choose it again.'));
        return;
      }
      const base64 = result.slice(result.indexOf(';base64,') + 8);
      if (!base64) {
        reject(new Error('The selected file is empty.'));
        return;
      }
      resolve({ name: file.name, mime: file.type, base64 });
    };
    reader.readAsDataURL(file);
  });
}

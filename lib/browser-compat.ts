/** Older Safari exposes MediaQueryList.addListener instead of EventTarget methods. */
export function subscribeMediaQuery(media: MediaQueryList, listener: () => void) {
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }
  if (typeof media.addListener === 'function') {
    media.addListener(listener);
    return () => media.removeListener(listener);
  }
  return () => {};
}

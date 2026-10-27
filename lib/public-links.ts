/** Preserve dedicated pages; only legacy catalog/tool section links use the homepage. */
export function publicHref(href?: string | null) {
  if (!href) return '/';
  if (href.startsWith('/catalog')) {
    const url = new URL(href, 'https://poladcharkhesh.local');
    return url.pathname.replace(/\/+$/, '') === '/catalog' ? '/' + url.search + '#catalog' : href;
  }
  if (href.startsWith('/engineering')) {
    const url = new URL(href, 'https://poladcharkhesh.local');
    return url.pathname.replace(/\/+$/, '') === '/engineering' ? '/' + url.search + '#engineering' : href;
  }
  return href;
}

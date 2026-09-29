/** Keep saved CMS links and old bookmarks within the one-page public experience. */
export function publicHref(href?: string | null) {
  if (!href) return '/';
  if (href.startsWith('/catalog')) {
    const url = new URL(href, 'https://poladcharkhesh.local');
    return '/' + url.search + '#catalog';
  }
  if (href.startsWith('/engineering')) {
    const url = new URL(href, 'https://poladcharkhesh.local');
    return '/' + url.search + '#engineering';
  }
  if (href.startsWith('/product/')) {
    const slug = href.split('/')[2]?.split('?')[0];
    return '/?item=' + encodeURIComponent(slug || '') + '#catalog';
  }
  return href;
}

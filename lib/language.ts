export function clientLanguage(hostname: string, search: string, saved: string | null, initial?: {
  fa?: boolean; seo?: { domainEn?: string; domainFa?: string };
}) {
  const query = new URLSearchParams(search).get('lang');
  if (query === 'fa' || query === 'en') return query === 'fa';
  const domains = [initial?.seo?.domainEn, initial?.seo?.domainFa].filter((domain): domain is string => Boolean(domain));
  const live = domains.some((domain) => {
    try { return new URL(domain).hostname === hostname; } catch { return false; }
  });
  // Canonical domains own their default language. Local/staging navigation keeps
  // the visitor's language choice even when an anchor link drops ?lang=.
  if (!live && (saved === 'fa' || saved === 'en')) return saved === 'fa';
  return initial?.fa ?? hostname.endsWith('.ir');
}

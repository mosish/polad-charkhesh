export function metadataFor(
  path: string,
  fa: boolean,
  seo: any,
  company: any,
  p?: any,
) {
  const suffix = fa ? 'Fa' : 'En';
  const origin = seo['domain' + suffix];
  const canonical = new URL(path, origin).href;
  return {
    title: p
      ? p['metaTitle' + suffix] || p['name' + suffix]
      : seo['title' + suffix],
    description: p
      ? p['metaDescription' + suffix] || p['description' + suffix]
      : seo['description' + suffix],
    canonical,
    alternates: {
      en: new URL(path, seo.domainEn).href,
      fa: new URL(path, seo.domainFa).href,
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company['name' + suffix],
      telephone: company.primaryPhone,
      email: company.email,
      address: company['address' + suffix],
    },
  };
}
export function updateMetadata(data: ReturnType<typeof metadataFor>) {
  document.title = data.title;
  const setMeta = (name: string, value: string, property = false) => {
    let el = document.head.querySelector(
      `meta[${property ? 'property' : 'name'}="${name}"]`,
    );
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(property ? 'property' : 'name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };
  setMeta('description', data.description);
  setMeta('og:title', data.title, true);
  setMeta('og:description', data.description, true);
  setMeta('og:url', data.canonical, true);
  setMeta('twitter:title', data.title);
  setMeta('twitter:description', data.description);
  setMeta('twitter:card', 'summary');
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', data.canonical);
  for (const [lang, url] of Object.entries(data.alternates)) {
    let el = document.head.querySelector(`link[hreflang="${lang}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'alternate');
      el.setAttribute('hreflang', lang);
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }
  let json = document.getElementById('organization-data');
  if (!json) {
    json = document.createElement('script');
    json.id = 'organization-data';
    json.setAttribute('type', 'application/ld+json');
    document.head.appendChild(json);
  }
  json.textContent = JSON.stringify(data.organization);
}

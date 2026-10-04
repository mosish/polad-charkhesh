import { metadataHead, type PageMetadata } from '../domain/seo';
export { metadataFor } from '../domain/seo';
/** Share one head renderer with the server; never accumulate duplicate schema. */
export function updateMetadata(data: PageMetadata) {
  document.head
    .querySelectorAll(
      'title,meta[name="description"],meta[name="robots"],meta[name="google-site-verification"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],link[hreflang],script[type="application/ld+json"]',
    )
    .forEach((el) => el.remove());
  const template = document.createElement('template');
  template.innerHTML = metadataHead(data);
  document.head.append(template.content);
}

import { sectionIds, siteExtras } from '../domain/site-content';
export const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const short = (v: unknown, max = 5000): v is string => typeof v === 'string' && v.length <= max;
export const contentUrl = (v: unknown): v is string =>
  short(v, 2000) &&
  (v === '' || /^\/(?!\/)[^\s\\]*$/.test(v) || /^https:\/\/[^\s\\]+$/.test(v));
export function validateContent(v: unknown): string[] {
  const fail = (message: string) => [message];
  if (!object(v)) return fail('Invalid website content.');
  const legacy = [
    'hero',
    'about',
    'why',
    'industries',
    'engineering',
    'contact',
    'footer',
  ];
  const allowed = [...legacy, ...Object.keys(siteExtras)];
  if (Object.keys(v).some((k) => !allowed.includes(k)))
    return fail('Unknown website section.');
  for (const key of legacy)
    if (!object(v[key]) || Object.values(v[key]).some((x) => !short(x)))
      return fail('Section text must contain short bilingual strings.');
  const brand = v.brand;
  if (
    !object(brand) ||
    !contentUrl(brand.logoUrl) ||
    !short(brand.logoAltEn) ||
    !short(brand.logoAltFa) ||
    ['navy', 'accent', 'ink'].some((k) => typeof brand[k] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(brand[k]))
  )
    return fail('Invalid logo or brand colors.');
  if (
    !object(v.media) ||
    Object.entries(v.media).some(([k, x]) =>
      k.endsWith('Url') ? !contentUrl(x) : !short(x),
    )
  )
    return fail('Use local or HTTPS image URLs.');
  if (v.media.heroPresentation !== undefined && v.media.heroPresentation !== 'animation' && v.media.heroPresentation !== 'photo')
    return fail('Choose animation or photo for the homepage visual.');
  if (!object(v.links) || Object.values(v.links).some((x) => !contentUrl(x)))
    return fail('Invalid section links.');
  if (
    !object(v.navigation) ||
    !Array.isArray(v.navigation.items) ||
    v.navigation.items.length > 12 ||
    v.navigation.items.some(
      (i: unknown) =>
        !object(i) ||
        !short(i.id, 100) ||
        !short(i.labelEn, 100) ||
        !short(i.labelFa, 100) ||
        !contentUrl(i.href),
    )
  )
    return fail('Navigation supports up to 12 named links.');
  const layout = v.layout;
  if (
    !object(layout) ||
    !Array.isArray(layout.custom) ||
    layout.custom.length > 20
  )
    return fail('Invalid page layout.');
  const card = (i: unknown): i is Record<string, unknown> & { id: string } =>
    object(i) &&
    short(i.id, 100) &&
    /^[a-z0-9-]+$/.test(i.id) &&
    ['titleEn', 'titleFa', 'descriptionEn', 'descriptionFa'].every((k) =>
      short(i[k]),
    ) &&
    contentUrl(i.imageUrl) &&
    contentUrl(i.href);
  if (
    layout.custom.some(
      (c: unknown) =>
        !card(c) ||
        !short(c.buttonEn, 100) ||
        !short(c.buttonFa, 100) ||
        typeof c.enabled !== 'boolean',
    )
  )
    return fail('Invalid custom section.');
  const ids = [...sectionIds, ...layout.custom.map((c: unknown) => object(c) ? c.id : undefined)];
  if (
    new Set(ids).size !== ids.length ||
    !Array.isArray(layout.order) ||
    layout.order.length !== ids.length ||
    new Set(layout.order).size !== ids.length ||
    layout.order.some((i: unknown) => !ids.includes(i))
  )
    return fail('Page order must contain every section exactly once.');
  if (
    !Array.isArray(layout.hidden) ||
    layout.hidden.some((id: unknown) => !ids.includes(id))
  )
    return fail('Invalid hidden section.');
  const cards = v.cards;
  if (
    !object(cards) ||
    Object.keys(cards).some(
      (k) => !['capabilities', 'industries', 'reasons'].includes(k),
    ) ||
    ['capabilities', 'industries', 'reasons'].some(
      (k) =>
        !Array.isArray(cards[k]) ||
        cards[k].length > 30 ||
        cards[k].some((c: unknown) => !card(c)),
    )
  )
    return fail('Invalid section cards.');
  if (
    !object(v.copy) ||
    Object.keys(v.copy).length > 1000 ||
    Object.entries(v.copy).some(
      ([k, e]) =>
        !/^txt_[a-f0-9]+$/.test(k) ||
        !object(e) ||
        !['original', 'en', 'fa', 'group'].every((p) => short(e[p])),
    )
  )
    return fail('Invalid bilingual website text.');
  return [];
}

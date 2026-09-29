import initialCopy from './site-copy.json';

export function textKey(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return 'txt_' + (h >>> 0).toString(16);
}
export const sectionIds = [
  'hero',
  'capabilities',
  'about',
  'featured',
  'engineering',
  'industries',
  'why',
  'support',
  'contact',
];
export const siteExtras: any = {
  brand: {
    logoUrl: '/brand/logo.png',
    logoAltEn: 'Polad Charkhesh company logo',
    logoAltFa: 'نشان شرکت پولاد چرخش',
    navy: '#152443',
    accent: '#2454bf',
    ink: '#17243b',
  },
  layout: { order: sectionIds, hidden: [], custom: [] },
  media: {
    heroPresentation: 'animation',
    heroUrl: '/reference-images/ball-bearing.jpg',
    heroAltEn: 'Open ball bearing — family reference photograph',
    heroAltFa: 'تصویر مرجع بلبرینگ باز',
    ballUrl: '/reference-images/ball-bearing.jpg',
    taperedUrl: '/reference-images/tapered-roller-bearing.jpg',
  },
  navigation: {
    items: [
      {
        id: 'catalog',
        labelEn: 'Product catalog',
        labelFa: 'کاتالوگ محصولات',
        href: '/#catalog',
      },
      {
        id: 'engineering',
        labelEn: 'Engineering tools',
        labelFa: 'ابزارهای مهندسی',
        href: '/#engineering',
      },
      {
        id: 'industries',
        labelEn: 'Industries',
        labelFa: 'صنایع',
        href: '/#industries',
      },
      {
        id: 'about',
        labelEn: 'Company',
        labelFa: 'درباره ما',
        href: '/#about',
      },
    ],
  },
  links: {
    heroPrimary: '/#catalog',
    heroSecondary: '/#contact',
    heroVisual: '/#engineering',
    capabilities: '/#engineering',
    featured: '/#catalog',
    engineering: '/#engineering',
    header: '/#contact',
  },
  cards: {
    capabilities: [
      {
        id: 'application',
        titleEn: 'Application-led',
        titleFa: 'انتخاب بر اساس کاربرد',
        descriptionEn: 'Engineering consultation',
        descriptionFa: 'مشاوره مهندسی',
        imageUrl: '',
        href: '',
      },
      {
        id: 'sourcing',
        titleEn: 'Confident sourcing',
        titleFa: 'تأمین آگاهانه',
        descriptionEn: 'Technical identification',
        descriptionFa: 'شناسایی فنی',
        imageUrl: '',
        href: '',
      },
      {
        id: 'details',
        titleEn: 'Details that matter',
        titleFa: 'جزئیات مهم',
        descriptionEn: 'Dimensional & load data',
        descriptionFa: 'ابعاد و ظرفیت بار',
        imageUrl: '',
        href: '',
      },
    ],
    industries: [
      ['Steel & metals', 'فولاد و فلزات', 'steel'],
      ['Mining & cement', 'معدن و سیمان', 'mining'],
      ['Oil & petrochemical', 'نفت و پتروشیمی', 'oil'],
      ['Power generation', 'تولید برق', 'power'],
      ['Pumps & fluid systems', 'پمپ و سیالات', 'pumps'],
      ['Gearboxes & machinery', 'گیربکس و ماشین‌آلات', 'gearboxes'],
    ].map(([en, fa, q]) => ({
      id: q,
      titleEn: en,
      titleFa: fa,
      descriptionEn: '',
      descriptionFa: '',
      imageUrl: '',
      href: '/catalog?q=' + q,
    })),
    reasons: [
      [
        'Application understanding',
        'شناخت کاربرد',
        'We start with loads, geometry and operating conditions.',
        'بررسی را از بار، هندسه و شرایط کار آغاز می‌کنیم.',
      ],
      [
        'Technical identification',
        'شناسایی فنی',
        'Codes, suffixes and dimensions checked together.',
        'کد، پسوند و ابعاد در کنار هم بررسی می‌شوند.',
      ],
      [
        'Documented selection',
        'انتخاب مستند',
        'Manufacturer references support informed conversations.',
        'منابع سازنده مبنای گفت‌وگوی فنی هستند.',
      ],
    ].map(([en, fa, d, df], i) => ({
      id: 'reason-' + i,
      titleEn: en,
      titleFa: fa,
      descriptionEn: d,
      descriptionFa: df,
      imageUrl: '',
      href: '',
    })),
  },
  copy: initialCopy,
};
export function upgradeContent(value: any) {
  const v = structuredClone(value || {});
  for (const [key, extra] of Object.entries(siteExtras))
    if (v[key] === undefined) v[key] = structuredClone(extra);
  if (v.media && typeof v.media === 'object' && !Array.isArray(v.media) && v.media.heroPresentation === undefined)
    v.media.heroPresentation = 'animation';
  v.copy = { ...initialCopy, ...v.copy };
  return v;
}

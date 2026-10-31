import type { BearingProduct } from './product';

export interface CatalogHubCopy { title: string; description: string }
export interface CatalogHub {
  slug: string;
  en: CatalogHubCopy;
  fa: CatalogHubCopy;
  references: Array<{ title: string; url: string }>;
}

export const catalogHubs: CatalogHub[] = [
  {
    "slug": "ball-bearings",
    "en": {
      "title": "Ball bearings: types, dimensions and selection guide",
      "description": "What is a ball bearing? Explore bearing types, read dimensions and complete designations, compare catalog components and prepare a technical enquiry with Polad Charkhesh."
    },
    "fa": {
      "title": "بلبرینگ چیست؟ انواع و راهنمای انتخاب صنعتی",
      "description": "آشنایی با بلبرینگ و تفاوت آن با رولبرینگ؛ انواع شیار عمیق، تماس زاویه‌ای، خودتنظیم و کف‌گرد، خواندن ابعاد و شماره فنی و بررسی قطعات با پولاد چرخش آرین تک."
    },
    "references": [
      {
        "title": "NSK — Introduction to bearings and bearing types",
        "url": "https://www.nsk.com/tools-resources/introduction-bearings/"
      },
      {
        "title": "Schaeffler — Technical Pocket Guide",
        "url": "https://www.schaeffler.us/remotemedien/media/_shared_media/08_media_library/01_publications/schaeffler_2/catalogue_1/downloads_6/stt_de_en.pdf"
      }
    ]
  },
  {
    "slug": "roller-bearings",
    "en": {
      "title": "Roller bearings: tapered, cylindrical and spherical",
      "description": "Explore tapered, spherical, cylindrical and needle roller bearings. Compare exact designations, dimensions, load ratings and arrangement requirements."
    },
    "fa": {
      "title": "انواع رولبرینگ مخروطی، استوانه‌ای و بشکه‌ای",
      "description": "بررسی رولبرینگ بشکه‌ای، مخروطی، استوانه‌ای و سوزنی؛ مقایسه کد کامل، ابعاد، ظرفیت بار و شرایط آرایش بیرینگ در دستگاه."
    },
    "references": [
      {
        "title": "SKF — Bearings and mounted products",
        "url": "https://www.skf.com/binaries/pub12/Images/0901d196807026e8-100-700_SKF_bearings_and_mounted_products_2018_tcm_12-314117.pdf"
      }
    ]
  },
  {
    "slug": "pillow-blocks",
    "en": {
      "title": "Pillow blocks, flanged units and bearing housings",
      "description": "Identify UCP pillow blocks, UCF flanged units and SNL housings. Compare assembly contents, shaft sizes, mounting details and sealing requirements."
    },
    "fa": {
      "title": "یاتاقان پایه‌دار، واحد فلنجی و محفظه بیرینگ",
      "description": "راهنمای شناسایی یاتاقان UCP، واحد فلنجی UCF و محفظه SNL؛ بررسی اجزای مجموعه، قطر شفت، روش نصب، آب‌بندی و نقشه ابعادی."
    },
    "references": [
      {
        "title": "SKF — UC range designation system",
        "url": "https://cdn.skfmediahub.skf.com/api/public/0901d196808054f8/pdf_preview_medium/0901d196808054f8_pdf_preview_medium.pdf"
      }
    ]
  },
  {
    "slug": "oil-seals",
    "en": {
      "title": "Industrial oil seals: NBR and FKM selection",
      "description": "Compare industrial radial shaft seals by dimensions, lip design and documented material. Review NBR and FKM compatibility for the actual lubricant and conditions."
    },
    "fa": {
      "title": "کاسه نمد صنعتی NBR و FKM؛ راهنمای انتخاب",
      "description": "مقایسه کاسه نمد صنعتی بر اساس ابعاد، طرح لبه و جنس ثبت‌شده؛ بررسی سازگاری NBR و FKM با روانکار، دما و شرایط واقعی کاربرد."
    },
    "references": [
      {
        "title": "SKF — Radial shaft seal material compatibility",
        "url": "https://www.skf.com/mm/09433a92e9164581"
      },
      {
        "title": "SEW-EURODRIVE — Lubricant compatibility with oil seals",
        "url": "https://download.sew-eurodrive.com/download/html/31981496/en-EN/33954737547.html"
      }
    ]
  }
];

export const hubPath = (hub: CatalogHub) => '/catalog/' + hub.slug;
export const catalogHubForPath = (path: string) => catalogHubs.find(hub => hubPath(hub) === path);
type HubProduct = Pick<BearingProduct, 'category' | 'schematicType' | 'isArchived'>;
export function productBelongsToHub(product: HubProduct, hub: CatalogHub) {
  if (product.isArchived) return false;
  switch (hub.slug) {
    case 'ball-bearings': return product.category === 'ball' || (product.category === 'thrust' && product.schematicType === 'thrust');
    case 'roller-bearings': return ['roller', 'spherical', 'cylindrical'].includes(product.category) || product.schematicType === 'spherical-thrust';
    case 'pillow-blocks': return product.category === 'housing';
    case 'oil-seals': return product.category === 'seal';
    default: return false;
  }
}
export const productHub = (product: HubProduct) => catalogHubs.find(hub => productBelongsToHub(product, hub));
export const publicPagePaths = () => ['/', '/catalog', '/engineering', ...catalogHubs.map(hubPath)];

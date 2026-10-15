const imageUrl = '/product-images/skf-6305-2rz-qbo.jpg';

/** Attribution is specific to the selected asset, never inferred from a product code. */
export function supplierMedia(url: string) {
  return url === imageUrl ? {
    name: 'Quality Bearings Online',
    sourceUrl: 'https://www.qualitybearingsonline.com/6305-2rz-skf-deep-groove-bearing-25-x-62-x-17mm/',
    altEn: 'SKF 6305-2RZ supplier listing photograph: sealed bearing on an SKF box',
    altFa: 'عکس فهرست فروشنده برای SKF 6305-2RZ: بیرینگ آب‌بندی‌شده روی جعبه SKF',
  } : undefined;
}

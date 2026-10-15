import entries from './supplier-media-data.json';
interface SupplierImage {
  name: string; sourceUrl: string; altEn: string; altFa: string;
  example: boolean; pictured: string; illustration: boolean; mediaKind: string;
}
const images: Record<string, SupplierImage> = entries;

/** Attribution follows the selected asset; owner uploads never inherit supplier claims. */
export function supplierMedia(url: string) {
  const entry = images[url];
  const packaging = entry?.mediaKind === 'supplier_packaging_example';
  const brandReference = entry?.mediaKind === 'supplier_brand_example';
  return entry ? {
    ...entry,
    labelEn: entry.example ? `${packaging ? 'Packaging example' : brandReference ? 'Brand example' : 'Example'}: ${entry.pictured}` : entry.illustration ? 'Product illustration' : 'Supplier listing image',
    labelFa: entry.example ? `${packaging ? 'نمونه بسته‌بندی' : brandReference ? 'نمونه برند' : 'نمونه'}: ${entry.pictured}` : entry.illustration ? 'تصویر نمایشی محصول' : 'تصویر فهرست فروشنده',
    noteEn: entry.example ? `${packaging ? 'Packaging only' : brandReference ? 'Brand reference; exact product shape is not verified' : 'Pictured example'}: ${entry.pictured}. Other listed brands or variants may differ.${entry.illustration ? ' This is an illustration.' : ''}` : entry.illustration ? 'Illustration associated with the product listing; appearance may differ from the supplied unit.' : 'Supplier listing image; the photographed unit is not independently verified.',
    noteFa: entry.example ? `${packaging ? 'فقط بسته‌بندی' : brandReference ? 'نمونه برند؛ شکل دقیق محصول تأیید نشده است' : 'نمونه در تصویر'}: ${entry.pictured}. سایر برندها یا گونه‌های فهرست‌شده ممکن است متفاوت باشند.${entry.illustration ? ' این تصویر نمایشی است.' : ''}` : entry.illustration ? 'تصویر نمایشی مرتبط با فهرست محصول؛ ظاهر قطعه عرضه‌شده ممکن است متفاوت باشد.' : 'تصویر فهرست فروشنده؛ هویت قطعه داخل عکس به‌طور مستقل تأیید نشده است.',
  } : undefined;
}

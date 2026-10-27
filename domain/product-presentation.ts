import type { BearingProduct } from './product';

const tidy = (text: string) => text.replace(/\s+/g, ' ').trim();

/** A sole recorded brand plus a source naming this designation; never infer from media. */
export function documentedManufacturer(product: BearingProduct): string | undefined {
  const brands = [...new Map(product.brands.map(brand => [brand.trim().toUpperCase(), brand.trim()])).values()].filter(Boolean);
  if (brands.length !== 1 || /[/|,;]/.test(brands[0]) || /[/|]|\bor\b|یا/i.test(product.code)) return;
  const code = product.code.trim();
  if (!code) return;
  const escaped = code.split(/[\s-]+/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s-]*');
  const designation = new RegExp('(?:^|[^A-Z0-9])' + escaped + '(?=$|[^A-Z0-9/\\-])', 'i');
  const matches = product.technicalSources?.some(source => {
    if (!['official_catalog', 'official_product_table'].includes(source.sourceType) || source.manufacturer.trim().toUpperCase() !== brands[0].toUpperCase()) return false;
    try {
      const url = new URL(source.url || '');
      return url.protocol === 'https:' && !url.username && !url.password && designation.test(source.reference);
    } catch { return false; }
  });
  return matches ? brands[0] : undefined;
}

export function productHeading(product: BearingProduct, fa: boolean) {
  let name = tidy(product[fa ? 'nameFa' : 'nameEn']) || product.code;
  const normalized = (text: string) => text.toUpperCase().replace(/[\s-]+/g, '');
  if (!normalized(name).includes(normalized(product.code))) name += ' ' + product.code;
  const manufacturer = documentedManufacturer(product);
  if (manufacturer && !name.toUpperCase().includes(manufacturer.toUpperCase()))
    name += fa ? ' برند ' + manufacturer : ' · ' + manufacturer;
  return name;
}

export interface ProductSpecification {
  key: keyof BearingProduct;
  label: string;
  value: string;
  quantity?: { value: number; unitText: string };
}

/** Shared by the visible table, initial HTML and Product JSON-LD. Missing is not zero. */
export function productSpecifications(product: BearingProduct, fa: boolean): ProductSpecification[] {
  const t = (en: string, persian: string) => fa ? persian : en;
  const numeric = (key: keyof BearingProduct, label: string, unitText: string): ProductSpecification => {
    const value = product[key];
    const known = typeof value === 'number' && Number.isFinite(value) && value > 0;
    return { key, label, value: known ? `${value} ${unitText}` : '—', ...(known ? { quantity: { value, unitText } } : {}) };
  };
  const rows = product.category === 'lubricant' ? [] : [
    numeric('d', t('Bore diameter d', 'قطر داخلی d'), 'mm'),
    numeric('D', t('Outside diameter D', 'قطر خارجی D'), 'mm'),
    numeric('B', t('Width B', 'عرض B'), 'mm'),
    numeric('crKn', t('Dynamic load rating C', 'ظرفیت بار دینامیکی C'), 'kN'),
    numeric('corKn', t('Static load rating C₀', 'ظرفیت بار استاتیکی C₀'), 'kN'),
  ];
  rows.push(numeric('weightKg', t('Weight', 'وزن'), 'kg'));
  const speeds: Array<[keyof BearingProduct, string]> = [
    ['speedReferenceRpm', t('Reference speed', 'سرعت مرجع')],
    ['thermalSpeedRatingRpm', t('Thermal speed rating', 'سرعت حرارتی')],
    ['speedLimitingRpm', t('Limiting speed', 'سرعت حدی')],
    ['speedGreaseRpm', t('Grease speed', 'سرعت گریس')],
    ['speedOilRpm', t('Oil speed', 'سرعت روغن')],
  ];
  for (const [key, label] of speeds) {
    const row = numeric(key, label, 'rpm');
    if (row.quantity) rows.push(row);
  }
  if (product.category !== 'lubricant' && !rows.some(row => row.key === 'speedLimitingRpm'))
    rows.push(numeric('speedLimitingRpm', t('Limiting speed', 'سرعت حدی'), 'rpm'));
  if (product.category !== 'lubricant') rows.push(
    { key: fa ? 'cageMaterialFa' : 'cageMaterialEn', label: t('Cage', 'قفسه'), value: product[fa ? 'cageMaterialFa' : 'cageMaterialEn'] || '—' },
    { key: fa ? 'sealingFa' : 'sealingEn', label: t('Sealing', 'آب‌بندی'), value: product[fa ? 'sealingFa' : 'sealingEn'] || '—' },
    { key: 'clearanceOptions', label: t('Clearance', 'لقی'), value: product.clearanceOptions.join(' · ') || '—' },
  );
  return rows;
}

import type { BearingProduct } from './product';

// Transcribed from SKF's official sealed single-row deep groove ball bearing
// table (section 1.2, PDF pages 59, 61, 63 and 65). The source separates
// reference and limiting speed; neither is a grease/oil-specific rating.
const sourcePdf = 'https://cdn.skfmediahub.skf.com/api/public/0901d1968063464b/pdf_preview_medium/0901d1968063464b_pdf_preview_medium.pdf';
type Row = readonly [
  designation: string, d: number, D: number, B: number, cr: number, cor: number,
  referenceRpm: number, limitingRpm: number, weightKg: number, pdfPage: number,
];
const rows: Row[] = [
  ['6002-2Z', 15, 32, 9, 5.85, 2.85, 50000, 26000, 0.032, 59],
  ['6002-2RSL', 15, 32, 9, 5.85, 2.85, 50000, 26000, 0.03, 59],
  ['6002-2RSH', 15, 32, 9, 5.85, 2.85, 0, 14000, 0.03, 59],
  ['6202-2Z', 15, 35, 11, 8.06, 3.75, 43000, 22000, 0.048, 59],
  ['6202-2RSL', 15, 35, 11, 8.06, 3.75, 43000, 22000, 0.046, 59],
  ['6202-2RSH', 15, 35, 11, 8.06, 3.75, 0, 13000, 0.046, 59],
  ['6302-2Z', 15, 42, 13, 11.9, 5.4, 38000, 19000, 0.086, 59],
  ['6302-2RSL', 15, 42, 13, 11.9, 5.4, 38000, 19000, 0.085, 59],
  ['6302-2RSH', 15, 42, 13, 11.9, 5.4, 0, 12000, 0.085, 59],
  ['6003-2Z', 17, 35, 10, 6.37, 3.25, 45000, 22000, 0.041, 61],
  ['6003-2RSL', 17, 35, 10, 6.37, 3.25, 45000, 22000, 0.039, 61],
  ['6003-2RSH', 17, 35, 10, 6.37, 3.25, 0, 13000, 0.039, 61],
  ['6203-2Z', 17, 40, 12, 9.95, 4.75, 38000, 19000, 0.068, 61],
  ['6203-2RSL', 17, 40, 12, 9.95, 4.75, 38000, 19000, 0.067, 61],
  ['6203-2RSH', 17, 40, 12, 9.95, 4.75, 0, 12000, 0.067, 61],
  ['6303-2Z', 17, 47, 14, 14.3, 6.55, 34000, 17000, 0.12, 61],
  ['6303-2RSL', 17, 47, 14, 14.3, 6.55, 34000, 17000, 0.12, 61],
  ['6303-2RSH', 17, 47, 14, 14.3, 6.55, 0, 11000, 0.12, 61],
  ['6004-2Z', 20, 42, 12, 9.95, 5, 38000, 19000, 0.071, 61],
  ['6004-2RSL', 20, 42, 12, 9.95, 5, 38000, 19000, 0.067, 61],
  ['6004-2RSH', 20, 42, 12, 9.95, 5, 0, 11000, 0.067, 61],
  ['6304-2Z', 20, 52, 15, 16.8, 7.8, 30000, 15000, 0.15, 63],
  ['6304-2RSL', 20, 52, 15, 16.8, 7.8, 30000, 15000, 0.15, 63],
  ['6304-2RSH', 20, 52, 15, 16.8, 7.8, 0, 9500, 0.15, 63],
  ['6005-2Z', 25, 47, 12, 11.9, 6.55, 32000, 16000, 0.083, 63],
  ['6005-2RSL', 25, 47, 12, 11.9, 6.55, 32000, 16000, 0.08, 63],
  ['6005-2RSH', 25, 47, 12, 11.9, 6.55, 0, 9500, 0.08, 63],
  ['6205-2Z', 25, 52, 15, 14.8, 7.8, 28000, 14000, 0.13, 63],
  ['6205-2RSL', 25, 52, 15, 14.8, 7.8, 28000, 14000, 0.13, 63],
  ['6205-2RSH', 25, 52, 15, 14.8, 7.8, 0, 8500, 0.13, 63],
  ['6305-2Z', 25, 62, 17, 23.4, 11.6, 24000, 13000, 0.23, 63],
  ['6305-2RZ', 25, 62, 17, 23.4, 11.6, 24000, 13000, 0.23, 63],
  ['6305-2RS1', 25, 62, 17, 23.4, 11.6, 0, 7500, 0.23, 63],
  ['6006-2Z', 30, 55, 13, 13.8, 8.3, 28000, 14000, 0.12, 65],
  ['6006-2RZ', 30, 55, 13, 13.8, 8.3, 28000, 14000, 0.12, 65],
  ['6006-2RS1', 30, 55, 13, 13.8, 8.3, 0, 8000, 0.12, 65],
  ['6206-2Z', 30, 62, 16, 20.3, 11.2, 24000, 12000, 0.2, 65],
  ['6206-2RZ', 30, 62, 16, 20.3, 11.2, 24000, 12000, 0.2, 65],
  ['6206-2RS1', 30, 62, 16, 20.3, 11.2, 0, 7500, 0.2, 65],
  ['6306-2Z', 30, 72, 19, 29.6, 16, 20000, 11000, 0.36, 65],
  ['6306-2RZ', 30, 72, 19, 29.6, 16, 20000, 11000, 0.36, 65],
  ['6306-2RS1', 30, 72, 19, 29.6, 16, 0, 6300, 0.36, 65],
];

const sealDescription = (designation: string) =>
  designation.endsWith('2Z') ? ['two steel shields', 'دو حفاظ فلزی'] :
  designation.endsWith('2RSL') ? ['two low-friction seals', 'دو آب‌بند کم‌اصطکاک'] :
  designation.endsWith('2RZ') ? ['two low-friction seals', 'دو آب‌بند کم‌اصطکاک'] :
  ['two contact seals', 'دو آب‌بند تماسی'];

export const skfCatalogAdditions: BearingProduct[] = rows.map(([
  code, d, D, B, crKn, corKn, speedReferenceRpm, speedLimitingRpm, weightKg, pdfPage,
]) => {
  const [sealingEn, sealingFa] = sealDescription(code);
  const slug = `skf-${code.toLowerCase()}`;
  return {
    id: slug,
    slug,
    code,
    category: 'ball',
    schematicType: 'deep-groove',
    nameEn: `SKF ${code} deep groove ball bearing`,
    nameFa: `بلبرینگ شیار عمیق SKF ${code}`,
    descriptionEn: `SKF sealed single-row deep groove ball bearing with ${sealingEn}. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection.`,
    descriptionFa: `بلبرینگ شیار عمیق تک‌ردیفه SKF با ${sealingFa}. ابعاد و ظرفیت‌ها از جدول کاتالوگ SKF ثبت شده‌اند؛ پیش از انتخاب مهندسی، صفحه فعلی محصول بررسی شود.`,
    d, D, B, weightKg, crKn, corKn,
    speedGreaseRpm: 0,
    speedOilRpm: 0,
    ...(speedReferenceRpm > 0 ? { speedReferenceRpm } : {}),
    speedLimitingRpm,
    speedReferenceType: 'limiting',
    cageMaterialEn: '',
    cageMaterialFa: '',
    sealingEn,
    sealingFa,
    clearanceOptions: [],
    applicationsEn: [],
    applicationsFa: [],
    brands: ['SKF'],
    inStock: false,
    featured: false,
    technicalSources: [{
      manufacturer: 'SKF',
      sourceType: 'official_catalog',
      catalogCode: 'Sealed single-row deep groove ball bearings, section 1.2',
      reference: `SKF catalog table, PDF page ${pdfPage}, designation ${code}`,
      url: sourcePdf,
      verifiedAt: '2026-09-29',
    }],
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z',
    updatedBy: 'SKF catalog transcription',
  };
});

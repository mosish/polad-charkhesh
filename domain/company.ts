/**
 * Polad Charkhesh Arian Tech Centralized Company Data & Contact Information
 *
 * Single source of truth for company contact details, address,
 * working hours, and digital communication channels.
 */

export interface CompanyContactInfo {
  // Identity
  nameFa: string;
  nameEn: string;
  legalNameFa: string;
  legalNameEn: string;
  sloganFa: string;
  sloganEn: string;
  website: string;
  email: string;

  // Primary Phone (Mobile / Direct Management)
  primaryPhone: string;
  primaryPhoneDisplayFa: string;
  primaryPhoneDisplayEn: string;
  primaryPhoneTel: string;

  // Landline Phone (Central Office)
  landlinePhone: string;
  landlinePhoneDisplayFa: string;
  landlinePhoneDisplayEn: string;
  landlinePhoneTel: string;

  // WhatsApp
  whatsappNumber: string;
  whatsappUrl: string;

  // Address
  addressFa: string;
  addressEn: string;
  cityFa: string;
  cityEn: string;
  regionFa?: string;
  regionEn?: string;
  countryCode?: string;
  districtFa: string;
  districtEn: string;
  streetFa: string;
  streetEn: string;
  plate: string;

  // Working Hours
  workingHoursFa: string;
  workingHoursEn: string;
  workingHoursShortFa: string;
  workingHoursShortEn: string;

  // Map & Navigation Links
  maps: {
    google: string;
    neshan: string;
    balad: string;
  };
}

export const COMPANY_INFO: CompanyContactInfo = {
  nameFa: 'پولاد چرخش آرین تک',
  nameEn: 'Polad Charkhesh Arian Tech',
  legalNameFa: 'پولاد چرخش آرین تک',
  legalNameEn: 'Polad Charkhesh Arian Tech',
  sloganFa: 'تأمین و توزیع تخصصی انواع بیرینگ‌های صنایع نفت، معدن و فولاد',
  sloganEn:
    'Supply and distribution of all types of oil, mining and steel bearings',
  website: 'https://poladcharkhesh.ir',
  email: 'info@poladcharkhesh.ir',

  // Primary phone number as designated for Polad Charkhesh Arian Tech
  primaryPhone: '09127195313',
  primaryPhoneDisplayFa: '۰۹۱۲-۷۱۹۵۳۱۳',
  primaryPhoneDisplayEn: '0912-7195313',
  primaryPhoneTel: 'tel:+989127195313',

  // Landline central office
  landlinePhone: '02177209117',
  landlinePhoneDisplayFa: '۰۲۱-۷۷۲۰۹۱۱۷',
  landlinePhoneDisplayEn: '021-77209117',
  landlinePhoneTel: 'tel:+982177209117',

  // Official WhatsApp inquiry channel
  whatsappNumber: '+989127195313',
  whatsappUrl: 'https://wa.me/989127195313',

  // Central office & warehouse physical location
  addressFa: 'تهران، منطقه نارمک، خیابان دردشت، پلاک ۴۳۳',
  addressEn: 'No. 433, Dardasht Street, Narmak, Tehran, Iran',
  cityFa: 'تهران',
  cityEn: 'Tehran',
  regionFa: 'تهران',
  regionEn: 'Tehran',
  countryCode: 'IR',
  districtFa: 'نارمک',
  districtEn: 'Narmak',
  streetFa: 'خیابان دردشت',
  streetEn: 'Dardasht Street',
  plate: '۴۳۳',

  // Operational schedule (Standardized 08:00 - 16:00)
  workingHoursFa: 'شنبه تا چهارشنبه: ۰۸:۰۰ الی ۱۶:۰۰',
  workingHoursEn: 'Sat - Wed: 08:00 - 16:00',
  workingHoursShortFa: '۰۸:۰۰ الی ۱۶:۰۰',
  workingHoursShortEn: '08:00 - 16:00',

  maps: {
    google: 'https://maps.google.com/?q=35.7335,51.5125',
    neshan: 'https://nshn.ir',
    balad: 'https://balad.ir',
  },
};

/** Add the owner's confirmed province/country while preserving existing CMS values. */
export function upgradeCompanyGeography(company: CompanyContactInfo): CompanyContactInfo {
  return {
    regionFa: COMPANY_INFO.regionFa,
    regionEn: COMPANY_INFO.regionEn,
    countryCode: COMPANY_INFO.countryCode,
    ...company,
  };
}

/**
 * Generate a prefilled WhatsApp inquiry URL
 */
export function createWhatsAppInquiryUrl(params?: {
  baseUrl?: string;
  productCode?: string;
  productName?: string;
  dimensions?: string;
  brands?: string[];
  customMessage?: string;
  language?: 'fa' | 'en';
}): string {
  const base =
    params?.baseUrl || COMPANY_INFO.whatsappUrl || 'https://wa.me/989127195313';
  if (!params) {
    return base;
  }

  const isFa = params.language !== 'en';

  if (params.customMessage) {
    return `${base}?text=${encodeURIComponent(params.customMessage)}`;
  }

  let text = '';
  if (isFa) {
    text = `سلام و احترام، استعلام مشخصات و موجودی قطعه زیر را از پولاد چرخش آرین تک دارم:\n`;
    if (params.productCode) text += `▫️ کد کالا: ${params.productCode}\n`;
    if (params.productName) text += `▫️ نام: ${params.productName}\n`;
    if (params.dimensions) text += `▫️ ابعاد: ${params.dimensions}\n`;
    if (params.brands && params.brands.length > 0)
      text += `▫️ برندهای پیشنهادی: ${params.brands.join(' / ')}\n`;
    text += `لطفاً راهنمایی بفرمایید.`;
  } else {
    text = `Hello, I would like to inquire about specifications and stock availability for:\n`;
    if (params.productCode) text += `▫️ Part Code: ${params.productCode}\n`;
    if (params.productName) text += `▫️ Name: ${params.productName}\n`;
    if (params.dimensions) text += `▫️ Dimensions: ${params.dimensions}\n`;
    if (params.brands && params.brands.length > 0)
      text += `▫️ Brands: ${params.brands.join(' / ')}\n`;
    text += `Please advise.`;
  }

  return `${base}?text=${encodeURIComponent(text)}`;
}

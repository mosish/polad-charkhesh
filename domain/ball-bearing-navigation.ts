import type { BearingProduct, BearingSchematicType } from './product';
import { catalogHubs, productBelongsToHub } from './catalog-hubs';
import { documentedManufacturer } from './product-presentation';

export const ballBearingIntro = {
  en: {
    title: 'Which ball bearing type are you identifying?',
    text: 'Start with the bearing type, then compare the complete designation and dimensions in each product record. These are catalog examples; availability and the exact supplied component require confirmation.',
    examples: 'Catalog examples',
    empty: 'Share the complete designation for help identifying this type.',
    contactTitle: 'Need help identifying a ball bearing?',
    contactText: 'Prepare the full ring marking, manufacturer, a clear photograph and the machine application. Include operating speed and load information when available.',
    contact: 'Discuss the component',
  },
  fa: {
    title: 'کدام نوع بلبرینگ را شناسایی می‌کنید؟',
    text: 'ابتدا نوع بلبرینگ را مشخص کنید، سپس کد کامل و ابعاد را در صفحه هر محصول مقایسه کنید. موارد زیر نمونه‌های کاتالوگ‌اند؛ موجودی و هویت دقیق قطعه قابل تأمین نیاز به تأیید دارند.',
    examples: 'نمونه‌های کاتالوگ',
    empty: 'برای بررسی این نوع، کد کامل قطعه را اعلام کنید.',
    contactTitle: 'برای شناسایی بلبرینگ به راهنمایی نیاز دارید؟',
    contactText: 'نوشته کامل روی رینگ، نام سازنده، عکس واضح و کاربرد دستگاه را آماده کنید. اگر در دسترس است، سرعت کار و اطلاعات بار را نیز همراه داشته باشید.',
    contact: 'گفت‌وگوی فنی درباره قطعه',
  },
};

export const ballBearingTypes: Array<{
  type: BearingSchematicType;
  en: { title: string; text: string };
  fa: { title: string; text: string };
}> = [
  {
    type: 'deep-groove',
    en: { title: 'Deep groove ball bearings', text: 'Check the complete sealing, clearance and cage designation against the manufacturer documentation.' },
    fa: { title: 'بلبرینگ شیار عمیق', text: 'کد کامل آب‌بند، لقی و قفسه را با مستندات همان سازنده کنترل کنید.' },
  },
  {
    type: 'angular-contact',
    en: { title: 'Angular contact ball bearings', text: 'Check the contact angle, mounting orientation and pairing against the machine drawing.' },
    fa: { title: 'بلبرینگ تماس زاویه‌ای', text: 'زاویه تماس، جهت نصب و وضعیت جفت‌شدن را با نقشه دستگاه تطبیق دهید.' },
  },
  {
    type: 'self-aligning-ball',
    en: { title: 'Self-aligning ball bearings', text: 'Record the misalignment and check the limits stated for the exact bearing.' },
    fa: { title: 'بلبرینگ خودتنظیم', text: 'ناهم‌راستایی مجموعه و حدود مجاز مستندشده برای همان بلبرینگ را بررسی کنید.' },
  },
  {
    type: 'thrust',
    en: { title: 'Thrust ball bearings', text: 'Check the axial load direction and the assembly components in the source drawing.' },
    fa: { title: 'بلبرینگ کف‌گرد', text: 'جهت بار محوری و اجزای مجموعه را در نقشه مرجع قطعه کنترل کنید.' },
  },
];

/* Use the existing exact-designation source gate: legacy display classifications
 * alone must not promote ambiguous records into type examples. This does not
 * grant engineering approval or confirm availability. */
export function ballBearingExamples(products: BearingProduct[]) {
  const hub = catalogHubs.find(item => item.slug === 'ball-bearings')!;
  const eligible = products.filter(product => productBelongsToHub(product, hub) && product.slug && documentedManufacturer(product));
  return ballBearingTypes.map(group => ({
    ...group,
    products: eligible.filter(product => product.schematicType === group.type)
      .sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }))
      .slice(0, 3),
  }));
}

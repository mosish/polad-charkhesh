import type { BearingProduct } from '../domain/product';
import { calculationFamilyFlags, reviewedCalculationProfiles, type ReviewedCalculationProfile } from '../domain/engineering';

export type EligibilityReason = 'no-selection' | 'archived' | 'not-bearing' | 'family-review' | 'review-required' | 'stale-review' | 'invalid-review' | 'unsupported-family';
export type CalculationEligibility =
  | { eligible: true; profile: ReviewedCalculationProfile }
  | { eligible: false; reason: EligibilityReason };

const revisionFields = [
  'id', 'code', 'category', 'brands', 'clearanceOptions', 'contactAngle',
  'd', 'D', 'B', 'crKn', 'corKn', 'calculationFactorE', 'calculationFactorX',
  'calculationFactorY', 'calculationFactorY0', 'calculationFactorY1', 'calculationFactorY2', 'calculationFactorF0',
  'speedGreaseRpm', 'speedOilRpm', 'speedReferenceRpm', 'speedLimitingRpm', 'thermalSpeedRatingRpm', 'speedReferenceType',
  'cageMaterialEn', 'cageMaterialFa', 'sealingEn', 'sealingFa', 'technicalSources',
] as const satisfies readonly (keyof BearingProduct)[];

export function calculationRevision(product: BearingProduct): string {
  // Ordered keys distinguish omitted values from explicit values. Visual changes are irrelevant.
  return JSON.stringify(revisionFields.map((key) => [key, product[key] === undefined ? { absent: true } : product[key]]));
}

export function calculationEligibility(
  product: BearingProduct | undefined,
  profile = reviewedCalculationProfiles.find((entry) => entry.productId === product?.id),
): CalculationEligibility {
  if (!product) return { eligible: false, reason: 'no-selection' };
  if (product.isArchived) return { eligible: false, reason: 'archived' };
  if (['housing', 'seal', 'lubricant'].includes(product.category)) return { eligible: false, reason: 'not-bearing' };
  if (!profile) return { eligible: false, reason: calculationFamilyFlags[product.id] ? 'family-review' : 'review-required' };
  if (profile.productId !== product.id || profile.technicalRevision !== calculationRevision(product)) return { eligible: false, reason: 'stale-review' };
  if (['angular-contact', 'self-aligning-ball', 'cam-follower'].includes(profile.family)) return { eligible: false, reason: 'unsupported-family' };
  if (
    profile.methodVersion !== 'catalog-life/1' ||
    !['deep-groove', 'cylindrical', 'needle', 'carb', 'spherical', 'tapered', 'thrust-ball', 'spherical-thrust'].includes(profile.family) ||
    !profile.arrangement.trim() || !profile.reviewedBy.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(profile.reviewedAt) ||
    !profile.loadCases.length || !profile.loadCases.every((value) => ['radial', 'axial', 'combined'].includes(value)) ||
    !profile.evidence.length || !profile.evidence.every((source) => source.url.startsWith('https://') && source.reference.trim())
  ) return { eligible: false, reason: 'invalid-review' };
  return { eligible: true, profile };
}

const messages: Record<EligibilityReason, readonly [string, string]> = {
  'no-selection': ['Select a catalog product, or use manual inputs. The requested product was not selected or could not be found.', 'یک محصول کاتالوگ انتخاب کنید یا مقادیر را دستی وارد کنید. محصول انتخاب نشده یا پیدا نشد.'],
  archived: ['This product is archived. Use another product or enter verified manual inputs.', 'این محصول بایگانی شده است. محصول دیگری انتخاب کنید یا مقادیر تأییدشده را دستی وارد کنید.'],
  'not-bearing': ['Bearing-life calculation does not apply to this component. You can use the independent manual tool for a bearing.', 'محاسبه عمر بیرینگ برای این قطعه کاربرد ندارد. برای یک بیرینگ می‌توانید از ابزار مستقل ورود دستی استفاده کنید.'],
  'family-review': ['The bearing family and arrangement need review before product-based calculation. Use verified manual inputs instead.', 'خانواده و آرایش بیرینگ پیش از محاسبه بر اساس محصول نیاز به بررسی دارد. مقادیر تأییدشده را دستی وارد کنید.'],
  'review-required': ['This product does not yet have an approved calculation method and technical-data review. Use verified manual inputs.', 'روش محاسبه و اطلاعات فنی این محصول هنوز تأیید نشده است. مقادیر تأییدشده را دستی وارد کنید.'],
  'stale-review': ['The technical data have changed since review. Reapproval is required before product-based calculation.', 'اطلاعات فنی پس از بررسی تغییر کرده است. محاسبه بر اساس محصول به تأیید دوباره نیاز دارد.'],
  'invalid-review': ['The method review is incomplete. Use verified manual inputs until it is completed.', 'بررسی روش محاسبه کامل نیست. تا تکمیل آن، مقادیر تأییدشده را دستی وارد کنید.'],
  'unsupported-family': ['This family needs an arrangement-specific method that is not available here. Use a verified equivalent load in manual mode.', 'این خانواده به روش ویژه آرایش بیرینگ نیاز دارد که در این ابزار موجود نیست. بار معادل تأییدشده را در حالت دستی وارد کنید.'],
};
export const eligibilityMessage = (reason: EligibilityReason, fa: boolean) => messages[reason][fa ? 1 : 0];

export function selectedCalculationProduct(products: BearingProduct[], selection: string) {
  return products.find((product) => !product.isArchived && (product.id === selection || product.slug === selection));
}

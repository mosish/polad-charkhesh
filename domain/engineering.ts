/** Calculation metadata is reviewed separately from ProductTechnicalSpecs.schematicType. */
export type CalculationFamily =
  | 'deep-groove' | 'cylindrical' | 'needle' | 'carb' | 'spherical'
  | 'tapered' | 'thrust-ball' | 'spherical-thrust'
  | 'angular-contact' | 'self-aligning-ball' | 'cam-follower';
export type LoadCase = 'radial' | 'axial' | 'combined';

export interface ReviewedCalculationProfile {
  productId: string;
  /** Canonical technical snapshot, not a security signature. Changed data invalidates review. */
  technicalRevision: string;
  methodVersion: 'catalog-life/1';
  family: CalculationFamily;
  arrangement: string;
  loadCases: readonly LoadCase[];
  reviewedBy: string;
  reviewedAt: string;
  evidence: readonly { url: string; reference: string }[];
}

/** Intentionally empty until the owner's nominated engineer approves methods AND records.
 * Registry changes require source review; public catalog/admin data cannot grant approval.
 */
export const reviewedCalculationProfiles: readonly ReviewedCalculationProfile[] = [];

/** Audit flags are review requests, not approved family corrections. */
export const calculationFamilyFlags: Readonly<Record<string, string>> = {
  'pc-7312-becbm': 'Angular-contact designation currently routed through deep-groove; arrangement/family review required.',
  'pc-7210-becbp': 'Angular-contact designation currently routed through deep-groove; arrangement/family review required.',
  'pc-3308-a-2z': 'Double-row angular-contact candidate currently routed through deep-groove; verify exact variant.',
  'pc-1309-ektn9': 'Self-aligning designation currently routed through deep-groove.',
  'pc-nsk-7010-ctyndblp4': 'Precision angular-contact pair currently routed through deep-groove; pair arrangement unresolved.',
  'pc-ntn-5206-s': 'NTN 5206S is double-row angular-contact; current deep-groove branch is inappropriate.',
  'pc-29420-e': 'Description specifies spherical roller thrust, but current thrust branch uses ball exponent.',
  'pc-na-4910': 'Needle family displayed as cylindrical; explicit calculation metadata needed.',
  'pc-ina-nk-25-20': 'Needle family displayed as cylindrical; explicit calculation metadata needed.',
  'pc-skf-c-2215-k': 'CARB family displayed as cylindrical; explicit calculation metadata needed.',
  'pc-ina-kr-35-pp': 'Cam follower needs track/outer-ring applicability review, not a generic cylindrical assumption.',
};

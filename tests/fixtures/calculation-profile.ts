import type { BearingProduct } from '../../domain/product';
import type { CalculationFamily, ReviewedCalculationProfile } from '../../domain/engineering';
import { calculationRevision } from '../../lib/engineering-eligibility';

/** Synthetic method-test contract only. Never import this into application source or the registry. */
export function fixtureProfile(product: BearingProduct, family: CalculationFamily = 'deep-groove'): ReviewedCalculationProfile {
  return {
    productId: product.id, technicalRevision: calculationRevision(product),
    methodVersion: 'catalog-life/2', family, arrangement: 'Synthetic test arrangement',
    ...(family === 'spherical-thrust' ? { sphericalThrust: { series: '294' as const, runout: 'affects-load' as const } } : {}),
    loadCases: ['radial', 'axial', 'combined'], reviewedBy: 'TEST FIXTURE - NOT AN ENGINEERING APPROVAL',
    reviewedAt: '2026-10-18', evidence: [{ url: 'https://example.invalid/synthetic-fixture', reference: 'Software regression fixture only' }],
  };
}

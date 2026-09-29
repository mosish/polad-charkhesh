import type { BearingProduct } from '../domain/product';
export const reliabilityFactors: Record<number, number> = {
  90: 1,
  95: 0.64,
  98: 0.37,
  99: 0.25,
};
export function calculate(
  p: BearingProduct,
  Fr: number,
  Fa: number,
  rpm: number,
  reliability = 90,
  arrangementConfirmed = false,
) {
  if (
    [Fr, Fa, rpm].some((x) => !Number.isFinite(x)) ||
    Fr < 0 ||
    Fa < 0 ||
    rpm <= 0 ||
    Fr + Fa <= 0
  )
    throw new Error(
      'Enter non-negative loads, a positive total load, and a positive speed.',
    );
  if (!reliabilityFactors[reliability])
    throw new Error('Unsupported reliability level.');
  if (['housing', 'seal', 'lubricant'].includes(p.category))
    throw new Error(
      'This component is not supported by the bearing-life calculation.',
    );
  if (!(p.crKn > 0) || !(p.corKn > 0))
    throw new Error('Positive manufacturer load ratings are required.');
  const family = p.schematicType;
  let P = Fr,
    P0 = Fr,
    formula = 'P = Fr';
  const ratio = Fr > 0 ? Fa / Fr : Infinity;
  if (['cylindrical', 'needle', 'carb'].includes(family)) {
    if (Fa > 0)
      throw new Error(
        'Radial-only calculation: axial load is unsupported for NU/N, needle and CARB configurations.',
      );
  } else if (family === 'thrust') {
    if (Fr > 0 || Fa <= 0)
      throw new Error(
        'Flat thrust bearings require pure axial load: Fr = 0 and Fa > 0.',
      );
    P = P0 = Fa;
    formula = 'P = Fa';
  } else if (family === 'spherical-thrust') {
    if (!(Fa > 0) || Fr > 0.55 * Fa)
      throw new Error(
        'Spherical thrust bearings require Fa > 0 and Fr ≤ 0.55 Fa.',
      );
    if (
      p.calculationFactorY === undefined ||
      p.calculationFactorY0 === undefined
    )
      throw new Error('Product-specific spherical thrust factors are missing.');
    P = Fa + p.calculationFactorY * Fr;
    P0 = Fa + p.calculationFactorY0 * Fr;
    formula = `P = Fa + ${p.calculationFactorY} Fr`;
  } else if (family === 'spherical') {
    const {
      calculationFactorE: e,
      calculationFactorY1: y1,
      calculationFactorY2: y2,
      calculationFactorY0: y0,
    } = p;
    if ([e, y1, y2, y0].some((x) => x === undefined))
      throw new Error('Product-specific spherical roller factors are missing.');
    P = ratio <= e! ? Fr + y1! * Fa : 0.67 * Fr + y2! * Fa;
    P0 = Fr + y0! * Fa;
    formula = ratio <= e! ? `P = Fr + ${y1} Fa` : `P = 0.67 Fr + ${y2} Fa`;
  } else if (family === 'tapered') {
    if (!arrangementConfirmed)
      throw new Error(
        'Confirm that axial load includes induced axial effects and the bearing arrangement has been reviewed.',
      );
    const e = p.calculationFactorE,
      y = p.calculationFactorY,
      y0 = p.calculationFactorY0;
    if ([e, y, y0].some((x) => x === undefined))
      throw new Error('Tapered bearing factors are missing.');
    P = ratio <= e! ? Fr : 0.4 * Fr + y! * Fa;
    P0 = Math.max(Fr, 0.5 * Fr + y0! * Fa);
    formula = ratio <= e! ? 'P = Fr' : `P = 0.4 Fr + ${y} Fa`;
  } else if (family === 'deep-groove') {
    if (Fa === 0) {
      P = P0 = Fr;
    } else {
      if (!p.calculationFactorF0)
        throw new Error('The product-specific f0 factor is required.');
      const table = [
        [0.172, 0.19, 2.3],
        [0.345, 0.22, 1.99],
        [0.689, 0.26, 1.71],
        [1.03, 0.28, 1.55],
        [1.38, 0.3, 1.45],
        [2.07, 0.34, 1.31],
        [3.45, 0.38, 1.15],
        [5.17, 0.42, 1.04],
        [6.89, 0.44, 1],
      ];
      const value = (p.calculationFactorF0 * Fa) / p.corKn;
      if (value > 6.89)
        throw new Error(
          'Combined loading exceeds the supported factor table. Consult the manufacturer.',
        );
      let e = table[0][1],
        y = table[0][2];
      for (let i = 1; i < table.length; i++) {
        if (value <= table[i][0]) {
          const a = table[i - 1],
            b = table[i],
            f = Math.max(0, (value - a[0]) / (b[0] - a[0]));
          e = a[1] + f * (b[1] - a[1]);
          y = a[2] + f * (b[2] - a[2]);
          break;
        }
      }
      P = ratio <= e ? Fr : 0.56 * Fr + y * Fa;
      P0 = Math.max(Fr, 0.6 * Fr + 0.5 * Fa);
      formula = ratio <= e ? 'P = Fr' : `P = 0.56 Fr + ${y.toFixed(3)} Fa`;
    }
  } else if (['angular-contact', 'self-aligning-ball'].includes(family)) {
    throw new Error(
      'This family requires arrangement-specific manufacturer factors. Use a manufacturer-verified equivalent load instead.',
    );
  } else throw new Error('This bearing family is not supported.');
  const exponent = [
    'deep-groove',
    'thrust',
    'angular-contact',
    'self-aligning-ball',
  ].includes(family)
    ? 3
    : 10 / 3;
  const L10 = (p.crKn / P) ** exponent,
    hours = (L10 * 1e6) / (60 * rpm);
  if (!Number.isFinite(hours))
    throw new Error('The result exceeds the supported numerical range.');
  return {
    P,
    P0,
    formula,
    exponent,
    L10,
    hours,
    adjustedHours: hours * reliabilityFactors[reliability],
    a1: reliabilityFactors[reliability],
    safety: p.corKn / P0,
    overspeed:
      rpm > (p.speedLimitingRpm ||
        Math.min(...[p.speedGreaseRpm, p.speedOilRpm].filter((x) => x > 0))),
  };
}
export function basicLife(C: number, P: number, rpm: number, roller: boolean) {
  if ([C, P, rpm].some((x) => !Number.isFinite(x) || x <= 0))
    throw new Error('C, P and speed must be positive.');
  const p = roller ? 10 / 3 : 3;
  const L10=(C/P)**p, hours=L10*1e6/(60*rpm);
  if(!Number.isFinite(L10)||!Number.isFinite(hours))throw new Error('The result exceeds the supported numerical range.');
  return {L10,hours};
}

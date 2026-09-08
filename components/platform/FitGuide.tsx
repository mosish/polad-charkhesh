import { useState } from 'react';
import { usePlatform } from './Context';
import { fitRange } from '../../lib/showroom';
export default function FitGuide() {
  const { t } = usePlatform();
  const [limits, setLimits] = useState(['20', '20.01', '20.005', '20.015']);
  let result: ReturnType<typeof fitRange> | undefined;
  try {
    result = fitRange(
      ...(limits.map((v) => (v.trim() ? Number(v) : NaN)) as [
        number,
        number,
        number,
        number,
      ]),
    );
  } catch {}
  return (
    <section className="panel">
      <div className="section-label">
        {t('FIT LIMIT EXPLORER', 'بررسی حدود انطباق')}
      </div>
      <h3>{t('From dimensions to fit.', 'از ابعاد تا انطباق.')}</h3>
      <p>
        {t(
          'Enter verified mating diameter limits in millimetres. Positive values mean clearance; negative values mean interference.',
          'حدود تأییدشده قطرهای جفت‌شونده را بر حسب میلی‌متر وارد کنید. مقدار مثبت لقی و مقدار منفی تداخل است.',
        )}
      </p>
      <div className="form-grid">
        {[
          t('Hole minimum / mm', 'حداقل سوراخ / mm'),
          t('Hole maximum / mm', 'حداکثر سوراخ / mm'),
          t('Shaft minimum / mm', 'حداقل شفت / mm'),
          t('Shaft maximum / mm', 'حداکثر شفت / mm'),
        ].map((label, i) => (
          <label key={i}>
            {label}
            <input
              type="number"
              min="0"
              step="0.001"
              value={limits[i]}
              onChange={(e) =>
                setLimits((old) =>
                  old.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
            />
          </label>
        ))}
      </div>
      <div className="fit-output" role="status">
        {result ? (
          <>
            <strong>
              {result.min.toFixed(1)} … {result.max.toFixed(1)} µm
            </strong>
            <span>
              {result.kind === 'clearance'
                ? t('Clearance fit', 'انطباق لقی')
                : result.kind === 'interference'
                  ? t('Interference fit', 'انطباق تداخلی')
                  : t('Transition fit', 'انطباق انتقالی')}
            </span>
            <p>
              {t(
                'Minimum = smallest hole − largest shaft. Maximum = largest hole − smallest shaft.',
                'حداقل = کوچک‌ترین سوراخ − بزرگ‌ترین شفت. حداکثر = بزرگ‌ترین سوراخ − کوچک‌ترین شفت.',
              )}
            </p>
          </>
        ) : (
          t(
            'Enter positive limits with minimum ≤ maximum.',
            'حدود مثبت وارد کنید؛ حداقل باید کمتر یا مساوی حداکثر باشد.',
          )
        )}
      </div>
      <p>
        {t(
          'This calculates the dimensional fit only, not a recommended tolerance class or operating internal clearance.',
          'این ابزار فقط انطباق ابعادی را محاسبه می‌کند، نه کلاس تلرانس پیشنهادی یا لقی داخلی کارکرد.',
        )}
      </p>
      <p>
        {t(
          'A rotating load on a ring generally requires interference to resist creep. Fit choice also depends on load, temperature and mounting arrangement. Interference can reduce internal clearance.',
          'بار چرخان روی رینگ معمولاً برای جلوگیری از خزش به تداخل نیاز دارد. انتخاب انطباق به بار، دما و آرایش نصب نیز بستگی دارد. تداخل می‌تواند لقی داخلی را کاهش دهد.',
        )}
      </p>
      <a
        className="text-link"
        href="https://www.nsk.com/tools-resources/abc-bearings/fits-and-internal-clearance/"
        target="_blank"
        rel="noreferrer"
      >
        {t('NSK · Fits and internal clearance', 'NSK · انطباق و لقی داخلی')} ↗
      </a>
    </section>
  );
}

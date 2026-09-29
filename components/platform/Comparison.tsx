import { useState } from 'react';
import { usePlatform } from './Context';
import type { BearingProduct } from '../../domain/product';
export default function Comparison({ initial = [] }: { initial?: string[] }) {
  const { products, t, fa } = usePlatform();
  const [ids, setIds] = useState<string[]>(() =>
    [...new Set(initial)].slice(0, 3),
  );
  const [differences, setDifferences] = useState(false);
  const chosen = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is BearingProduct => !!p);
  const rows: [string, (p: BearingProduct) => string][] = [
    [t('Family', 'خانواده'), (p) => p.schematicType],
    [t('Bore d / mm', 'قطر داخلی / mm'), (p) => String(p.d)],
    [t('Outside D / mm', 'قطر خارجی / mm'), (p) => String(p.D)],
    [t('Width B / mm', 'عرض / mm'), (p) => String(p.B)],
    [
      t('Dynamic rating / kN', 'بار دینامیکی / kN'),
      (p) => (p.crKn > 0 ? String(p.crKn) : '—'),
    ],
    [
      t('Static rating / kN', 'بار استاتیکی / kN'),
      (p) => (p.corKn > 0 ? String(p.corKn) : '—'),
    ],
    [
      t('Grease speed / RPM', 'سرعت گریس / RPM'),
      (p) => (p.speedGreaseRpm > 0 ? String(p.speedGreaseRpm) : '—'),
    ],
    [
      t('Oil speed / RPM', 'سرعت روغن / RPM'),
      (p) => (p.speedOilRpm > 0 ? String(p.speedOilRpm) : '—'),
    ],
    [t('Weight / kg', 'وزن / kg'), (p) => String(p.weightKg)],
    [t('Cage', 'قفسه'), (p) => p[fa ? 'cageMaterialFa' : 'cageMaterialEn']],
    [t('Sealing', 'آب‌بندی'), (p) => p[fa ? 'sealingFa' : 'sealingEn']],
    [t('Clearance', 'لقی'), (p) => p.clearanceOptions.join(' / ') || '—'],
  ];
  return (
    <section className="panel comparison">
      <div className="section-label">
        {t('TECHNICAL COMPARISON', 'مقایسه فنی')}
      </div>
      <h3>{t('Understand the differences.', 'تفاوت‌ها را بشناسید.')}</h3>
      <div className="comparison-selectors">
        {[0, 1, 2].map((i) => (
          <label key={i}>
            {t('Component', 'قطعه')} {i + 1}
            <select
              value={ids[i] || ''}
              onChange={(e) =>
                setIds((old) => {
                  const next = [...old];
                  next[i] = e.target.value;
                  return next;
                })
              }
            >
              <option value="">{t('Choose a component', 'انتخاب قطعه')}</option>
              {products.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={ids.includes(p.id) && ids[i] !== p.id}
                >
                  {p.code}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={differences}
          onChange={(e) => setDifferences(e.target.checked)}
        />
        {t('Show differences only', 'فقط تفاوت‌ها')}
      </label>
      {chosen.length < 2 ? (
        <p role="status">
          {t(
            'Choose two or three components to compare their specifications.',
            'دو یا سه قطعه را برای مقایسه مشخصات انتخاب کنید.',
          )}
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <caption>
              {t(
                'Catalog specifications · matching dimensions do not establish interchangeability.',
                'مشخصات کاتالوگ · ابعاد یکسان به معنی قابلیت جایگزینی نیست.',
              )}
            </caption>
            <thead>
              <tr>
                <th>{t('Specification', 'مشخصه')}</th>
                {chosen.map((p) => (
                  <th key={p.id}>
                    <a href={'/?item=' + encodeURIComponent(p.slug || p.id) + '#catalog'}>{p.code}</a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows
                .filter(
                  ([, get]) =>
                    !differences || new Set(chosen.map(get)).size > 1,
                )
                .map(([label, get]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {chosen.map((p) => (
                      <td key={p.id} dir="auto">
                        {get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

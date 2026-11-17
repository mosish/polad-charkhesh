import { useId, useMemo, useRef, useState } from 'react';
import { usePlatform } from './Context';
import EngineeringNumberInput, {
  EngineeringInputHint,
} from './EngineeringNumberInput';
import {
  formatEngineeringNumber,
  engineeringNumber,
} from '../../lib/engineering-input';
import {
  dutyLife,
  scenarioLife,
  shaftPower,
  targetCapacity,
  workbenchMethodVersion,
  lubricationReview,
  type BearingKind,
  type PowerUnknown,
} from '../../lib/engineering-workbench';
import {
  caseStaleness,
  caseStorageKey,
  initialWorkbookDraft,
  parseCaseFile,
  type EngineeringCase,
  type WorkbookDraft,
  type WorkbookRow,
} from '../../lib/engineering-cases';
import { calculationRevision } from '../../lib/engineering-eligibility';
import {
  methodSources,
  maintenancePaths,
  workbookTools,
  type WorkbookTool,
} from '../../domain/engineering-workbench';
import type { BearingProduct } from '../../domain/product';
import { fitRange } from '../../lib/showroom';
import '../../app/engineering-workbench.css';

type Preview = {
  metrics: [string, number, string][];
  formula: string;
  source: string;
  rows?: { name: string; hours: number; other: number }[];
  fit?: ReturnType<typeof fitRange>;
};
const idForCase = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');
const cloneDraft = (value: WorkbookDraft): WorkbookDraft => ({
  values: { ...value.values },
  rows: value.rows.map((row) => ({ ...row })),
  notes: value.notes,
});
function readCases() {
  try {
    const raw = localStorage.getItem(caseStorageKey);
    return {
      cases: parseCaseFile(raw || '{"schema":1,"cases":[]}'),
      failed: false,
      raw,
    };
  } catch {
    return { cases: [] as EngineeringCase[], failed: true, raw: null };
  }
}

export default function EngineeringWorkbench({
  product,
}: {
  product?: BearingProduct;
}) {
  const { fa, t, products } = usePlatform();
  const uid = useId();
  const [tool, setTool] = useState<WorkbookTool>('target');
  const [draft, setDraft] = useState<WorkbookDraft>(initialWorkbookDraft);
  const [initial] = useState(readCases);
  const [cases, setCases] = useState(initial.cases);
  const storedRaw = useRef(initial.raw);
  const [message, setMessage] = useState(
    initial.failed
      ? t(
          'Saved cases could not be read. Export or recover existing storage before saving; nothing was overwritten.',
          'پرونده‌های ذخیره‌شده خوانده نشدند. پیش از ذخیره، اطلاعات قبلی را بازیابی کنید؛ چیزی بازنویسی نشد.',
        )
      : '',
  );
  const [storageBlocked] = useState(initial.failed);
  const [name, setName] = useState('');
  const [opened, setOpened] = useState<EngineeringCase>();
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [openedProduct, setOpenedProduct] =
    useState<EngineeringCase['product']>();
  const importInput = useRef<HTMLInputElement>(null);
  const v = draft.values;
  const lubeReview = lubricationReview(v);
  const caseStatuses = useMemo(
    () =>
      new Map(cases.map((item) => [item.id, caseStaleness(item, products)])),
    [cases, products],
  );
  const dirty = opened
    ? tool !== opened.tool ||
      name.trim() !== opened.name ||
      JSON.stringify(draft) !== JSON.stringify(opened.draft)
    : Boolean(name.trim()) ||
      JSON.stringify(draft) !== JSON.stringify(initialWorkbookDraft());
  const format = (value: number) => formatEngineeringNumber(value, fa);
  const update = (key: string, value: string) =>
    setDraft((old) => ({ ...old, values: { ...old.values, [key]: value } }));
  const changeRow = (index: number, key: keyof WorkbookRow, value: string) =>
    setDraft((old) => ({
      ...old,
      rows: old.rows.map((row, at) =>
        at === index ? { ...row, [key]: value } : row,
      ),
    }));
  const numberField = (
    key: string,
    label: string,
    constraint: 'positive' | 'nonnegative' | 'any' = 'positive',
  ) => (
    <label htmlFor={`${uid}-${key}`}>
      {label}
      <EngineeringNumberInput
        inputId={`${uid}-${key}`}
        value={v[key] || ''}
        onChange={(value) => update(key, value)}
        constraint={constraint}
      />
    </label>
  );
  const selectField = (
    key: string,
    label: string,
    options: readonly (readonly [string, string])[],
  ) => (
    <label>
      {label}
      <select
        value={v[key] || ''}
        onChange={(event) => {
          const value = event.target.value;
          if (key === 'unknown')
            setDraft((old) => ({
              ...old,
              values: { ...old.values, unknown: value, first: '', second: '' },
            }));
          else update(key, value);
        }}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  const kindPicker = () =>
    selectField('kind', t('Bearing type', 'نوع بیرینگ'), [
      ['', t('Select type', 'نوع را انتخاب کنید')],
      ['ball', t('Ball · p = 3', 'بلبرینگ · p = 3')],
      ['roller', t('Roller · p = 10/3', 'رولبرینگ · p = 10/3')],
    ]);
  const yesNo = [
    ['unknown', t('Unknown', 'نامشخص')],
    ['yes', t('Yes', 'بله')],
    ['no', t('No', 'خیر')],
  ] as const;

  const preview = useMemo((): { value?: Preview; error?: string } => {
    const n = (key: string) => engineeringNumber(v[key] || '');
    const kind = v.kind as BearingKind;
    try {
      if (needsRecalculation || ['maintenance', 'lubrication'].includes(tool))
        return {};
      if (tool === 'target') {
        const result = targetCapacity(n('p'), n('n'), n('hours'), kind);
        return {
          value: {
            metrics: [
              [
                t('Required dynamic capacity C', 'ظرفیت دینامیکی لازم C'),
                result.capacity,
                'kN',
              ],
              [
                t('Target revolutions', 'دور هدف'),
                result.revolutions,
                '10⁶ rev',
              ],
            ],
            formula: 'C = P × (60 × n × L10h / 10⁶)^(1/p)',
            source: methodSources.life,
          },
        };
      }
      if (tool === 'scenarios') {
        const rows = draft.rows.map((row) => ({
          name: row.label,
          hours: scenarioLife(
            engineeringNumber(row.c),
            engineeringNumber(row.p),
            engineeringNumber(row.n),
            kind,
          ).hours,
          other: 0,
        }));
        const first = rows[0].hours;
        if (
          rows.some(
            (row) =>
              !Number.isFinite(row.hours / first) || row.hours / first <= 0,
          )
        )
          throw new Error('range');
        return {
          value: {
            metrics: [[t('Baseline life', 'عمر سناریوی مبنا'), first, 'h']],
            rows: rows.map((row) => ({ ...row, other: row.hours / first })),
            formula: 'L10h = 10⁶/(60n) × (C/P)^p',
            source: methodSources.life,
          },
        };
      }
      if (tool === 'duty') {
        const result = dutyLife(
          n('c'),
          draft.rows.map((row) => ({
            load: engineeringNumber(row.p),
            rpm: engineeringNumber(row.n),
            share: engineeringNumber(row.share),
          })),
          kind,
        );
        return {
          value: {
            metrics: [
              [t('Combined basic life', 'عمر پایهٔ ترکیبی'), result.hours, 'h'],
              [
                t('Speed-weighted equivalent load', 'بار معادل با وزن‌دهی دور'),
                result.equivalentLoad,
                'kN',
              ],
              [
                t('Time-average speed', 'میانگین زمانی دور'),
                result.meanRpm,
                'rpm',
              ],
            ],
            rows: draft.rows.map((row, index) => ({
              name: row.label,
              hours: scenarioLife(
                n('c'),
                engineeringNumber(row.p),
                engineeringNumber(row.n),
                kind,
              ).hours,
              other: result.damageShares[index] * 100,
            })),
            formula:
              '1/Lh = Σ(fi/Lhi), Σfi = 1; Peq^p = Σ(fi ni Pi^p) / Σ(fi ni)',
            source: methodSources.duty,
          },
        };
      }
      if (tool === 'power') {
        const unknown = v.unknown as PowerUnknown;
        return {
          value: {
            metrics: [
              [
                unknown === 'power'
                  ? t('Mechanical shaft power', 'توان مکانیکی شفت')
                  : unknown === 'rpm'
                    ? t('Shaft speed', 'دور شفت')
                    : t('Shaft torque', 'گشتاور شفت'),
                shaftPower(unknown, n('first'), n('second')),
                unknown === 'power' ? 'kW' : unknown === 'rpm' ? 'rpm' : 'N·m',
              ],
            ],
            formula: 'P [kW] = T [N·m] × 2π × n [rpm] / 60000',
            source: methodSources.power,
          },
        };
      }
      const fit = fitRange(
        n('holeMin'),
        n('holeMax'),
        n('shaftMin'),
        n('shaftMax'),
      );
      return {
        value: {
          metrics: [
            [t('Minimum clearance', 'حداقل لقی'), fit.min, 'µm'],
            [t('Maximum clearance', 'حداکثر لقی'), fit.max, 'µm'],
          ],
          fit,
          formula: 'min = hole min − shaft max; max = hole max − shaft min',
          source: methodSources.life,
        },
      };
    } catch (error) {
      return {
        error:
          error instanceof Error && error.message === 'shares'
            ? t(
                'Positive time shares must total 100%. Stopped stages need a separate static assessment.',
                'سهم‌های زمانی مثبت باید در مجموع ۱۰۰٪ باشند. مرحلهٔ توقف به بررسی استاتیکی جداگانه نیاز دارد.',
              )
            : !['target', 'scenarios', 'duty'].includes(tool)
              ? t(
                  'Complete the positive numeric inputs and check ordered fit limits and numerical range.',
                  'ورودی‌های عددی مثبت را کامل و ترتیب حدود انطباق و بازهٔ عددی را بررسی کنید.',
                )
              : t(
                  'Complete the bearing type and positive numeric inputs. Check limits and numerical range; no result is available yet.',
                  'نوع بیرینگ و ورودی‌های عددی مثبت را کامل کنید. حدود و بازهٔ عددی را بررسی کنید؛ هنوز نتیجه‌ای قابل محاسبه نیست.',
                ),
      };
    }
  }, [draft.rows, needsRecalculation, t, tool, v]);
  const persist = (next: EngineeringCase[]) => {
    try {
      if (storageBlocked) throw new Error('storage');
      if (localStorage.getItem(caseStorageKey) !== storedRaw.current) {
        setMessage(
          t(
            'Another tab changed this notebook. Export current inputs, then reload before saving; existing cases were not overwritten.',
            'دفترچه در تب دیگری تغییر کرده است. ورودی فعلی را دریافت و پیش از ذخیره صفحه را باز کنید؛ پرونده‌های قبلی بازنویسی نشدند.',
          ),
        );
        return false;
      }
      const raw = JSON.stringify({ schema: 1, cases: next });
      parseCaseFile(raw);
      localStorage.setItem(caseStorageKey, raw);
      storedRaw.current = raw;
      setCases(next);
      setMessage(
        t(
          'Saved on this browser and domain only.',
          'فقط در همین مرورگر و دامنه ذخیره شد.',
        ),
      );
      return true;
    } catch {
      setMessage(
        t(
          'Storage unavailable, full or invalid. Your current inputs remain; export a JSON copy instead.',
          'فضای ذخیره‌سازی در دسترس نیست، پر است یا داده معتبر نیست. ورودی‌ها حفظ شده‌اند؛ نسخهٔ JSON دریافت کنید.',
        ),
      );
      return false;
    }
  };
  const newCase = (): EngineeringCase => ({
    id: idForCase(),
    name: name.trim() || t('Untitled case', 'پرونده بدون نام'),
    schema: 1,
    savedAt: new Date().toISOString(),
    method: workbenchMethodVersion,
    tool,
    draft: cloneDraft(draft),
    product: opened
      ? openedProduct
      : product
        ? { id: product.id, revision: calculationRevision(product) }
        : undefined,
  });
  const exportCases = (items: EngineeringCase[]) => {
    const raw = JSON.stringify({ schema: 1, cases: items }, null, 2);
    try {
      parseCaseFile(raw);
      const url = URL.createObjectURL(
        new Blob([raw], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'engineering-cases.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage(t('Export failed validation.', 'اعتبارسنجی خروجی موفق نبود.'));
    }
  };
  const openCase = (item: EngineeringCase) => {
    if (
      dirty &&
      !window.confirm(
        t(
          'This worksheet has unsaved edits. Open the saved case and discard those edits?',
          'این کاربرگ تغییرات ذخیره‌نشده دارد. پروندهٔ ذخیره‌شده باز و تغییرات فعلی کنار گذاشته شوند؟',
        ),
      )
    )
      return;
    setDraft({
      ...cloneDraft(item.draft),
      values: { ...initialWorkbookDraft().values, ...item.draft.values },
    });
    setTool(item.tool);
    setName(item.name);
    setOpened(item);
    setOpenedProduct(item.product);
    const stale = caseStaleness(item, products);
    setNeedsRecalculation(Boolean(stale));
    setMessage(
      stale
        ? t(
            'Method or catalog context changed. Review inputs and explicitly recalculate; saved results are never reused.',
            'روش یا اطلاعات محصول تغییر کرده است. ورودی‌ها را بررسی و محاسبه را دوباره تأیید کنید؛ نتیجهٔ ذخیره‌شده استفاده نمی‌شود.',
          )
        : t(
            'Inputs reopened and calculated using the current method.',
            'ورودی‌ها باز شدند و با روش فعلی محاسبه شدند.',
          ),
    );
  };
  const contactSummary = () =>
    [
      name || t('Engineering case', 'پرونده مهندسی'),
      workbookTools.find((item) => item.id === tool)?.[fa ? 'fa' : 'en'],
      `Method: ${workbenchMethodVersion}`,
      opened?.product
        ? `${t('Saved product context', 'محصول ثبت‌شده')}: ${opened.product.id}`
        : product
          ? `${t('Product context only', 'فقط زمینهٔ محصول')}: ${product.code}`
          : t('Manual inputs', 'ورودی دستی'),
      ...Object.entries(v)
        .filter(([key]) =>
          ({
            target: ['kind', 'p', 'n', 'hours'],
            scenarios: ['kind'],
            duty: ['kind', 'c'],
            power: ['unknown', 'first', 'second'],
            fits: ['holeMin', 'holeMax', 'shaftMin', 'shaftMax'],
            maintenance: ['symptom', 'onset', 'urgent', 'contamination'],
            lubrication: [
              'lubricant',
              'n',
              'temperature',
              'sealing',
              'access',
              'water',
              'manufacturer',
              'interval',
            ],
          })[tool].includes(key),
        )
        .filter(([, value]) => value)
        .map(
          ([key, value]) =>
            `${{ kind: t('Bearing type', 'نوع بیرینگ'), p: 'P / kN', n: 'n / rpm', hours: 'L10h / h', c: 'C / kN', holeMin: t('Hole minimum / mm', 'حداقل سوراخ / mm'), holeMax: t('Hole maximum / mm', 'حداکثر سوراخ / mm'), shaftMin: t('Shaft minimum / mm', 'حداقل شفت / mm'), shaftMax: t('Shaft maximum / mm', 'حداکثر شفت / mm'), unknown: t('Calculated variable', 'متغیر محاسبه‌شده'), first: v.unknown === 'power' ? 'T / N·m' : 'P / kW', second: v.unknown === 'rpm' ? 'T / N·m' : 'n / rpm', symptom: t('Symptom', 'نشانه'), onset: t('Onset', 'زمان شروع'), urgent: t('Emergency signs', 'نشانه‌های اضطراری'), contamination: t('Contamination', 'آلودگی'), lubricant: t('Lubricant', 'روانکار'), temperature: t('Temperature / °C', 'دما / °C'), sealing: t('Sealing', 'آب‌بندی'), access: t('Relubrication permitted', 'مجوز تجدید روانکاری'), water: t('Water/dirt exposure', 'مواجهه با آب/آلودگی'), manufacturer: t('Instruction reference', 'مرجع دستورالعمل'), interval: t('Documented quantity/interval', 'مقدار و فاصلهٔ مستند') }[key] || key}: ${value}`,
        ),
      ...(tool === 'duty' || tool === 'scenarios'
        ? draft.rows.map(
            (row) =>
              `${row.label}: ${tool === 'scenarios' ? `C=${row.c} kN; ` : ''}P=${row.p} kN; n=${row.n} rpm${tool === 'duty' ? `; ${row.share}%` : ''}`,
          )
        : []),
      ...(preview.value?.metrics.map(
        ([label, value, unit]) => `${label}: ${format(value)} ${unit}`,
      ) || []),
      draft.notes,
      t(
        'Manual worksheet; product and method engineering approval pending.',
        'کاربرگ دستی؛ تأیید مهندسی روش و محصول در انتظار بررسی است.',
      ),
    ].join('\n');

  return (
    <section
      className="engineering-workbench"
      aria-label={t('Engineering workbench', 'میز کار مهندسی')}
    >
      <div
        className="workbench-task-list"
        aria-label={t('Choose a task', 'انتخاب مسئله')}
      >
        {workbookTools.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tool === item.id}
            className={tool === item.id ? 'active' : ''}
            onClick={() => setTool(item.id)}
          >
            <strong>{fa ? item.fa : item.en}</strong>
            <span>{item.description[fa ? 1 : 0]}</span>
          </button>
        ))}
      </div>
      <p className="note">
        {t(
          'Independent reference worksheets · 90% reliability for basic life · engineering acceptance pending. Catalog selection is context only; ratings are never silently copied.',
          'کاربرگ‌های مرجع مستقل · عمر پایه با قابلیت اطمینان ۹۰٪ · پذیرش مهندسی در انتظار بررسی است. انتخاب محصول فقط زمینهٔ پرونده است و ظرفیت‌ها خودکار کپی نمی‌شوند.',
        )}
      </p>
      {opened?.product && (
        <p className="note">
          {t('Saved product context', 'محصول ثبت‌شده در پرونده')}:{' '}
          <code>{opened.product.id}</code>{' '}
          {t('(not a product approval)', '(به‌معنی تأیید محصول نیست)')}
        </p>
      )}
      <div className="workbench-columns">
        <section className="panel workbench-inputs">
          <h3>
            {workbookTools.find((item) => item.id === tool)?.[fa ? 'fa' : 'en']}
          </h3>
          <EngineeringInputHint />
          {!['lubrication', 'maintenance'].includes(tool) && (
            <button
              type="button"
              onClick={() => {
                const example = initialWorkbookDraft();
                Object.assign(example.values, {
                  kind: 'ball',
                  p: '10',
                  n: '1000',
                  hours: '1000',
                  c: '100',
                  holeMin: '20',
                  holeMax: '20.01',
                  shaftMin: '20.005',
                  shaftMax: '20.015',
                  first: '7.5',
                  second: '1500',
                });
                example.rows = [
                  { label: 'A', c: '100', p: '10', n: '1000', share: '50' },
                  { label: 'B', c: '100', p: '12', n: '1000', share: '50' },
                ];
                example.notes = t(
                  'Training example with synthetic data; not a catalog product recommendation.',
                  'نمونهٔ آموزشی با دادهٔ فرضی؛ پیشنهاد محصول کاتالوگ نیست.',
                );
                setDraft(example);
                setOpened(undefined);
                setOpenedProduct(undefined);
                setNeedsRecalculation(false);
                setName(t('Training example', 'نمونهٔ آموزشی'));
              }}
            >
              {t('Load a training example', 'بارگذاری نمونهٔ آموزشی')}
            </button>
          )}
          {['target', 'scenarios', 'duty'].includes(tool) && kindPicker()}
          {tool === 'target' && (
            <div className="form-grid">
              {numberField(
                'p',
                t('Verified equivalent load P / kN', 'بار معادل معلوم P / kN'),
              )}
              {numberField('n', t('Speed / rpm', 'دور / rpm'))}
              {numberField(
                'hours',
                t('Target basic life / h', 'عمر پایهٔ هدف / h'),
              )}
            </div>
          )}
          {tool === 'fits' && (
            <>
              <div className="form-grid">
                {numberField(
                  'holeMin',
                  t('Hole minimum / mm', 'حداقل سوراخ / mm'),
                )}
                {numberField(
                  'holeMax',
                  t('Hole maximum / mm', 'حداکثر سوراخ / mm'),
                )}
                {numberField(
                  'shaftMin',
                  t('Shaft minimum / mm', 'حداقل شفت / mm'),
                )}
                {numberField(
                  'shaftMax',
                  t('Shaft maximum / mm', 'حداکثر شفت / mm'),
                )}
              </div>
              <p>
                {t(
                  'Enter measured or manufacturer-specified limits. This does not select H7/k6 or predict operating internal clearance.',
                  'حدود اندازه‌گیری‌شده یا مشخص‌شده را وارد کنید. این ابزار کلاس‌هایی مانند H7/k6 انتخاب نمی‌کند و لقی داخلی کارکرد را پیش‌بینی نمی‌کند.',
                )}
              </p>
            </>
          )}
          {tool === 'power' && (
            <>
              {selectField('unknown', t('Calculate', 'محاسبهٔ'), [
                ['torque', t('Torque / N·m', 'گشتاور / N·m')],
                ['power', t('Shaft power / kW', 'توان شفت / kW')],
                ['rpm', t('Speed / rpm', 'دور / rpm')],
              ])}
              <div className="form-grid">
                {numberField(
                  'first',
                  v.unknown === 'power'
                    ? t('Torque / N·m', 'گشتاور / N·m')
                    : t('Mechanical shaft power / kW', 'توان مکانیکی شفت / kW'),
                )}
                {numberField(
                  'second',
                  v.unknown === 'rpm'
                    ? t('Torque / N·m', 'گشتاور / N·m')
                    : t('Speed / rpm', 'دور / rpm'),
                )}
              </div>
            </>
          )}
          {(tool === 'scenarios' || tool === 'duty') && (
            <>
              {tool === 'duty' &&
                numberField(
                  'c',
                  t(
                    'Verified dynamic rating C / kN',
                    'ظرفیت دینامیکی معلوم C / kN',
                  ),
                )}
              <p>
                {t(
                  'Duplicate a row to keep the same conditions, then change one input. No catalog rating or equivalence is inferred.',
                  'برای حفظ شرایط، یک ردیف را تکثیر و سپس یک ورودی را تغییر دهید. ظرفیت یا قابلیت جایگزینی محصول از کاتالوگ فرض نمی‌شود.',
                )}
              </p>
              {draft.rows.map((row, index) => (
                <fieldset className="workbench-stage" key={index}>
                  <legend>
                    {t('Scenario / stage', 'سناریو / مرحله')} {index + 1}
                  </legend>
                  <label>
                    {t('Label', 'عنوان')}
                    <input
                      value={row.label}
                      maxLength={60}
                      onChange={(e) =>
                        changeRow(index, 'label', e.target.value)
                      }
                    />
                  </label>
                  <div className="form-grid">
                    {(tool === 'scenarios'
                      ? ['c', 'p', 'n']
                      : ['p', 'n', 'share']
                    ).map((key) => (
                      <label key={key}>
                        {
                          {
                            c: 'C / kN',
                            p: 'P / kN',
                            n: 'n / rpm',
                            share: t('Time / %', 'سهم زمان / ٪'),
                          }[key]
                        }
                        <EngineeringNumberInput
                          value={row[key as keyof WorkbookRow]}
                          constraint="positive"
                          onChange={(value) =>
                            changeRow(index, key as keyof WorkbookRow, value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <div className="calculation-actions">
                    <button
                      type="button"
                      disabled={draft.rows.length >= 8}
                      onClick={() =>
                        setDraft((old) => ({
                          ...old,
                          rows: [
                            ...old.rows,
                            { ...row, label: `${row.label.slice(0, 57)} +` },
                          ],
                        }))
                      }
                    >
                      {t('Duplicate', 'تکثیر')}
                    </button>
                    <button
                      type="button"
                      disabled={draft.rows.length <= 1}
                      onClick={() =>
                        setDraft((old) => ({
                          ...old,
                          rows: old.rows.filter((_, at) => at !== index),
                        }))
                      }
                    >
                      {t('Remove stage', 'حذف ردیف')}
                    </button>
                  </div>
                </fieldset>
              ))}
              {tool === 'duty' && (
                <p className="note">
                  {t(
                    'Time shares must total 100%; all stages need positive speed and verified equivalent load. Dwell, shocks, reversals and changing lubrication need a separate assessment.',
                    'مجموع سهم زمان باید ۱۰۰٪ باشد؛ دور و بار معادل هر مرحله مثبت و معلوم باشند. توقف، ضربه، تغییر جهت و تغییر روانکاری نیاز به بررسی جداگانه دارند.',
                  )}
                </p>
              )}
            </>
          )}
          {tool === 'lubrication' && (
            <div className="form-grid">
              <label>
                {t('Lubricant designation', 'نام دقیق روانکار')}
                <input
                  maxLength={200}
                  value={v.lubricant}
                  onChange={(e) => update('lubricant', e.target.value)}
                />
              </label>
              {numberField('n', t('Operating speed / rpm', 'دور کارکرد / rpm'))}
              {numberField(
                'temperature',
                t('Measured temperature / °C', 'دمای اندازه‌گیری‌شده / °C'),
                'any',
              )}
              {selectField('sealing', t('Bearing access', 'وضعیت بیرینگ'), [
                ['unknown', t('Unknown', 'نامشخص')],
                ['sealed', t('Sealed / prefilled', 'آب‌بندی‌شده / پرشده')],
                ['open', t('Open / serviceable', 'باز / قابل سرویس')],
              ])}
              {selectField(
                'access',
                t(
                  'Relubrication permitted by manufacturer?',
                  'تجدید روانکاری طبق سازنده مجاز است؟',
                ),
                yesNo,
              )}
              {selectField(
                'water',
                t(
                  'Water or contamination exposure?',
                  'مواجهه با آب یا آلودگی؟',
                ),
                yesNo,
              )}
              <label>
                {t(
                  'Machine/manufacturer instruction reference',
                  'مرجع دستورالعمل دستگاه یا سازنده',
                )}
                <input
                  maxLength={300}
                  value={v.manufacturer}
                  onChange={(e) => update('manufacturer', e.target.value)}
                />
              </label>
              <label>
                {t(
                  'Documented interval / quantity',
                  'فاصله و مقدار ثبت‌شده در دستورالعمل',
                )}
                <input
                  maxLength={300}
                  value={v.interval}
                  onChange={(e) => update('interval', e.target.value)}
                />
              </label>
            </div>
          )}
          {tool === 'maintenance' && (
            <div className="form-grid">
              {selectField(
                'symptom',
                t('Observed symptom', 'نشانهٔ مشاهده‌شده'),
                maintenancePaths.map((path) => [
                  path.id,
                  path.title[fa ? 1 : 0],
                ]),
              )}
              {selectField(
                'onset',
                t('When did it begin?', 'چه زمانی شروع شد؟'),
                [
                  ['unknown', t('Unknown', 'نامشخص')],
                  [
                    'service',
                    t('After service or installation', 'پس از سرویس یا نصب'),
                  ],
                  [
                    'load',
                    t('After a load/speed change', 'پس از تغییر بار یا دور'),
                  ],
                  [
                    'ongoing',
                    t('Progressive during operation', 'تدریجی حین کار'),
                  ],
                ],
              )}
              {selectField(
                'contamination',
                t('Evidence of water or dirt?', 'شواهد آب یا آلودگی؟'),
                yesNo,
              )}
              {selectField(
                'urgent',
                t(
                  'Rapid worsening, smoke, seizure or machine alarm?',
                  'بدترشدن سریع، دود، گیرپاژ یا هشدار دستگاه؟',
                ),
                yesNo,
              )}
            </div>
          )}
          <label>
            {t('Case notes (local only)', 'یادداشت پرونده (فقط محلی)')}
            <textarea
              rows={3}
              maxLength={1000}
              value={draft.notes}
              onChange={(e) =>
                setDraft((old) => ({ ...old, notes: e.target.value }))
              }
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setDraft(initialWorkbookDraft());
              setOpened(undefined);
              setOpenedProduct(undefined);
              setNeedsRecalculation(false);
              setName('');
            }}
          >
            {t('Clear worksheet', 'پاک کردن کاربرگ')}
          </button>{' '}
          <a className="button" href={`#${uid}-result`}>
            {t('Go to result & next action', 'رفتن به نتیجه و اقدام بعدی')}
          </a>
        </section>
        <section
          className="panel workbench-results"
          id={`${uid}-result`}
          tabIndex={-1}
          aria-label={t('Result and assumptions', 'نتیجه و فرضیات')}
        >
          <h3>{t('Result & next action', 'نتیجه و اقدام بعدی')}</h3>
          {needsRecalculation ? (
            <>
              <p className="note">
                {t(
                  'This saved case uses changed method or product data. Review the inputs before recalculating. Product approval remains separate.',
                  'روش یا دادهٔ محصول این پرونده تغییر کرده است. پیش از محاسبه دوباره ورودی‌ها را بررسی کنید؛ تأیید محصول جداست.',
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setNeedsRecalculation(false);
                  setOpenedProduct(
                    opened?.product &&
                      products.find(
                        (item) =>
                          item.id === opened.product?.id && !item.isArchived,
                      )
                      ? {
                          id: opened.product.id,
                          revision: calculationRevision(
                            products.find(
                              (item) => item.id === opened.product?.id,
                            )!,
                          ),
                        }
                      : undefined,
                  );
                }}
              >
                {t(
                  'Reviewed inputs — recalculate',
                  'ورودی‌ها بررسی شدند — محاسبه دوباره',
                )}
              </button>
            </>
          ) : preview.value ? (
            <>
              <dl className="workbench-metrics">
                {preview.value.metrics.map(([label, value, unit]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>
                      <bdi dir="ltr">
                        {format(value)} {unit}
                      </bdi>
                    </dd>
                  </div>
                ))}
              </dl>
              <code className="workbench-formula" dir="ltr">
                {preview.value.formula}
              </code>
              {preview.value.fit && (
                <>
                  <p>
                    {preview.value.fit.kind === 'clearance'
                      ? t('Clearance fit', 'انطباق لقی')
                      : preview.value.fit.kind === 'interference'
                        ? t('Interference fit', 'انطباق تداخلی')
                        : t('Transition fit', 'انطباق انتقالی')}
                  </p>
                  <FitDiagram values={v} />
                </>
              )}
              {preview.value.rows && (
                <>
                  <div className="workbench-table">
                    <table>
                      <caption>
                        {t('Numeric comparison', 'مقایسهٔ عددی')}
                      </caption>
                      <thead>
                        <tr>
                          <th>{t('Case', 'حالت')}</th>
                          <th>L10h / h</th>
                          <th>
                            {tool === 'duty'
                              ? t(
                                  'Fatigue damage share / %',
                                  'سهم آسیب خستگی / ٪',
                                )
                              : t('Relative to first row', 'نسبت به ردیف اول')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.value.rows.map((row, index) => (
                          <tr key={index}>
                            <th scope="row">{row.name || index + 1}</th>
                            <td>
                              <bdi>{format(row.hours)}</bdi>
                            </td>
                            <td>
                              <bdi>{format(row.other)}</bdi>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="workbench-bars" aria-hidden="true">
                    {preview.value.rows.map((row, index) => (
                      <div key={index}>
                        <span>{row.name || index + 1}</span>
                        <i
                          style={{
                            width: `${Math.max(1, 90 * (row.hours / Math.max(...preview.value!.rows!.map((item) => item.hours))))}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tool === 'scenarios' && (
                <Sensitivity rows={draft.rows} kind={v.kind as BearingKind} />
              )}
              <a href={preview.value.source} target="_blank" rel="noreferrer">
                {t('Method reference', 'مرجع روش')}
              </a>
            </>
          ) : (
            preview.error && <p aria-live="polite">{preview.error}</p>
          )}
          {tool === 'maintenance' && (
            <>
              <p className={v.urgent === 'yes' ? 'error' : 'note'}>
                {v.urgent === 'yes'
                  ? t(
                      'Follow the machine emergency/shutdown procedure. Isolate energy before physical inspection; do not continue to collect a trend on a rapidly failing machine.',
                      'طبق دستورالعمل توقف اضطراری دستگاه عمل کنید. پیش از بازرسی فیزیکی انرژی را ایزوله کنید؛ برای ثبت روند، دستگاهِ با خرابی سریع را روشن نگه ندارید.',
                    )
                  : t(
                      'Observation checklist, not a diagnosis. Inspect safely under the machine procedure; no numerical alarm threshold is inferred.',
                      'چک‌لیست مشاهده است، نه تشخیص قطعی. بازرسی طبق دستورالعمل دستگاه انجام شود؛ آستانهٔ عددی هشدار فرض نمی‌شود.',
                    )}
              </p>
              <ol>
                <li>
                  {
                    maintenancePaths.find((path) => path.id === v.symptom)
                      ?.inspect[fa ? 1 : 0]
                  }
                </li>
                <li>
                  {v.onset === 'service'
                    ? t(
                        'Compare installation records, lubricant identity and assembly clearances with the machine instructions.',
                        'سوابق نصب، هویت روانکار و لقی‌های مونتاژ را با دستورالعمل دستگاه مقایسه کنید.',
                      )
                    : v.onset === 'load'
                      ? t(
                          'Document before/after load and speed; review the operating envelope with an engineer.',
                          'بار و دور قبل و بعد را ثبت کنید و محدودهٔ کارکرد را با مهندس بررسی کنید.',
                        )
                      : t(
                          'Record the first occurrence and trend with operating load and speed.',
                          'اولین مشاهده و روند را همراه با بار و دور کارکرد ثبت کنید.',
                        )}
                </li>
                <li>
                  {v.contamination === 'yes'
                    ? t(
                        'Preserve lubricant evidence and inspect sealing and ingress paths before cleaning.',
                        'پیش از تمیزکاری شواهد روانکار را حفظ و آب‌بندی و مسیر ورود آلودگی را بررسی کنید.',
                      )
                    : t(
                        'Record lubrication, mounting and environmental observations; unknown causes remain open.',
                        'مشاهدات روانکاری، نصب و محیط را ثبت کنید؛ علت نامعلوم را قطعی تلقی نکنید.',
                      )}
                </li>
                <li>
                  {t(
                    'Prepare the case summary, photos and measurements for technical review.',
                    'خلاصهٔ پرونده، تصاویر و اندازه‌گیری‌ها را برای بررسی فنی آماده کنید.',
                  )}
                </li>
              </ol>
              <a href={methodSources.symptoms} target="_blank" rel="noreferrer">
                SKF
              </a>{' '}
              ·{' '}
              <a
                href={methodSources.maintenance}
                target="_blank"
                rel="noreferrer"
              >
                NSK
              </a>
            </>
          )}
          {tool === 'lubrication' && (
            <>
              <p>
                {t(
                  'Record conditions for review. This worksheet does not prescribe a grease, quantity or interval.',
                  'شرایط را برای بررسی ثبت کنید. این کاربرگ نوع گریس، مقدار یا فاصلهٔ سرویس تجویز نمی‌کند.',
                )}
              </p>
              <ul>
                <li>
                  {lubeReview.requiresRelubricationCheck
                    ? t(
                        'Do not assume the bearing can be relubricated; confirm the exact bearing and machine instructions.',
                        'قابلیت تجدید روانکاری را فرض نکنید؛ دستورالعمل همان بیرینگ و دستگاه بررسی شود.',
                      )
                    : t(
                        'Confirm the lubricant specification and compatibility before any relubrication.',
                        'پیش از تجدید روانکاری، مشخصات و سازگاری روانکار تأیید شود.',
                      )}
                </li>
                <li>
                  {v.water === 'yes'
                    ? t(
                        'Review contamination control, sealing and the lubricant condition with the manufacturer.',
                        'کنترل آلودگی، آب‌بندی و وضعیت روانکار با سازنده بررسی شود.',
                      )
                    : t(
                        'Unknown contamination conditions must be resolved before setting a service interval.',
                        'شرایط نامعلوم آلودگی پیش از تعیین فاصلهٔ سرویس روشن شود.',
                      )}
                </li>
                <li>
                  {t('Missing fields', 'موارد ناقص')}:{' '}
                  {lubeReview.missing
                    .map(
                      (key) =>
                        ({
                          lubricant: t('lubricant', 'روانکار'),
                          n: t('speed', 'دور'),
                          temperature: t('temperature', 'دما'),
                          sealing: t('sealing/access type', 'وضعیت آب‌بندی'),
                          access: t(
                            'relubrication permission',
                            'مجوز تجدید روانکاری',
                          ),
                          water: t(
                            'contamination exposure',
                            'مواجهه با آلودگی',
                          ),
                          manufacturer: t(
                            'instruction reference',
                            'مرجع دستورالعمل',
                          ),
                          interval: t(
                            'documented interval/quantity',
                            'فاصله و مقدار مستند',
                          ),
                        })[key],
                    )
                    .join('، ') ||
                    t(
                      'Inputs recorded; specification review is still required.',
                      'ورودی‌ها ثبت شدند؛ بررسی مشخصات همچنان لازم است.',
                    )}
                </li>
              </ul>
              <a href={methodSources.life} target="_blank" rel="noreferrer">
                {t('SKF lubrication reference', 'مرجع روانکاری SKF')}
              </a>
            </>
          )}
          <details className="workbench-assumptions" open>
            <summary>
              {t('Assumptions and validity', 'فرضیات و محدودهٔ اعتبار')}
            </summary>
            <p>
              {tool === 'power'
                ? t(
                    'Mechanical shaft quantities at the same operating point. Electrical input power, efficiency, starting torque, gearbox losses and motor sizing are not calculated.',
                    'کمیت‌های مکانیکی شفت در یک نقطهٔ کارکرد. توان ورودی برق، راندمان، گشتاور راه‌اندازی، تلفات گیربکس و انتخاب موتور محاسبه نمی‌شوند.',
                  )
                : tool === 'fits'
                  ? t(
                      'Entered dimensional limits only, in mm; output in µm. Temperature, deformation and bearing internal clearance are outside this model.',
                      'فقط حدود ابعادی واردشده بر حسب mm؛ خروجی µm است. دما، تغییرشکل و لقی داخلی بیرینگ خارج از مدل‌اند.',
                    )
                  : tool === 'maintenance' || tool === 'lubrication'
                    ? t(
                        'Guided observations only; confirm actions against the machine and exact bearing instructions. This is not a failure diagnosis or lubrication prescription.',
                        'فقط راهنمای ثبت مشاهدات است؛ اقدام‌ها با دستورالعمل همان دستگاه و بیرینگ تطبیق داده شوند. تشخیص قطعی خرابی یا تجویز روانکاری نیست.',
                      )
                    : t(
                        'Basic statistical fatigue life at 90% reliability from known equivalent load; not service life or a guaranteed maintenance interval. Lubrication, contamination, static capacity, minimum load, speed limits and arrangement require separate review. No product suitability approval is issued.',
                        'عمر آماری پایهٔ خستگی با قابلیت اطمینان ۹۰٪ از بار معادل معلوم؛ نه عمر واقعی یا فاصلهٔ تضمینی سرویس. روانکاری، آلودگی، ظرفیت استاتیکی، حداقل بار، حد سرعت و آرایش به بررسی جداگانه نیاز دارند. مناسب بودن محصول تأیید نمی‌شود.',
                      )}
            </p>
            <small>{workbenchMethodVersion}</small>
          </details>
          <label>
            {t(
              'Technical inquiry summary — review before sharing',
              'خلاصهٔ بررسی فنی — پیش از اشتراک بررسی کنید',
            )}
            <textarea readOnly rows={5} value={contactSummary()} />
          </label>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard
                ?.writeText(contactSummary())
                .then(() => setMessage(t('Summary copied.', 'خلاصه کپی شد.')))
                .catch(() =>
                  setMessage(
                    t(
                      'Select and copy the summary text.',
                      'متن خلاصه را انتخاب و کپی کنید.',
                    ),
                  ),
                );
            }}
          >
            {t('Copy summary', 'کپی خلاصه')}
          </button>{' '}
          <a href="/#contact">{t('Technical contact', 'ارتباط فنی')}</a>
        </section>
      </div>
      <section
        className="panel workbench-notebook"
        aria-label={t('Local case notebook', 'دفترچهٔ محلی پرونده‌ها')}
      >
        <h3>{t('Local case notebook', 'دفترچهٔ محلی پرونده‌ها')}</h3>
        <p>
          {t(
            'Stored only in this browser, separately on each domain. Export JSON to transfer a case. No automatic server upload; avoid confidential machine details in shared files.',
            'فقط در همین مرورگر و به‌صورت جداگانه روی هر دامنه ذخیره می‌شود. برای انتقال، JSON دریافت کنید. ارسال خودکار به سرور ندارد؛ در فایل اشتراکی اطلاعات محرمانهٔ دستگاه ننویسید.',
          )}
        </p>
        <label>
          {t('Case name', 'نام پرونده')}
          <input
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="calculation-actions">
          <button
            type="button"
            disabled={
              cases.length >= 20 || needsRecalculation || storageBlocked
            }
            onClick={() => {
              const item = newCase();
              if (persist([...cases, item])) {
                setOpened(item);
                setOpenedProduct(item.product);
                setName(item.name);
              }
            }}
          >
            {t('Save new case', 'ذخیرهٔ پروندهٔ جدید')}
          </button>
          {opened && (
            <button
              type="button"
              disabled={needsRecalculation || storageBlocked}
              onClick={() => {
                const edited = { ...newCase(), id: opened.id };
                if (
                  persist(
                    cases.map((item) =>
                      item.id === opened.id ? edited : item,
                    ),
                  )
                )
                  setOpened(edited);
              }}
            >
              {t('Update opened case', 'به‌روزرسانی پروندهٔ باز')}
            </button>
          )}
          <button
            type="button"
            disabled={needsRecalculation}
            onClick={() => exportCases([newCase()])}
          >
            {t('Export current inputs', 'دریافت ورودی‌های فعلی')}
          </button>
          <button
            type="button"
            disabled={!cases.length}
            onClick={() => exportCases(cases)}
          >
            {t('Export notebook', 'دریافت دفترچه')}
          </button>
          <button type="button" onClick={() => importInput.current?.click()}>
            {t('Import JSON', 'ورود JSON')}
          </button>
        </div>
        <p className="note">
          {dirty
            ? t(
                'Current edits are not saved yet. Save a new case or update the opened case.',
                'تغییرات فعلی هنوز ذخیره نشده‌اند. پروندهٔ جدید ذخیره کنید یا پروندهٔ باز را به‌روزرسانی کنید.',
              )
            : opened
              ? t(
                  'Current worksheet matches the saved snapshot.',
                  'کاربرگ فعلی با نسخهٔ ذخیره‌شده یکسان است.',
                )
              : t(
                  'Save a case to keep this worksheet.',
                  'برای نگهداری این کاربرگ، یک پرونده ذخیره کنید.',
                )}
        </p>
        <input
          ref={importInput}
          type="file"
          accept=".json,application/json"
          aria-label={t('Import case file', 'ورود فایل پرونده')}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            if (file.size > 250000) {
              setMessage(
                t(
                  'File exceeds 250 KB.',
                  'حجم فایل بیشتر از ۲۵۰ کیلوبایت است.',
                ),
              );
              return;
            }
            void file
              .text()
              .then((raw) => {
                const incoming = parseCaseFile(raw);
                const next = [
                  ...cases,
                  ...incoming.map((item) => ({ ...item, id: idForCase() })),
                ];
                if (next.length > 20) throw new Error('count');
                persist(next);
              })
              .catch(() =>
                setMessage(
                  t(
                    'Invalid, unsupported or oversized case file; nothing was imported.',
                    'فایل نامعتبر، پشتیبانی‌نشده یا بزرگ است؛ چیزی وارد نشد.',
                  ),
                ),
              );
          }}
        />
        <p aria-live="polite">{message}</p>
        <ul className="workbench-case-list">
          {cases.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>
                  {
                    workbookTools.find((entry) => entry.id === item.tool)?.[
                      fa ? 'fa' : 'en'
                    ]
                  }{' '}
                  ·{' '}
                  {new Date(item.savedAt).toLocaleDateString(
                    fa ? 'fa-IR' : 'en-US',
                  )}
                  {caseStatuses.get(item.id)
                    ? t(' · needs recalculation', ' · نیازمند محاسبه دوباره')
                    : ''}
                </small>
              </div>
              <div className="calculation-actions">
                <button type="button" onClick={() => openCase(item)}>
                  {t('Open', 'باز کردن')}
                </button>
                <button
                  type="button"
                  disabled={cases.length >= 20}
                  onClick={() =>
                    persist([
                      ...cases,
                      {
                        ...item,
                        draft: cloneDraft(item.draft),
                        id: idForCase(),
                        name: `${item.name.slice(0, 68)} ${t('copy', 'کپی')}`,
                        savedAt: new Date().toISOString(),
                      },
                    ])
                  }
                >
                  {t('Duplicate', 'تکثیر')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      persist(cases.filter((entry) => entry.id !== item.id)) &&
                      opened?.id === item.id
                    ) {
                      setOpened(undefined);
                      setOpenedProduct(undefined);
                      setMessage(
                        t(
                          'Local snapshot deleted; current worksheet inputs were kept.',
                          'نسخهٔ محلی حذف شد؛ ورودی‌های کاربرگ فعلی حفظ شدند.',
                        ),
                      );
                    }
                  }}
                >
                  {t('Delete local case', 'حذف پروندهٔ محلی')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function Sensitivity({
  rows,
  kind,
}: {
  rows: WorkbookRow[];
  kind: BearingKind;
}) {
  const { fa, t } = usePlatform();
  const first = rows[0];
  return (
    <details>
      <summary>
        {t(
          'Load sensitivity of the first scenario',
          'حساسیت سناریوی اول به تغییر بار',
        )}
      </summary>
      <p>
        {t(
          'Capacity and speed held constant; the equivalent load scales directly. These are not independently solved radial/axial load cases.',
          'ظرفیت و دور ثابت‌اند و بار معادل تغییر می‌کند. این حالت‌ها حل مستقل بار شعاعی و محوری نیستند.',
        )}
      </p>
      <ul>
        {[0.8, 1, 1.2].map((factor) => {
          let displayed = t('Outside numerical range', 'خارج از بازهٔ عددی');
          try {
            displayed =
              formatEngineeringNumber(
                scenarioLife(
                  engineeringNumber(first.c),
                  engineeringNumber(first.p) * factor,
                  engineeringNumber(first.n),
                  kind,
                ).hours,
                fa,
              ) + ' h';
          } catch {
            /* A sensitivity point can overflow even when its baseline is valid. */
          }
          return (
            <li key={factor}>
              <bdi>P × {factor}</bdi>: <bdi>{displayed}</bdi>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
function FitDiagram({ values }: { values: Record<string, string> }) {
  const { fa, t } = usePlatform();
  const limits = ['holeMin', 'holeMax', 'shaftMin', 'shaftMax'].map((key) =>
    engineeringNumber(values[key]),
  );
  const min = Math.min(...limits),
    span = Math.max(...limits) - min;
  const x = (value: number) => 35 + (span ? (value - min) / span : 0.5) * 330;
  return (
    <figure className="workbench-fit">
      <svg
        viewBox="0 0 400 135"

        aria-label={t(
          'Hole and shaft diameter ranges on the same scale',
          'بازهٔ قطر سوراخ و شفت روی مقیاس یکسان',
        )}
      >
        <line x1="30" y1="110" x2="370" y2="110" stroke="currentColor" />
        <rect
          x={x(limits[0])}
          y="25"
          width={Math.max(2, x(limits[1]) - x(limits[0]))}
          height="20"
          fill="#8bd7ff"
        />
        <rect
          x={x(limits[2])}
          y="65"
          width={Math.max(2, x(limits[3]) - x(limits[2]))}
          height="20"
          fill="#d8b77b"
        />
      </svg>
      <figcaption>
        {t(
          'Blue: hole · gold: shaft. Absolute diameter / mm; schematic, not a manufacturing drawing.',
          'آبی: سوراخ · طلایی: شفت. قطر مطلق / mm؛ نمودار شماتیک است، نه نقشهٔ ساخت.',
        )}
        <br />
        <bdi>
          {limits
            .map((value) => formatEngineeringNumber(value, fa))
            .join(' / ')}{' '}
          mm
        </bdi>
      </figcaption>
    </figure>
  );
}

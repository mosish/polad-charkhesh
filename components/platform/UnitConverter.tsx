import { useState } from 'react';
import { usePlatform } from './Context';
import EngineeringNumberInput, { EngineeringInputHint } from './EngineeringNumberInput';
import { parseEngineeringNumber, formatEngineeringNumber } from '../../lib/engineering-input';
import { unitQuantities, convertEngineeringUnit } from '../../lib/engineering-units';

export default function UnitConverter() {
  const { t, fa } = usePlatform();
  const [quantityId, setQuantityId] = useState('length');
  const [drafts, setDrafts] = useState<Record<string, { raw: string; from: string; to: string }>>({});
  const quantity = unitQuantities.find(item => item.id === quantityId)!;
  const draft = drafts[quantityId] ?? { raw: '', from: quantity.units[0].id, to: quantity.units[1].id };
  const update = (change: Partial<typeof draft>) => setDrafts(old => ({ ...old, [quantityId]: { ...draft, ...change } }));
  const parsed = parseEngineeringNumber(draft.raw);
  const result = parsed.kind === 'valid' ? convertEngineeringUnit(parsed.value, quantityId, draft.from, draft.to) : undefined;
  const unitLabel = (unit: typeof quantity.units[number]) => unit.id === 'hp' ? t('hp (mechanical)', 'hp (مکانیکی)') : unit.symbol;
  return <section className="panel unit-converter">
    <div className="section-label">{t('UNIT CONVERTER', 'تبدیل واحد')}</div>
    <h3>{t('Convert a known quantity.', 'تبدیل یک کمیت معلوم.')}</h3>
    <label>{t('Quantity', 'کمیت')}<select value={quantityId} onChange={e => setQuantityId(e.target.value)}>
      {unitQuantities.map(item => <option key={item.id} value={item.id}>{fa ? item.fa : item.en}</option>)}
    </select></label>
    <EngineeringInputHint />
    <div className="form-grid">
      <label>{t('From unit', 'واحد مبدأ')}<select dir="ltr" value={draft.from} onChange={e => update({ from: e.target.value })}>
        {quantity.units.map(unit => <option key={unit.id} value={unit.id}>{unitLabel(unit)}</option>)}
      </select></label>
      <label>{t('To unit', 'واحد مقصد')}<select dir="ltr" value={draft.to} onChange={e => update({ to: e.target.value })}>
        {quantity.units.map(unit => <option key={unit.id} value={unit.id}>{unitLabel(unit)}</option>)}
      </select></label>
    </div>
    <label>{t('Value', 'مقدار')} <bdi>{quantity.units.find(unit => unit.id === draft.from)?.symbol}</bdi>
      <EngineeringNumberInput value={draft.raw} onChange={raw => update({ raw })} />
    </label>
    <div className="calculation-actions">
      <button type="button" className="button" onClick={() => update({ from: draft.to, to: draft.from,
        raw: result?.kind === 'valid' ? String(result.value) : draft.raw })}>{t('Swap units', 'جابه‌جایی واحدها')}</button>
      <button type="button" className="button" onClick={() => update({ raw: '' })}>{t('Clear value', 'پاک کردن مقدار')}</button>
    </div>
    <div aria-live="polite" aria-atomic="true">
      {result?.kind === 'valid' ? <output className="result-number" dir="ltr">
        {formatEngineeringNumber(result.value, fa)} <small>{quantity.units.find(unit => unit.id === draft.to)?.symbol}</small>
      </output> : <p className={parsed.kind === 'blank' ? 'note' : 'error'}>{parsed.kind === 'blank'
        ? t('Enter a value to see the conversion.', 'برای مشاهدهٔ تبدیل، مقدار را وارد کنید.')
        : result?.kind === 'invalid' && result.reason === 'absolute-zero'
          ? t('Temperature cannot be below absolute zero.', 'دما نمی‌تواند کمتر از صفر مطلق باشد.')
          : t('Check the number and its supported range.', 'عدد و محدودهٔ پشتیبانی‌شدهٔ آن را بررسی کنید.')}</p>}
    </div>
    <p className="note">{quantityId === 'temperature' ? t('Absolute temperature uses an offset. For a rise or drop, select Temperature difference.', 'دمای مطلق دارای جابه‌جایی مبدأ است. برای افزایش یا کاهش دما، اختلاف دما را انتخاب کنید.')
      : quantityId === 'temperature-difference' ? t('Temperature differences use scale only: 1 Δ°C = 1 ΔK = 1.8 Δ°F.', 'اختلاف دما فقط با ضریب مقیاس تبدیل می‌شود: ۱ Δ°C = ۱ ΔK = ۱٫۸ Δ°F.')
        : quantityId === 'force' ? t('Force units only. Kilograms measure mass and cannot be converted to force without an acceleration.', 'این واحدها برای نیرو هستند. کیلوگرم واحد جرم است و بدون شتاب نمی‌توان آن را به نیرو تبدیل کرد.')
          : quantityId === 'power' ? t('hp means mechanical horsepower (550 ft·lbf/s), not metric horsepower.', 'hp به معنی اسب بخار مکانیکی (۵۵۰ ft·lbf/s) است و با اسب بخار متریک تفاوت دارد.')
            : t('Signed values are allowed. A unit conversion does not validate an operating condition.', 'مقادیر علامت‌دار مجازند. تبدیل واحد به‌معنی تأیید شرایط کار نیست.')}</p>
    <p className="note">{t('Results show up to 12 significant digits; calculations retain full numeric precision. Drafts stay while switching tools or languages on this page. Reloading clears them.', 'نتیجه حداکثر با ۱۲ رقم معنادار نمایش داده می‌شود؛ محاسبه با دقت کامل عددی انجام می‌شود. ورودی‌ها هنگام تغییر ابزار یا زبان در این صفحه حفظ می‌شوند؛ بارگذاری دوباره آنها را پاک می‌کند.')}</p>
    <a className="text-link" href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9" target="_blank" rel="noreferrer">{t('NIST · Conversion reference', 'NIST · مرجع تبدیل واحد')} ↗</a>
  </section>;
}

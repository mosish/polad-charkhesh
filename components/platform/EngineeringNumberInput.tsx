import { useId } from 'react';
import { usePlatform } from './Context';
import { parseEngineeringNumber, type NumberConstraint } from '../../lib/engineering-input';

export function EngineeringInputHint() {
  const { t } = usePlatform();
  return <p className="note">{t('Use Latin, Persian or Arabic digits, a decimal point (. or ٫), and an optional sign or e exponent. Do not use grouping separators.', 'ارقام فارسی، عربی یا لاتین، ممیز . یا ٫ و در صورت نیاز علامت یا توان e را وارد کنید. از جداکنندهٔ هزارگان استفاده نکنید.')}</p>;
}
export default function EngineeringNumberInput({ value, onChange, constraint = 'any', inputId }: {
  value: string; onChange: (value: string) => void; constraint?: NumberConstraint; inputId?: string;
}) {
  const { t } = usePlatform(), id = useId();
  const state = parseEngineeringNumber(value, constraint);
  const message = state.kind !== 'invalid' ? '' : state.reason === 'positive'
    ? t('Enter a value greater than zero.', 'مقدار بزرگ‌تر از صفر وارد کنید.') : state.reason === 'nonnegative'
      ? t('Enter zero or a positive value.', 'صفر یا مقدار مثبت وارد کنید.') : state.reason === 'range'
        ? t('This number is outside the supported range.', 'این عدد خارج از محدودهٔ پشتیبانی‌شده است.')
        : t('Enter a number without grouping separators or unit text.', 'عدد را بدون جداکنندهٔ هزارگان یا متن واحد وارد کنید.');
  return <>
    <input id={inputId} type="text" inputMode="decimal" dir="ltr" autoComplete="off" spellCheck={false}
      value={value} onChange={event => onChange(event.target.value)} aria-invalid={state.kind === 'invalid'} aria-describedby={message ? id : undefined} />
    {message && <small id={id} className="error">{message}</small>}
  </>;
}

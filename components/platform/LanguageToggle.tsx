import { useId } from 'react';
import { usePlatform } from './Context';

export default function LanguageToggle({ onSelect }: { onSelect?: () => void }) {
  const { fa, t, toggle } = usePlatform();
  const name = useId();
  return <fieldset className="language-toggle" aria-label={t('Site language', 'زبان سایت')} dir="ltr" data-language={fa ? 'fa' : 'en'}>
    <span className="language-scene" aria-hidden="true">
      <svg viewBox="0 0 100 44" fill="none" stroke="currentColor" strokeWidth=".7">
        <circle cx="50" cy="22" r="31" /><ellipse cx="50" cy="22" rx="16" ry="31" />
        <path d="M19 22h62M24 8q26 12 52 0M24 36q26-12 52 0M50-9v62" />
      </svg>
      <span className="language-thumb" />
    </span>
    {(['fa', 'en'] as const).map(language => <label className="language-choice" key={language} title={language === 'fa' ? 'فارسی' : 'English'}>
      <input type="radio" name={name} value={language} checked={fa === (language === 'fa')} aria-label={language === 'fa' ? 'فارسی' : 'English'} onChange={() => { onSelect?.(); toggle(); }} />
      <span>{language === 'fa' ? 'FA' : 'EN'}</span>
    </label>)}
  </fieldset>;
}

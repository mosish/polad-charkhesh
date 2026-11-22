import { useEffect, useId, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { usePlatform } from './Context';

type ThemePreference = 'auto' | 'light' | 'dark';
declare global {
  interface Window {
    poladTheme?: { setPreference(value: ThemePreference): void; refresh(): void };
  }
}
const readTheme = () => (document.documentElement.dataset.themeMode || 'auto') as ThemePreference;
export default function ThemeToggle() {
  const { t } = usePlatform();
  const name = useId();
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    const changed = () => setTheme(readTheme());
    window.addEventListener('polad-theme-change', changed);
    window.poladTheme?.refresh();
    changed();
    return () => window.removeEventListener('polad-theme-change', changed);
  }, []);
  const choices = [
    { value: 'dark', label: t('Dark mode', 'حالت تیره'), content: <Moon size={18} aria-hidden="true" /> },
    { value: 'auto', label: t('Automatic', 'خودکار'), content: t('Auto', 'خودکار') },
    { value: 'light', label: t('Light mode', 'حالت روشن'), content: <Sun size={18} aria-hidden="true" /> },
  ] as const;
  return <fieldset className="theme-toggle" aria-label={t('Color theme', 'حالت نمایش')} dir="ltr" data-mode={theme}>
    <span className="theme-thumb" aria-hidden="true" />
    {choices.map(choice => <label className="theme-choice" key={choice.value} title={choice.label}>
      <input type="radio" name={name} value={choice.value} checked={theme === choice.value} aria-label={choice.label} onChange={() => window.poladTheme?.setPreference(choice.value)} />
      <span className="theme-choice-content">{choice.content}</span>
    </label>)}
  </fieldset>;
}

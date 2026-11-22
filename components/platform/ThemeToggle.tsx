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
    <span className="theme-scene" aria-hidden="true">
      <svg className="theme-stars" viewBox="0 0 150 44" fill="currentColor">
        <path d="m18 9 1 2 2 1-2 1-1 2-1-2-2-1 2-1Zm91 17 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5ZM77 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
        <circle cx="40" cy="25" r=".9" /><circle cx="92" cy="15" r=".8" /><circle cx="129" cy="9" r="1" /><circle cx="63" cy="36" r=".7" /><circle cx="139" cy="35" r=".8" />
      </svg>
      <svg className="theme-clouds theme-clouds-back" viewBox="0 0 150 44" fill="currentColor">
        <path d="M-10 44V33Q-1 20 10 30Q20 15 33 28Q47 22 51 35Q62 31 67 44ZM84 44Q85 29 98 32Q100 20 113 24Q125 11 135 25Q147 19 159 30V44Z" />
      </svg>
      <svg className="theme-clouds theme-clouds-front" viewBox="0 0 150 44" fill="currentColor">
        <path d="M-10 44V39Q0 29 12 38Q22 27 34 38Q45 32 53 44ZM96 44Q98 35 109 38Q116 26 128 36Q143 26 159 37V44Z" />
      </svg>
      <span className="theme-thumb"><span className="theme-orb"><i /><i /><i /></span></span>
    </span>
    {choices.map(choice => <label className="theme-choice" key={choice.value} title={choice.label}>
      <input type="radio" name={name} value={choice.value} checked={theme === choice.value} aria-label={choice.label} onChange={() => window.poladTheme?.setPreference(choice.value)} />
      <span className="theme-choice-content">{choice.content}</span>
    </label>)}
  </fieldset>;
}

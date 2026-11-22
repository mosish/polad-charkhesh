import { useEffect, useState } from 'react';
import { Clock3, Moon, Sun } from 'lucide-react';
import { usePlatform } from './Context';

type ThemePreference = 'auto' | 'light' | 'dark';
declare global {
  interface Window {
    poladTheme?: { setPreference(value: ThemePreference): void; refresh(): void };
  }
}
const readTheme = () => ({
  preference: (document.documentElement.dataset.themeMode || 'auto') as ThemePreference,
  light: document.documentElement.dataset.theme === 'light',
});
export default function ThemeToggle() {
  const { t } = usePlatform();
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    const changed = () => setTheme(readTheme());
    window.addEventListener('polad-theme-change', changed);
    window.poladTheme?.refresh();
    changed();
    return () => window.removeEventListener('polad-theme-change', changed);
  }, []);
  const automatic = t('Automatic · local time (07:00–19:00 light)', 'خودکار · ساعت دستگاه (۷ تا ۱۹ روشن)');
  return <div className="theme-toggle theme-control" title={theme.preference === 'auto' ? automatic : t(theme.light ? 'Light mode' : 'Dark mode', theme.light ? 'حالت روشن' : 'حالت تیره')}>
    {theme.light ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    {theme.preference === 'auto' && <Clock3 className="theme-auto-mark" size={10} aria-hidden="true" />}
    <select aria-label={t('Color theme', 'حالت نمایش')} value={theme.preference} onChange={event => window.poladTheme?.setPreference(event.target.value as ThemePreference)}>
      <option value="auto">{automatic}</option>
      <option value="light">{t('Light mode', 'حالت روشن')}</option>
      <option value="dark">{t('Dark mode', 'حالت تیره')}</option>
    </select>
  </div>;
}

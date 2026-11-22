import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { usePlatform } from './Context';

export default function ThemeToggle() {
  const { t } = usePlatform();
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light');
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== 'pc-theme' && event.key !== null) return;
      const next = event.newValue === 'light';
      document.documentElement.dataset.theme = next ? 'light' : 'dark';
      setLight(next);
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  const label = light ? t('Switch to dark mode', 'تغییر به حالت تیره') : t('Switch to light mode', 'تغییر به حالت روشن');
  return <button type="button" className="theme-toggle" aria-label={label} title={label} aria-pressed={light} onClick={() => {
    const next = !light;
    document.documentElement.dataset.theme = next ? 'light' : 'dark';
    setLight(next);
    try { localStorage.setItem('pc-theme', next ? 'light' : 'dark'); } catch { /* Still works for this visit. */ }
  }}>{light ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}</button>;
}

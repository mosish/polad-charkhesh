import { usePlatform } from '../platform/Context';
import ThemeToggle from '../platform/ThemeToggle';
import LanguageToggle from '../platform/LanguageToggle';

export default function AdminAppearance() {
  const { t } = usePlatform();
  return <header className="admin-appearance-bar">
    <span>{t('Administration', 'مدیریت سامانه')}</span>
    <div className="admin-appearance-controls">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  </header>;
}

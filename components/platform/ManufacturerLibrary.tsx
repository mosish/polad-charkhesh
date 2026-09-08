import { manufacturerResources } from '../../lib/manufacturer-resources';
import { usePlatform } from './Context';
export default function ManufacturerLibrary({ brands }: { brands?: string[] }) {
  const { t } = usePlatform();
  const resources = brands
    ? manufacturerResources.filter((r) =>
        brands.some((b) => b.toLowerCase().includes(r.brand.toLowerCase())),
      )
    : manufacturerResources;
  if (!resources.length) return null;
  return (
    <details className="manufacturer-library">
      <summary>
        {t('Official manufacturer references', 'مراجع رسمی سازندگان')}
      </summary>
      <p>
        {t(
          'Reference catalogs cover product families. Confirm the exact designation and suffix in the original document. These links do not mean every record has been independently verified.',
          'کاتالوگ‌های مرجع خانواده محصولات را پوشش می‌دهند. کد و پسوند دقیق را در سند اصلی بررسی کنید. این پیوندها به معنی تأیید مستقل تمام رکوردها نیستند.',
        )}
      </p>
      <div className="resource-grid">
        {resources.map((r) => (
          <a key={r.brand} href={r.url} target="_blank" rel="noreferrer">
            <strong>{r.brand} ↗</strong>
            <span>{t(r.label, r.label)}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

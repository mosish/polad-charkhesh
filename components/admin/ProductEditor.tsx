import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { usePlatform } from '../platform/Context';
import Dialog from '../platform/Dialog';
import MediaPicker from './MediaPicker';
const groups: any = {
  Identity: [
    'code',
    'slug',
    'category',
    'schematicType',
    'nameEn',
    'nameFa',
    'descriptionEn',
    'descriptionFa',
    'featured',
    'inStock',
  ],
  Dimensions: ['d', 'D', 'B', 'weightKg', 'rMin'],
  Loads: ['crKn', 'corKn'],
  Speed: [
    'speedGreaseRpm',
    'speedOilRpm',
    'thermalSpeedRatingRpm',
    'speedReferenceType',
  ],
  Factors: [
    'calculationFactorE',
    'calculationFactorX',
    'calculationFactorY',
    'calculationFactorY0',
    'calculationFactorY1',
    'calculationFactorY2',
    'calculationFactorF0',
    'contactAngle',
  ],
  Details: [
    'cageMaterialEn',
    'cageMaterialFa',
    'sealingEn',
    'sealingFa',
    'clearanceOptions',
  ],
  Applications: ['applicationsEn', 'applicationsFa', 'industryIds', 'brands'],
  Media: ['imageUrl', 'images', 'pdfUrl'],
  Sources: ['technicalSources'],
  SEO: [
    'metaTitleEn',
    'metaTitleFa',
    'metaDescriptionEn',
    'metaDescriptionFa',
    'keywords',
  ],
};
const faGroups: any = {
  Identity: 'هویت',
  Dimensions: 'ابعاد',
  Loads: 'بار',
  Speed: 'سرعت',
  Factors: 'ضرایب',
  Details: 'جزئیات',
  Applications: 'کاربردها',
  Media: 'رسانه',
  Sources: 'منابع',
  SEO: 'سئو',
};
const numeric = new Set([
  'd',
  'D',
  'B',
  'weightKg',
  'rMin',
  'crKn',
  'corKn',
  'speedGreaseRpm',
  'speedOilRpm',
  'thermalSpeedRatingRpm',
  ...groups.Factors.filter((s: string) => s !== 'contactAngle'),
]);
const arrays = new Set([
  'clearanceOptions',
  'applicationsEn',
  'applicationsFa',
  'industryIds',
  'brands',
  'images',
  'keywords',
]);
const blank = {
  code: '',
  slug: '',
  nameEn: '',
  nameFa: '',
  category: 'ball',
  schematicType: 'deep-groove',
  descriptionEn: '',
  descriptionFa: '',
  d: 0,
  D: 0,
  B: 0,
  weightKg: 0,
  crKn: 0,
  corKn: 0,
  speedGreaseRpm: 0,
  speedOilRpm: 0,
  cageMaterialEn: '',
  cageMaterialFa: '',
  sealingEn: '',
  sealingFa: '',
  clearanceOptions: [],
  applicationsEn: [],
  applicationsFa: [],
  brands: [],
  technicalSources: [],
  inStock: false,
  featured: false,
};
export default function ProductEditor({
  product,
  onClose,
  onSaved,
}: {
  product: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { fa, t } = usePlatform();
  const [p, setP] = useState<any>(product || blank),
    [tab, setTab] = useState('Identity'),
    [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [sources, setSources] = useState(
    JSON.stringify(p.technicalSources || [], null, 2),
  );
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);
  const update = (k: string, v: any) => {
    setDirty(true);
    setP({ ...p, [k]: v });
  };
  const save = async () => {
    setBusy(true);
    try {
      const data = { ...p, technicalSources: JSON.parse(sources) };
      await api(
        '/products' + (product ? '/' + product.id : ''),
        product ? 'PUT' : 'POST',
        data,
      );
      setDirty(false);
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      title={product ? p.code : t('New component', 'قطعه جدید')}
      onClose={() => (dirty ? setDiscard(true) : onClose())}
    >
      <div className="editor-tabs">
        {Object.keys(groups).map((k) => (
          <button
            key={k}
            className={tab === k ? 'active' : ''}
            onClick={() => setTab(k)}
          >
            {fa ? faGroups[k] : k}
          </button>
        ))}
      </div>
      <div className="form-grid editor-fields">
        {groups[tab].map((k: string) =>
          ['imageUrl', 'pdfUrl'].includes(k) ? (
            <MediaPicker
              key={k}
              label={
                k === 'imageUrl'
                  ? t('Product image', 'تصویر محصول')
                  : t('Product PDF', 'فایل PDF محصول')
              }
              pdf={k === 'pdfUrl'}
              value={p[k] || ''}
              onChange={(url) => update(k, url)}
            />
          ) : k === 'images' ? (
            <div key={k}>
              <MediaPicker
                label={t('Add a gallery image', 'افزودن تصویر گالری')}
                value=""
                onChange={(url) => {
                  if (url) update(k, [...new Set([...(p.images || []), url])]);
                }}
              />
              <label>
                {t(
                  'Gallery image URLs (one per line)',
                  'نشانی تصاویر گالری (هر خط یک نشانی)',
                )}
                <textarea
                  rows={4}
                  value={(p.images || []).join('\n')}
                  onChange={(e) =>
                    update(k, e.target.value.split('\n').filter(Boolean))
                  }
                />
              </label>
            </div>
          ) : (
            <label key={k}>
              {k}
              {k === 'category' ||
              k === 'schematicType' ||
              k === 'speedReferenceType' ? (
                <select
                  value={p[k] || ''}
                  onChange={(e) => update(k, e.target.value)}
                >
                  {(k === 'category'
                    ? [
                        'ball',
                        'roller',
                        'spherical',
                        'cylindrical',
                        'thrust',
                        'housing',
                        'seal',
                        'lubricant',
                      ]
                    : k === 'speedReferenceType'
                      ? ['limiting', 'thermal', 'both']
                      : [
                          'deep-groove',
                          'angular-contact',
                          'self-aligning-ball',
                          'tapered',
                          'spherical',
                          'cylindrical',
                          'needle',
                          'carb',
                          'thrust',
                          'spherical-thrust',
                          'pillow-block',
                          'oil-seal',
                        ]
                  ).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ) : k === 'technicalSources' ? (
                <>
                  <textarea
                    className="source-editor"
                    rows={14}
                    value={sources}
                    onChange={(e) => {
                      setSources(e.target.value);
                      setDirty(true);
                    }}
                  />
                  <small>
                    {t(
                      'JSON array. Each source requires manufacturer and reference. Record URLs, verification status and notes without inventing verification.',
                      'آرایه JSON؛ هر منبع به سازنده و مرجع نیاز دارد. تاریخ تأیید را بدون مستندات ثبت نکنید.',
                    )}
                  </small>
                </>
              ) : ['featured', 'inStock'].includes(k) ? (
                <input
                  type="checkbox"
                  checked={!!p[k]}
                  onChange={(e) => update(k, e.target.checked)}
                />
              ) : arrays.has(k) ? (
                <textarea
                  rows={3}
                  value={(p[k] || []).join('\n')}
                  onChange={(e) =>
                    update(k, e.target.value.split('\n').filter(Boolean))
                  }
                />
              ) : k.startsWith('description') ? (
                <textarea
                  rows={4}
                  value={p[k] || ''}
                  onChange={(e) => update(k, e.target.value)}
                />
              ) : (
                <input
                  type={numeric.has(k) ? 'number' : 'text'}
                  step="any"
                  value={p[k] ?? ''}
                  dir={k.endsWith('Fa') ? 'rtl' : 'ltr'}
                  onChange={(e) =>
                    update(
                      k,
                      numeric.has(k)
                        ? e.target.value === ''
                          ? undefined
                          : Number(e.target.value)
                        : e.target.value,
                    )
                  }
                />
              )}
            </label>
          ),
        )}
      </div>
      {product && (
        <p className="muted">
          {t('Last updated', 'آخرین ویرایش')}: {product.updatedAt || '—'} ·{' '}
          {product.updatedBy || '—'}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="sticky-save">
        <button className="button primary" disabled={busy} onClick={save}>
          {t(
            busy ? 'Saving…' : 'Save component',
            busy ? 'در حال ذخیره…' : 'ذخیره قطعه',
          )}
        </button>
        <button
          className="button"
          onClick={() => (dirty ? setDiscard(true) : onClose())}
        >
          {t('Cancel', 'انصراف')}
        </button>
      </div>
      {discard && (
        <div className="discard-panel" role="alert">
          <strong>
            {t(
              'Discard unsaved changes?',
              'تغییرات ذخیره‌نشده کنار گذاشته شوند؟',
            )}
          </strong>
          <button className="button danger" onClick={onClose}>
            {t('Discard changes', 'کنار گذاشتن تغییرات')}
          </button>
          <button className="button" onClick={() => setDiscard(false)}>
            {t('Keep editing', 'ادامه ویرایش')}
          </button>
        </div>
      )}
    </Dialog>
  );
}

import SeoOverview from './SeoOverview';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { usePlatform } from '../platform/Context';
const seoLabels: Record<string, [string, string]> = {
  titleEn: ['Search title · English', 'عنوان جستجو · انگلیسی'], titleFa: ['Search title · Persian', 'عنوان جستجو · فارسی'],
  descriptionEn: ['Search description · English', 'توضیح جستجو · انگلیسی'], descriptionFa: ['Search description · Persian', 'توضیح جستجو · فارسی'],
  domainEn: ['English canonical domain', 'دامنه اصلی انگلیسی'], domainFa: ['Persian canonical domain', 'دامنه اصلی فارسی'],
  ogImage: ['Social sharing image URL', 'نشانی تصویر اشتراک‌گذاری'], verification: ['Google Search Console token', 'توکن تأیید سرچ کنسول گوگل'],
  keywords: ['Editorial topic keywords (not a Google ranking signal)', 'کلیدواژه‌های تحریریه (بدون تأثیر مستقیم در رتبه گوگل)'],
  pages: ['Page-specific metadata', 'اطلاعات سئو هر صفحه'], catalog: ['Product catalog', 'کاتالوگ محصولات'], engineering: ['Engineering tools', 'ابزارهای مهندسی'],
};
const companyGroups = [
  { id: 'identity', en: 'Identity', fa: 'هویت شرکت', keys: ['nameFa','nameEn','legalNameFa','legalNameEn','sloganFa','sloganEn','website'] },
  { id: 'contact', en: 'Contact', fa: 'راه‌های ارتباطی', keys: ['email','primaryPhone','primaryPhoneDisplayFa','primaryPhoneDisplayEn','primaryPhoneTel','landlinePhone','landlinePhoneDisplayFa','landlinePhoneDisplayEn','landlinePhoneTel','whatsappNumber','whatsappUrl'] },
  { id: 'hours', en: 'Working hours', fa: 'ساعات کاری', keys: ['workingHoursFa','workingHoursEn','workingHoursShortFa','workingHoursShortEn'] },
  { id: 'location', en: 'Address & maps', fa: 'آدرس و نقشه‌ها', keys: ['addressFa','addressEn','cityFa','cityEn','districtFa','districtEn','streetFa','streetEn','plate','maps'] },
];
const companyLabels: Record<string, [string, string]> = {
  nameFa: ['Company name · Persian','نام شرکت · فارسی'], nameEn: ['Company name · English','نام شرکت · انگلیسی'],
  legalNameFa: ['Legal name · Persian','نام حقوقی · فارسی'], legalNameEn: ['Legal name · English','نام حقوقی · انگلیسی'],
  sloganFa: ['Tagline · Persian','شعار · فارسی'], sloganEn: ['Tagline · English','شعار · انگلیسی'],
  website: ['Website URL','نشانی وب‌سایت'], email: ['Email address','نشانی ایمیل'],
  primaryPhone: ['Primary phone number','شماره تماس اصلی'], primaryPhoneDisplayFa: ['Primary phone display · Persian','نمایش شماره اصلی · فارسی'], primaryPhoneDisplayEn: ['Primary phone display · English','نمایش شماره اصلی · انگلیسی'], primaryPhoneTel: ['Primary phone link','پیوند شماره اصلی'],
  landlinePhone: ['Landline number','شماره تلفن ثابت'], landlinePhoneDisplayFa: ['Landline display · Persian','نمایش تلفن ثابت · فارسی'], landlinePhoneDisplayEn: ['Landline display · English','نمایش تلفن ثابت · انگلیسی'], landlinePhoneTel: ['Landline phone link','پیوند تلفن ثابت'],
  whatsappNumber: ['WhatsApp number','شماره واتس‌اپ'], whatsappUrl: ['WhatsApp URL','پیوند واتس‌اپ'],
  workingHoursFa: ['Working hours · Persian','ساعات کاری · فارسی'], workingHoursEn: ['Working hours · English','ساعات کاری · انگلیسی'], workingHoursShortFa: ['Short hours · Persian','ساعات کوتاه · فارسی'], workingHoursShortEn: ['Short hours · English','ساعات کوتاه · انگلیسی'],
  addressFa: ['Address · Persian','آدرس · فارسی'], addressEn: ['Address · English','آدرس · انگلیسی'], cityFa: ['City · Persian','شهر · فارسی'], cityEn: ['City · English','شهر · انگلیسی'], districtFa: ['District · Persian','منطقه · فارسی'], districtEn: ['District · English','منطقه · انگلیسی'], streetFa: ['Street · Persian','خیابان · فارسی'], streetEn: ['Street · English','خیابان · انگلیسی'], plate: ['Building number','شماره پلاک'],
  maps: ['Map links','پیوندهای نقشه'], google: ['Google Maps','گوگل‌مپ'], neshan: ['Neshan','نشان'], balad: ['Balad','بلد'],
};
export default function SettingsEditor({
  kind,
  onDirty,
}: {
  kind: string;
  onDirty: (dirty: boolean) => void;
}) {
  const { t, reload } = usePlatform();
  const [value, setValue] = useState<any>(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [dirty, setDirty] = useState(false),
    [companyGroup, setCompanyGroup] = useState('identity');
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => {
    api('/' + kind)
      .then((r) => setValue(r.data))
      .catch((e) => setError(e.message));
  }, [kind]);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    addEventListener('beforeunload', f);
    return () => removeEventListener('beforeunload', f);
  }, [dirty]);
  const update = (path: string[], v: string) => {
    const next = structuredClone(value);
    let ref = next;
    for (const k of path.slice(0, -1)) ref = ref[k];
    ref[path.at(-1)!] = v;
    setValue(next);
    setDirty(true);
    setMessage('');
  };
  const labelFor = (key: string) => kind === 'company' && companyLabels[key]
    ? t(...companyLabels[key])
    : kind === 'seo' && seoLabels[key] ? t(...seoLabels[key]) : key.replace(/([a-z])([A-Z])/g, '$1 $2');
  function fields(obj: any, prefix: string[] = []): React.ReactNode {
    return Object.entries(obj).map(([k, v]) =>
      typeof v === 'object' && v && !Array.isArray(v) ? (
        <fieldset key={k}>
          <legend>{labelFor(k)}</legend>
          <div className="form-grid">{fields(v, [...prefix, k])}</div>
        </fieldset>
      ) : typeof v === 'string' ? (
        <label key={k}>
          {labelFor(k)}
          {v.length > 140 || /description|title|address/i.test(k) ? (
            <textarea
              aria-label={labelFor(k)}
              rows={3}
              value={v}
              dir={k.endsWith('Fa') ? 'rtl' : 'ltr'}
              onChange={(e) => update([...prefix, k], e.target.value)}
            />
          ) : (
            <input
              aria-label={labelFor(k)}
              value={v}
              dir={k.endsWith('Fa') ? 'rtl' : 'ltr'}
              onChange={(e) => update([...prefix, k], e.target.value)}
            />
          )}
          {kind === 'seo' && /title|description/i.test(k) && <small className="muted">{v.length} {t('characters · keep this specific and readable', 'نویسه · متن دقیق و خوانا باشد')}</small>}
        </label>
      ) : null,
    );
  }
  const save = async () => {
    try {
      await api('/' + kind, 'PUT', value);
      setDirty(false);
      setMessage('saved');
      setError('');
      reload();
    } catch (e: any) {
      setError(e.message);
    }
  };
  return (
    <div className="panel">
      {!value ? (
        <p>{error || t('Loading…', 'در حال دریافت…')}</p>
      ) : (
        <>
          {kind === 'seo' && <SeoOverview seo={value} />}
          {kind === 'company' && <div className="settings-section-tabs" role="tablist" aria-label={t('Company settings sections', 'بخش‌های تنظیمات شرکت')}>
            {companyGroups.map((group) => <button key={group.id} type="button" role="tab" aria-selected={companyGroup === group.id} onClick={() => setCompanyGroup(group.id)}>{t(group.en, group.fa)}</button>)}
          </div>}
          <div className="form-grid">{fields(kind === 'company' ? Object.fromEntries(companyGroups.find((group) => group.id === companyGroup)!.keys.filter((key) => key in value).map((key) => [key, value[key]])) : value)}</div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="sticky-save">
            <button className="button primary" onClick={save}>
              {t('Save changes', 'ذخیره تغییرات')}
            </button>
            <span role="status">
              {message ? t('Changes saved.', 'تغییرات ذخیره شد.') :
                (dirty ? t('Unsaved changes', 'تغییرات ذخیره‌نشده') : '')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

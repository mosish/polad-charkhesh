import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { usePlatform } from '../platform/Context';
import MediaPicker from './MediaPicker';
import { textKey } from '../../domain/site-content';
const sections: any = {
  hero: ['Hero / first screen', 'صفحه نخست'],
  capabilities: ['Capabilities', 'توانمندی‌ها'],
  about: ['About the company', 'درباره شرکت'],
  featured: ['Product showroom', 'کاتالوگ محصولات'],
  engineering: ['Engineering reference tools', 'ابزارهای مرجع مهندسی'],
  industries: ['Industries', 'صنایع'],
  why: ['Why choose us', 'مزیت‌ها'],
  support: ['Technical support', 'پشتیبانی فنی'],
  contact: ['Contact & inquiry', 'تماس و استعلام'],
};
const pages = [
  ['/', 'Full page'],
  ['/#catalog', 'Catalog section'],
  ['/#engineering', 'Engineering section'],
  ['/?item=6204-2rs#catalog', 'Product specifications'],
];
const groupLabels:any={Home:['Homepage','صفحه نخست'],HomeSections:['Home sections','بخش‌های صفحه نخست'],Shell:['Header & footer','سربرگ و پاورقی'],Catalog:['Product catalog','کاتالوگ محصولات'],Product:['Product details','جزئیات محصول'],Engineering:['Engineering tools','ابزارهای مهندسی'],Viewer:['Bearing explorer','نمایش بیرینگ'],Schematic:['Dimensional drawings','نقشه‌های ابعادی'],SectionView:['Section drawing','نقشه مقطع']};
const linkLabels:any={heroPrimary:['Main hero button','دکمه اصلی صفحه نخست'],heroSecondary:['Hero consultation button','دکمه مشاوره صفحه نخست'],heroVisual:['Hero image button','دکمه تصویر نخست'],capabilities:['Capabilities button','دکمه توانمندی‌ها'],featured:['View all products','مشاهده همه محصولات'],engineering:['Engineering workspace button','دکمه کارگاه مهندسی'],header:['Header consultation button','دکمه مشاوره سربرگ']};
export default function WebsiteEditor({
  onDirty,
  initialTab = 'sections',
}: {
  initialTab?: string;
  onDirty: (v: boolean) => void;
}) {
  const { t, fa, reload } = usePlatform();
  const [value, setValue] = useState<any>(null),
    [dirty, setDirty] = useState(false),
    [tab, setTab] = useState(initialTab),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [q, setQ] = useState(''),
    [group, setGroup] = useState('all'),
    [route, setRoute] = useState('/'),
    [previewLang, setPreviewLang] = useState(fa ? 'fa' : 'en'),
    [width, setWidth] = useState('desktop');
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    api('/content')
      .then((r) => setValue(r.data))
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);
  const preview = () =>
    frame.current?.contentWindow?.postMessage(
      { type: 'pc-content-preview', content: value },
      location.origin,
    );
  useEffect(() => {
    if (value) preview();
  }, [value]);
  const update = (path: (string | number)[], next: any) => {
    setValue((old: any) => {
      const v = structuredClone(old);
      let ref = v;
      for (const k of path.slice(0, -1)) ref = ref[k];
      ref[path.at(-1)!] = next;
      return v;
    });
    setDirty(true);
    setMessage('');
  };
  const mutate = (fn: (v: any) => void) => {
    setValue((old: any) => {
      const v = structuredClone(old);
      fn(v);
      return v;
    });
    setDirty(true);
    setMessage('');
  };
  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/content', 'PUT', value);
      setDirty(false);
      setMessage(t('Website changes saved.', 'تغییرات سایت ذخیره شد.'));
      reload();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const text = (
    path: (string | number)[],
    label: string,
    multiline = false,
  ) => {
    let v = value;
    for (const k of path) v = v[k];
    const props = {
      value: v ?? '',
      dir: String(path.at(-1)).toLowerCase().endsWith('fa') ? 'rtl' : 'ltr',
      onChange: (e: any) => update(path, e.target.value),
    };
    return (
      <label key={path.join('.')}>
        {label}
        {multiline ? <textarea rows={3} {...props} /> : <input {...props} />}
      </label>
    );
  };
  const pair = (
    path: (string | number)[],
    key: string,
    label: string,
    multiline = false,
  ) => (
    <div className="form-grid">
      {text([...path, key + 'En'], label + ' · English', multiline)}
      {text([...path, key + 'Fa'], label + ' · فارسی', multiline)}
    </div>
  );
  const cardFields = (base: (string | number)[], c: any) => (
    <>
      {pair(base, 'title', t('Title', 'عنوان'))}
      {pair(base, 'description', t('Description', 'توضیحات'), true)}
      <MediaPicker
        label={t('Section image', 'تصویر بخش')}
        value={c.imageUrl}
        onChange={(url) => update([...base, 'imageUrl'], url)}
      />
      {text([...base, 'href'], t('Destination link', 'پیوند مقصد'))}
    </>
  );
  if (!value)
    return (
      <div className="state">
        {error || t('Loading website editor…', 'دریافت ویرایشگر سایت…')}
      </div>
    );
  return (
    <div className="website-editor">
      <div className="editor-savebar">
        <div>
          <strong>
            {t('Your website, your content.', 'وب‌سایت شما، محتوای شما.')}
          </strong>
          <p>
            {t(
              'Preview changes here, then save to update the website.',
              'تغییرات را اینجا ببینید و برای اعمال روی سایت ذخیره کنید.',
            )}
          </p>
        </div>
        <button
          className="button primary"
          disabled={busy || !dirty}
          onClick={save}
        >
          {t(
            busy ? 'Saving…' : 'Save website',
            busy ? 'در حال ذخیره…' : 'ذخیره سایت',
          )}
        </button>
        <button
          className="button"
          disabled={busy || !dirty}
          onClick={async () => {
            if (
              !window.confirm(
                t(
                  'Discard unsaved website changes?',
                  'تغییرات ذخیره‌نشده کنار گذاشته شوند؟',
                ),
              )
            )
              return;
            try {
              const r = await api('/content');
              setValue(r.data);
              setDirty(false);
              setError('');
              setMessage('');
            } catch (e: any) {
              setError(e.message);
            }
          }}
        >
          {t('Discard changes', 'لغو تغییرات')}
        </button>
        <span role="status">
          {message || (dirty ? t('Unsaved preview', 'پیش‌نمایش ذخیره‌نشده') : '')}
        </span>
      </div>
      {error && (
        <p role="alert" className="error note">
          {error}
        </p>
      )}
      <div className="editor-tabs">
        {[
          ['sections', 'Sections & order', 'بخش‌ها و ترتیب'],
          ['header', 'Header', 'سربرگ'],
          ['text', 'All website text', 'همه متن‌های سایت'],
          ['brand', 'Brand & images', 'نشان و تصاویر'],
          ['cards', 'Cards & industries', 'کارت‌ها و صنایع'],
          ['navigation', 'Links & navigation', 'پیوندها و منو'],
        ].map(([k, en, f]) => (
          <button
            className={'button ' + (tab === k ? 'primary' : '')}
            key={k}
            onClick={() => setTab(k)}
          >
            {t(en, f)}
          </button>
        ))}
      </div>
      <div className="editor-columns">
        <div className="editor-fields">
          {tab === 'header' && (
            <>
              <h2>{t('Website header', 'سربرگ وب‌سایت')}</h2>
              <p>{t('Edit the logo, bilingual header text, button and menu below. The phone number is managed in Company.', 'نشان، متن دو زبانه، دکمه و منوی سربرگ را ویرایش کنید. شماره تلفن در بخش شرکت مدیریت می‌شود.')}</p>
              <MediaPicker label={t('Header logo', 'نشان سربرگ')} value={value.brand.logoUrl} onChange={(url) => update(['brand', 'logoUrl'], url)} />
              {pair(['brand'], 'logoAlt', t('Logo description', 'توضیح نشان'))}
              {[
                ['BEARINGS. ENGINEERING. CONTINUITY.', 'Top strip text', 'متن نوار بالا'],
                ['POLAD CHARKHESH', 'Company name', 'نام شرکت'],
                ['INDUSTRIAL ENGINEERING', 'Company subtitle', 'زیرعنوان شرکت'],
                ['Let’s talk engineering', 'Contact button label', 'عنوان دکمه تماس'],
              ].map(([original, en, f]) => (
                <fieldset key={original} className="copy-row">
                  <legend>{t(en, f)}</legend>
                  <div className="form-grid">
                    {text(['copy', textKey(original), 'en'], 'English')}
                    {text(['copy', textKey(original), 'fa'], 'فارسی')}
                  </div>
                </fieldset>
              ))}
              {text(['links', 'header'], t('Contact button destination', 'مقصد دکمه تماس'))}
            </>
          )}
          {tab === 'sections' && (
            <>
              <p>
                {t(
                  'Show, hide and reorder sections. Add a custom text-and-image section below.',
                  'بخش‌ها را نمایش دهید، پنهان کنید یا جابه‌جا کنید. بخش متن و تصویر جدید نیز می‌توانید اضافه کنید.',
                )}
              </p>
              {value.layout.order.map((id: string, index: number) => {
                const custom = value.layout.custom.find(
                  (c: any) => c.id === id,
                );
                return (
                  <div key={id} className="section-order-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={!value.layout.hidden.includes(id)}
                        onChange={(e) =>
                          update(
                            ['layout', 'hidden'],
                            e.target.checked
                              ? value.layout.hidden.filter(
                                  (i: string) => i !== id,
                                )
                              : [...value.layout.hidden, id],
                          )
                        }
                      />
                      {sections[id]?.[fa ? 1 : 0] ||
                        custom?.[fa ? 'titleFa' : 'titleEn'] ||
                        id}
                    </label>
                    <button
                      className="button"
                      disabled={index === 0}
                      aria-label={'Move ' + id + ' up'}
                      onClick={() =>
                        mutate((v) => {
                          [v.layout.order[index - 1], v.layout.order[index]] = [
                            v.layout.order[index],
                            v.layout.order[index - 1],
                          ];
                        })
                      }
                    >
                      ↑
                    </button>
                    <button
                      className="button"
                      disabled={index === value.layout.order.length - 1}
                      aria-label={'Move ' + id + ' down'}
                      onClick={() =>
                        mutate((v) => {
                          [v.layout.order[index + 1], v.layout.order[index]] = [
                            v.layout.order[index],
                            v.layout.order[index + 1],
                          ];
                        })
                      }
                    >
                      ↓
                    </button>
                  </div>
                );
              })}
              {[
                'hero',
                'about',
                'why',
                'industries',
                'engineering',
                'contact',
                'footer',
              ].map((section) => (
                <details key={section}>
                  <summary>
                    {sections[section]?.[fa ? 1 : 0] || t('Footer', 'پاورقی')}
                  </summary>
                  <div className="editor-detail">
                    {Object.keys(value[section])
                      .filter((k) => k.endsWith('En'))
                      .map((k) =>
                        pair([section], k.slice(0, -2), ({badge:t('Small heading','عنوان کوتاه'),title:t('Title','عنوان'),description:t('Description','توضیحات')} as any)[k.slice(0,-2)]||k.slice(0,-2), true),
                      )}
                  </div>
                </details>
              ))}
              <h3>{t('Custom sections', 'بخش‌های سفارشی')}</h3>
              {value.layout.custom.map((c: any, i: number) => (
                <details key={c.id} open>
                  <summary>
                    {c[fa ? 'titleFa' : 'titleEn'] ||
                      t('New section', 'بخش جدید')}
                  </summary>
                  <div className="editor-detail">
                    {cardFields(['layout', 'custom', i], c)}
                    {pair(
                      ['layout', 'custom', i],
                      'button',
                      t('Button label', 'عنوان دکمه'),
                    )}
                    <button
                      className="button danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            t(
                              'Remove this custom section? You can discard unsaved changes to cancel.',
                              'این بخش سفارشی حذف شود؟',
                            ),
                          )
                        )
                          mutate((v) => {
                            v.layout.custom.splice(i, 1);
                            v.layout.order = v.layout.order.filter(
                              (id: string) => id !== c.id,
                            );
                            v.layout.hidden = v.layout.hidden.filter(
                              (id: string) => id !== c.id,
                            );
                          });
                      }}
                    >
                      {t('Remove section', 'حذف بخش')}
                    </button>
                  </div>
                </details>
              ))}
              <button
                className="button"
                disabled={value.layout.custom.length >= 20}
                onClick={() =>
                  mutate((v) => {
                    const id = 'custom-' + crypto.randomUUID();
                    v.layout.custom.push({
                      id,
                      titleEn: 'New section',
                      titleFa: 'بخش جدید',
                      descriptionEn: '',
                      descriptionFa: '',
                      imageUrl: '',
                      href: '',
                      buttonEn: 'Learn more',
                      buttonFa: 'بیشتر بدانید',
                      enabled: true,
                    });
                    v.layout.order.push(id);
                  })
                }
              >
                {t('Add a section', 'افزودن بخش')}
              </button>
            </>
          )}
          {tab === 'text' && (
            <>
              <p>
                {t(
                  'Edit headings, buttons, instructions, footer text and public labels in both languages. Product descriptions are in Products; contact details are in Company.',
                  'عنوان‌ها، دکمه‌ها، راهنماها و متن‌های عمومی را به دو زبان ویرایش کنید. توضیحات محصولات در بخش محصولات و اطلاعات تماس در بخش شرکت است.',
                )}
              </p>
              <label>
                {t('Find text', 'جستجوی متن')}
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t(
                    'Search English or Persian…',
                    'جستجوی فارسی یا انگلیسی…',
                  )}
                />
              </label>
              <label>
                {t('Page or component', 'صفحه یا بخش')}
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  <option value="all">{t('All pages', 'همه صفحات')}</option>
                  {[
                    ...new Set(
                      Object.values(value.copy).map((c: any) => c.group),
                    ),
                  ]
                    .sort()
                    .map((g: any) => (
                        <option key={g} value={g}>{groupLabels[g]?.[fa?1:0]||g}</option>
                    ))}
                </select>
              </label>
              {Object.entries(value.copy)
                .filter(
                  ([id, c]: any) =>
                    (group === 'all' || c.group === group) &&
                    (!q ||
                      [c.en, c.fa, c.original].some((s) =>
                        s.toLowerCase().includes(q.toLowerCase()),
                      )),
                )
                .map(([id, c]: any) => (
                  <div className="copy-row" key={id}>
                      <small>{groupLabels[c.group]?.[fa?1:0]||c.group}</small>
                    <div className="form-grid">
                      {text(['copy', id, 'en'], 'English', true)}
                      {text(['copy', id, 'fa'], 'فارسی', true)}
                    </div>
                  </div>
                ))}
            </>
          )}
          {tab === 'brand' && (
            <>
              <h3>{t('Company identity', 'هویت شرکت')}</h3>
              <MediaPicker
                label={t('Company logo', 'نشان شرکت')}
                value={value.brand.logoUrl}
                onChange={(url) => update(['brand', 'logoUrl'], url)}
              />
              {pair(['brand'], 'logoAlt', t('Logo description', 'توضیح نشان'))}
              <div className="form-grid">
                {[
                  ['navy', 'Main color', 'رنگ اصلی'],
                  ['accent', 'Link color', 'رنگ پیوند'],
                  ['ink', 'Text color', 'رنگ متن'],
                ].map(([k, en, f]) => (
                  <label key={k}>
                    {t(en, f)}
                    <input
                      type="color"
                      value={value.brand[k]}
                      onChange={(e) => update(['brand', k], e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <h3>{t('Homepage visual', 'نمای صفحه نخست')}</h3>
              <label>{t('Homepage display', 'نمایش صفحه نخست')}
                <select value={value.media.heroPresentation || 'animation'} onChange={e => update(['media', 'heroPresentation'], e.target.value)}>
                  <option value="animation">{t('Animated bearing', 'بیرینگ متحرک')}</option>
                  <option value="photo">{t('Uploaded photograph', 'تصویر بارگذاری‌شده')}</option>
                </select>
              </label>
              <h3>{t('Website images', 'تصاویر سایت')}</h3>
              {[
                ['heroUrl', 'Homepage hero', 'تصویر صفحه نخست'],
                [
                  'ballUrl',
                  'Ball-bearing family image',
                  'تصویر خانواده بلبرینگ',
                ],
                [
                  'taperedUrl',
                  'Tapered-bearing family image',
                  'تصویر خانواده مخروطی',
                ],
              ].map(([k, en, f]) => (
                <MediaPicker
                  key={k}
                  label={t(en, f)}
                  value={value.media[k]}
                  onChange={(url) => update(['media', k], url)}
                />
              ))}
              {pair(
                ['media'],
                'heroAlt',
                t('Hero image description', 'توضیح تصویر نخست'),
              )}
              <p>
                {t(
                  'Product-specific photographs can be changed in Products. IRANSans remains the selected company typeface.',
                  'تصویر اختصاصی هر محصول در بخش محصولات قابل ویرایش است. فونت انتخابی شرکت ایران‌سنس است.',
                )}
              </p>
            </>
          )}
          {tab === 'cards' &&
            Object.entries(value.cards).map(([kind, cards]: any) => (
              <div key={kind}>
                <h3>
                  {kind === 'reasons'
                    ? t('Why choose us', 'مزیت‌ها')
                    : sections[kind]?.[fa ? 1 : 0] || kind}
                </h3>
                {cards.map((c: any, i: number) => (
                  <details key={c.id}>
                    <summary>
                      {c[fa ? 'titleFa' : 'titleEn'] ||
                        t('New card', 'کارت جدید')}
                    </summary>
                    <div className="editor-detail">
                      {cardFields(['cards', kind, i], c)}
                      <button
                        className="button"
                        disabled={!i}
                        onClick={() =>
                          mutate((v) => {
                            [v.cards[kind][i - 1], v.cards[kind][i]] = [
                              v.cards[kind][i],
                              v.cards[kind][i - 1],
                            ];
                          })
                        }
                      >
                        {t('Move up', 'انتقال به بالا')}
                      </button>
                      <button
                        className="button danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              t('Remove this card?', 'این کارت حذف شود؟'),
                            )
                          )
                            update(
                              ['cards', kind],
                              cards.filter((x: any) => x.id !== c.id),
                            );
                        }}
                      >
                        {t('Remove card', 'حذف کارت')}
                      </button>
                    </div>
                  </details>
                ))}
                <button
                  className="button"
                  disabled={cards.length >= 30}
                  onClick={() =>
                    update(
                      ['cards', kind],
                      [
                        ...cards,
                        {
                          id: 'card-' + crypto.randomUUID(),
                          titleEn: 'New card',
                          titleFa: 'کارت جدید',
                          descriptionEn: '',
                          descriptionFa: '',
                          imageUrl: '',
                          href: '',
                        },
                      ],
                    )
                  }
                >
                  {t('Add card', 'افزودن کارت')}
                </button>
              </div>
            ))}
          {['navigation', 'header'].includes(tab) && (
            <>
              <h3>{t('Main menu', 'منوی اصلی')}</h3>
              {value.navigation.items.map((n: any, i: number) => (
                <div className="copy-row" key={n.id}>
                  {pair(
                    ['navigation', 'items', i],
                    'label',
                    t('Menu label', 'عنوان منو'),
                  )}
                  {text(
                    ['navigation', 'items', i, 'href'],
                    t('Destination', 'مقصد'),
                  )}
                  <button
                    className="button"
                    disabled={!i}
                    onClick={() =>
                      mutate((v) => {
                        [v.navigation.items[i - 1], v.navigation.items[i]] = [
                          v.navigation.items[i],
                          v.navigation.items[i - 1],
                        ];
                      })
                    }
                  >
                    {t('Move up', 'انتقال به بالا')}
                  </button>
                  <button
                    className="button danger"
                    onClick={() =>
                      update(
                        ['navigation', 'items'],
                        value.navigation.items.filter(
                          (x: any) => x.id !== n.id,
                        ),
                      )
                    }
                  >
                    {t('Remove link', 'حذف پیوند')}
                  </button>
                </div>
              ))}
              <button
                className="button"
                disabled={value.navigation.items.length >= 12}
                onClick={() =>
                  update(
                    ['navigation', 'items'],
                    [
                      ...value.navigation.items,
                      {
                        id: 'nav-' + crypto.randomUUID(),
                        labelEn: 'New link',
                        labelFa: 'پیوند جدید',
                        href: '/',
                      },
                    ],
                  )
                }
              >
                {t('Add menu link', 'افزودن پیوند منو')}
              </button>
              {tab === 'navigation' && <h3>{t('Section button destinations', 'مقصد دکمه‌های بخش‌ها')}</h3>}
                {Object.keys(value.links).filter((k) => tab !== 'header').map((k) => text(['links', k], linkLabels[k]?.[fa?1:0]||k))}
            </>
          )}
        </div>
        <aside className="editor-preview">
          <div className="preview-controls">
            <label>
              {t('Preview page', 'پیش‌نمایش صفحه')}
              <select value={route} onChange={(e) => setRoute(e.target.value)}>
                {pages.map(([path, label]) => (
                  <option key={path} value={path}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('Language', 'زبان')}
              <select
                value={previewLang}
                onChange={(e) => setPreviewLang(e.target.value)}
              >
                <option value="en">English</option>
                <option value="fa">فارسی</option>
              </select>
            </label>
            <label>
              {t('Size', 'اندازه')}
              <select value={width} onChange={(e) => setWidth(e.target.value)}>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </label>
          </div>
          <iframe
            ref={frame}
            title="Website preview"
            className={width === 'mobile' ? 'mobile-preview' : ''}
            src={route.split('#')[0] + (route.includes('?') ? '&' : '?') + 'preview=1&lang=' + previewLang + (route.includes('#') ? '#' + route.split('#')[1] : '')}
            onLoad={preview}
          />
          <small>
            {t(
              'Preview only. Changes go live on this local website after Save website.',
              'فقط پیش‌نمایش است. تغییرات پس از ذخیره روی همین سایت محلی اعمال می‌شود.',
            )}
          </small>
        </aside>
      </div>
    </div>
  );
}


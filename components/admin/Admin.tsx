import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  LockKeyhole,
  Package,
  Inbox,
  Settings,
  LogOut,
  Image as ImageIcon,
  FileText,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { usePlatform } from '../platform/Context';
import Dialog from '../platform/Dialog';
import ProductEditor from './ProductEditor';
import SettingsEditor from './SettingsEditor';
import WebsiteEditor from './WebsiteEditor';
const tabs = [
  ['overview', 'Overview', 'نمای کلی'],
  ['products', 'Products', 'محصولات'],
  ['media', 'Media', 'رسانه'],
  ['company', 'Company', 'شرکت'],
  ['inquiries', 'Inquiries', 'استعلام‌ها'],
  ['content', 'Website editor', 'ویرایشگر وب‌سایت'],
  ['header', 'Header', 'سربرگ'],
  ['seo', 'SEO', 'سئو'],
  ['system', 'System & security', 'سیستم و امنیت'],
  ['audit', 'Audit logs', 'گزارش رویدادها'],
];
export default function Admin() {
  const { fa, t, toggle, reload, content } = usePlatform();
  const [status, setStatus] = useState<any>(null),
    [tab, setTab] = useState('overview'),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState<any>(null),
    [loadVersion, setLoadVersion] = useState(0),
    [q, setQ] = useState(''),
    [filter, setFilter] = useState('all'),
    [edit, setEdit] = useState<any>(undefined),
    [confirm, setConfirm] = useState<any>(null),
    [typed, setTyped] = useState(''),
    [backup, setBackup] = useState<any>(null),
    [settingsDirty, setSettingsDirty] = useState(false);
  const check = () =>
    api('/auth/status')
      .then(setStatus)
      .catch((e) => setError(e.message));
  useEffect(() => {
    check();
  }, []);
  // Associate each response with its tab; never render another tab's payload.
  const data = loaded?.tab === tab ? loaded.value : null;
  const load = () => setLoadVersion((version) => version + 1);
  useEffect(() => {
    if (!status?.user) return;
    let cancelled = false;
    setLoaded(null);
    setError('');
    if (['content', 'header', 'company', 'seo'].includes(tab)) return;
    const route = tab === 'products' ? '/products?includeArchived=true'
      : tab === 'inquiries' ? '/inquiries'
      : tab === 'media' ? '/media'
      : tab === 'audit' ? '/system/audit' : '/system/status';
    api(route).then((value) => {
      if (!cancelled) setLoaded({ tab, value });
    }).catch((e) => {
      if (cancelled) return;
      setError(e.message);
      if (e.message.includes('session')) check();
    });
    return () => { cancelled = true; };
  }, [tab, status?.user, loadVersion]);
  const act = async (path: string, method: string, body?: any) => {
    setBusy(true);
    try {
      const r = await api(path, method, body);
      setMessage(t('Saved successfully.', 'با موفقیت ذخیره شد.'));
      setError('');
      load();
      reload();
      return r;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  };
  const changeTab = (x: string) => {
    if (x === tab) return;
    if (
      settingsDirty &&
      !window.confirm(
        t('Discard unsaved changes?', 'تغییرات ذخیره‌نشده کنار گذاشته شوند؟'),
      )
    )
      return;
    setSettingsDirty(false);
    setTab(x);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setQ('');
    setFilter('all');
    setMessage('');
  };
  if (!status)
    return (
      <main id="main" className="state">
        <p>{error || t('Checking secure session…', 'بررسی نشست امن…')}</p>
        {error && (
          <button className="button" onClick={check}>
            {t('Retry', 'تلاش دوباره')}
          </button>
        )}
      </main>
    );
  if (!status.user)
    return (
      <main id="main" className="admin-login">
        <div className="login-intro">
          <img
            className="admin-brand-logo"
            src={content?.brand?.logoUrl || '/brand/logo.png'}
            width={560}
            height={575}
            alt={t('Polad Charkhesh company logo', 'نشان شرکت پولاد چرخش')}
          />
          <div className="section-label">POLAD CHARKHESH / ADMINISTRATION</div>
          <h1>
            {t('Precision behind\nthe platform.', 'مدیریت دقیق\nسامانه صنعتی.')}
          </h1>
          <p>
            {t(
              'Manage your technical catalog, website content and engineering inquiries in one secure workspace.',
              'کاتالوگ فنی، محتوای سایت و استعلام‌های مهندسی را در یک محیط امن مدیریت کنید.',
            )}
          </p>
        </div>
        <form
          className="panel login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const form = Object.fromEntries(new FormData(e.currentTarget));
            try {
              await api(
                '/auth/' + (status.isConfigured ? 'login' : 'setup'),
                'POST',
                form,
              );
              await check();
              setError('');
            } catch (e: any) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>
            {status.isConfigured
              ? t('Welcome back.', 'خوش آمدید.')
              : t('Set up your administrator.', 'راه‌اندازی مدیر سامانه.')}
          </h2>
          <p>
            {status.isConfigured
              ? t(
                  'Sign in to your administration workspace.',
                  'به پنل مدیریت وارد شوید.',
                )
              : t(
                  'Create the first administrator. No default credentials are supplied.',
                  'اولین مدیر را ایجاد کنید. اطلاعات ورود پیش‌فرض وجود ندارد.',
                )}
          </p>
          <label>
            {t('Username', 'نام کاربری')}
            <input
              name="username"
              required
              minLength={3}
              maxLength={64}
              autoComplete="username"
            />
          </label>
          <label>
            {t('Password', 'رمز عبور')}
            <input
              name="password"
              type="password"
              required
              minLength={status.isConfigured ? 1 : 12}
              maxLength={256}
              autoComplete={
                status.isConfigured ? 'current-password' : 'new-password'
              }
            />
          </label>
          {!status.isConfigured && (
            <label>
              {t(
                'Production setup token (if configured)',
                'توکن راه‌اندازی تولید (در صورت تنظیم)',
              )}
              <input name="setupToken" type="password" autoComplete="off" />
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {t(
              busy
                ? 'Please wait…'
                : status.isConfigured
                  ? 'Sign in'
                  : 'Create administrator',
              busy
                ? 'لطفاً صبر کنید…'
                : status.isConfigured
                  ? 'ورود'
                  : 'ایجاد مدیر',
            )}
          </button>
        </form>
      </main>
    );
  return (
    <main id="main" className="admin-shell">
      <aside className="admin-sidebar">
        <div className="section-label">
          {t('CONTROL CENTER', 'مرکز مدیریت')}
        </div>
        <strong>{status.user.username}</strong>
        <small>{status.user.role}</small>
        <nav aria-label={t('Admin navigation', 'ناوبری مدیریت')}>
          {tabs.map(([k, e, f]) => (
            <button
              key={k}
              className={tab === k ? 'active' : ''}
              aria-current={tab === k ? 'page' : undefined}
              onClick={() => changeTab(k)}
            >
              {t(e, f)}
            </button>
          ))}
        </nav>
        <button
          onClick={async () => {
            if (
              settingsDirty &&
              !window.confirm(
                t(
                  'Discard unsaved changes and sign out?',
                  'تغییرات ذخیره‌نشده کنار گذاشته شوند و خارج شوید؟',
                ),
              )
            )
              return;
            await api('/auth/logout', 'POST', {});
            check();
          }}
        >
          <LogOut size={17} />
          {t('Sign out', 'خروج')}
        </button>
        <a className="admin-site-link" href="/" target="_blank" rel="noreferrer">{t('View website', 'مشاهده وب‌سایت')} <ArrowUpRight size={16} /></a>
        <button onClick={toggle}>{fa ? 'English' : 'فارسی'}</button>
      </aside>
      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <div className="section-label">
              {t('ADMINISTRATION WORKSPACE', 'فضای مدیریت')}
            </div>
            <h1>{tabs.find((x) => x[0] === tab)?.[fa ? 2 : 1]}</h1>
          </div>
          <span className="auth-badge">
            <ShieldCheck size={15} />
            {t('Authenticated', 'احراز هویت شده')}
          </span>
        </div>
        {error && (
          <div className="error note" role="alert">
            {error}
            <button onClick={load}>{t('Retry', 'تلاش دوباره')}</button>
          </div>
        )}
        {message && (
          <p className="success" role="status">
            {message}
          </p>
        )}
        {['content', 'header'].includes(tab) ? (
          <WebsiteEditor key={tab} initialTab={tab === 'header' ? 'header' : 'sections'} onDirty={setSettingsDirty} />
        ) : ['company', 'seo'].includes(tab) ? (
          <SettingsEditor key={tab} kind={tab} onDirty={setSettingsDirty} />
        ) : !data ? (
          <div className="state">
            {t('Loading workspace…', 'در حال دریافت اطلاعات…')}
          </div>
        ) : tab === 'overview' ? (
          <>
            <div className="admin-stats">
              {[
                ['products', 'Components', 'قطعه'],
                ['active', 'Active', 'فعال'],
                ['archived', 'Archived', 'بایگانی'],
                ['inquiries', 'Inquiries', 'استعلام'],
              ].map(([k, e, f]) => (
                <div key={k}>
                  <strong>{data[k]}</strong>
                  <span>{t(e, f)}</span>
                </div>
              ))}
            </div>
            <div className="panel">
              <h2>
                {t(
                  'Your technical catalog, in focus.',
                  'کاتالوگ فنی، زیر نظر شما.',
                )}
              </h2>
              <p>
                {t(
                  'Review specifications before editing. Imported technical data must be checked against manufacturer documentation before approval.',
                  'پیش از ویرایش، مشخصات را بررسی کنید. داده‌های واردشده باید قبل از تأیید با مستندات سازنده تطبیق داده شوند.',
                )}
              </p>
              <div className="action-row">
                <button
                  className="button primary"
                  onClick={() => changeTab('content')}
                >
                  {t(
                    'Edit website sections, text & images',
                    'ویرایش بخش‌ها، متن‌ها و تصاویر سایت',
                  )}
                </button>
                <button
                  className="button primary"
                  onClick={() => changeTab('products')}
                >
                  {t('Manage products', 'مدیریت محصولات')}
                </button>
                <button
                  className="button"
                  onClick={() => changeTab('inquiries')}
                >
                  {t('Review inquiries', 'بررسی استعلام‌ها')}
                </button>
              </div>
            </div>
          </>
        ) : tab === 'products' ? (
          <>
            <div className="catalog-toolbar">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Search products"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('Find a product…', 'جستجوی محصول…')}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">{t('All', 'همه')}</option>
                <option value="active">{t('Active', 'فعال')}</option>
                <option value="archived">{t('Archived', 'بایگانی')}</option>
              </select>
              <button className="button primary" onClick={() => setEdit(null)}>
                <Plus size={17} />
                {t('Add product', 'افزودن محصول')}
              </button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t('Component', 'قطعه')}</th>
                    <th>d / D / B</th>
                    <th>{t('Status', 'وضعیت')}</th>
                    <th>{t('Actions', 'عملیات')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products
                    .filter(
                      (p: any) =>
                        (p.code + ' ' + p.nameFa + ' ' + p.nameEn)
                          .toLowerCase()
                          .includes(q.toLowerCase()) &&
                        (filter === 'all' ||
                          (filter === 'archived'
                            ? p.isArchived
                            : !p.isArchived)),
                    )
                    .map((p: any) => (
                      <tr key={p.id}>
                        <td>
                          <code>{p.code}</code>
                          <small>{p[fa ? 'nameFa' : 'nameEn']}</small>
                        </td>
                        <td dir="ltr">
                          {p.d} / {p.D} / {p.B}
                        </td>
                        <td>
                          {p.isArchived
                            ? t('Archived', 'بایگانی')
                            : t('Active', 'فعال')}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => setEdit(p)}>
                              {t('Edit', 'ویرایش')}
                            </button>
                            <button
                              disabled={busy}
                              onClick={() =>
                                act(
                                  '/products/' + p.id + '/archive',
                                  'PATCH',
                                  {},
                                ).catch(() => {})
                              }
                            >
                              {p.isArchived
                                ? t('Restore', 'بازیابی')
                                : t('Archive', 'بایگانی')}
                            </button>
                            {p.isArchived &&
                              status.user.role === 'superadmin' && (
                                <button
                                  className="danger"
                                  onClick={() => {
                                    setConfirm({ type: 'delete', p });
                                    setTyped('');
                                  }}
                                >
                                  {t('Delete', 'حذف')}
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : tab === 'inquiries' ? (
          <>
            <div className="catalog-toolbar">
              <input
                aria-label="Search inquiries"
                placeholder={t('Search inquiries', 'جستجوی استعلام‌ها')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {['all', 'new', 'reviewed', 'contacted', 'closed'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            {!data.inquiries.length ? (
              <div className="state">
                {t(
                  'No inquiries yet. Submitted website inquiries will appear here.',
                  'هنوز استعلامی ثبت نشده است. درخواست‌های وب‌سایت در اینجا نمایش داده می‌شوند.',
                )}
              </div>
            ) : (
              data.inquiries
                .filter(
                  (i: any) =>
                    JSON.stringify(i).toLowerCase().includes(q.toLowerCase()) &&
                    (filter === 'all' || i.status === filter),
                )
                .map((i: any) => (
                  <article className="panel inquiry" key={i.id}>
                    <div className="row">
                      <strong>
                        {i.name} · {i.company}
                      </strong>
                      <select
                        aria-label={'Status for ' + i.name}
                        value={i.status}
                        onChange={(e) =>
                          act('/inquiries/' + i.id, 'PATCH', {
                            status: e.target.value,
                          }).catch(() => {})
                        }
                      >
                        {['new', 'reviewed', 'contacted', 'closed'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <a href={'tel:' + i.phone}>{i.phone}</a> · {i.email}
                    <p>{i.message}</p>
                    <small>
                      {i.created_at} · {t('Updated', 'ویرایش')}: {i.updated_at}
                    </small>
                  </article>
                ))
            )}
          </>
        ) : tab === 'media' ? (
          <>
            <div className="panel">
              <h3>{t('Upload technical media', 'بارگذاری رسانه فنی')}</h3>
              <p>
                {t(
                  'PNG, JPEG, WebP or PDF · Maximum 5 MB. Use the saved URL in a product’s Media section. Upload a replacement and update associations before deleting old media.',
                  'PNG، JPEG، WebP یا PDF تا ۵ مگابایت. نشانی ذخیره‌شده را در بخش رسانه محصول وارد کنید. برای جایگزینی، فایل جدید را بارگذاری و ارتباط محصول را به‌روز کنید.',
                )}
              </p>
              <input
                aria-label="Upload media"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    setError('Maximum 5 MB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () =>
                    act('/media', 'POST', {
                      name: file.name,
                      mime: file.type,
                      base64: String(reader.result).split(',')[1],
                    }).catch(() => {});
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            <div className="media-grid">
              {data.media.map((m: any) => (
                <div className="panel" key={m.id}>
                  {m.mime.startsWith('image/') ? (
                    <img src={m.url} alt={m.name} />
                  ) : (
                    <FileText size={40} />
                  )}
                  <strong>{m.name}</strong>
                  <small>
                    {m.mime} · {(m.size / 1024).toFixed(1)} KB
                  </small>
                  <input aria-label="Media URL" readOnly value={m.url} />
                  <div className="action-row">
                    <a
                      className="button"
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('Open', 'مشاهده')}
                    </a>
                    <button
                      className="button danger"
                      onClick={() => {
                        setConfirm({ type: 'media', m });
                        setTyped('');
                      }}
                    >
                      {t('Delete', 'حذف')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : tab === 'audit' ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t('Time', 'زمان')}</th>
                  <th>{t('Actor', 'کاربر')}</th>
                  <th>{t('Action', 'رویداد')}</th>
                  <th>{t('Record', 'رکورد')}</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((l: any) => (
                  <tr key={l.id}>
                    <td>{l.timestamp}</td>
                    <td>{l.actor}</td>
                    <td>
                      <code>{l.action}</code>
                    </td>
                    <td>{l.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="panel">
              <h3>{t('System status', 'وضعیت سیستم')}</h3>
              <p>
                {t('Database', 'پایگاه داده')}: {data.database} ·{' '}
                {t('Version', 'نسخه')}: {data.version} · {data.products}{' '}
                {t('products', 'محصول')}
              </p>
              <a className="button" href="/api/system/backup" download>
                {t('Download secure backup', 'دریافت نسخه پشتیبان')}
              </a>
              <p className="note">
                {t(
                  'Backups exclude passwords and sessions. Media metadata is included; copy the uploads directory separately.',
                  'نسخه پشتیبان فاقد رمزها و نشست‌هاست. اطلاعات رسانه ذخیره می‌شود؛ پوشه فایل‌های بارگذاری‌شده را جداگانه پشتیبان بگیرید.',
                )}
              </p>
              {status.user.role === 'superadmin' && (
                <>
                  <label>
                    {t('Restore a JSON backup', 'بازیابی نسخه JSON')}
                    <input
                      type="file"
                      accept="application/json"
                      onChange={async (e) => {
                        try {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 10 * 1024 * 1024)
                            throw new Error('Backup too large.');
                          setBackup(JSON.parse(await f.text()));
                          setConfirm({ type: 'restore' });
                          setTyped('');
                        } catch (e: any) {
                          setError(e.message);
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>
            <form
              className="panel"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = Object.fromEntries(new FormData(e.currentTarget));
                try {
                  await api('/auth/change-password', 'POST', form);
                  setMessage('Password changed. Sign in again.');
                  check();
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              <h3>{t('Change password', 'تغییر رمز عبور')}</h3>
              <div className="form-grid">
                <label>
                  {t('Current password', 'رمز فعلی')}
                  <input
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </label>
                <label>
                  {t(
                    'New password (12+ characters)',
                    'رمز جدید (حداقل ۱۲ نویسه)',
                  )}
                  <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                  />
                </label>
              </div>
              <button className="button primary">
                {t(
                  'Change password & revoke sessions',
                  'تغییر رمز و لغو نشست‌ها',
                )}
              </button>
            </form>
          </>
        )}
        {edit !== undefined && (
          <ProductEditor
            product={edit}
            onClose={() => setEdit(undefined)}
            onSaved={() => {
              setEdit(undefined);
              load();
              reload();
              setMessage(t('Product saved.', 'محصول ذخیره شد.'));
            }}
          />
        )}
        {confirm && (
          <Dialog
            title={t('Confirm destructive action', 'تأیید عملیات برگشت‌ناپذیر')}
            onClose={() => setConfirm(null)}
          >
            <p>
              {confirm.type === 'restore'
                ? t(
                    'Restore replaces products, settings, inquiry records and media metadata. A pre-restore snapshot is saved automatically. Type RESTORE to continue.',
                    'بازیابی، محصولات، تنظیمات، استعلام‌ها و اطلاعات رسانه را جایگزین می‌کند. نسخه قبل از بازیابی خودکار ذخیره می‌شود. برای ادامه RESTORE بنویسید.',
                  )
                : t(
                    'Type the exact code or filename to permanently delete this record:',
                    'برای حذف دائمی، کد یا نام فایل را دقیقاً وارد کنید:',
                  )}
            </p>
            <code>{confirm.p?.code || confirm.m?.name || 'RESTORE'}</code>
            <label>
              {t('Confirmation', 'تأیید')}
              <input value={typed} onChange={(e) => setTyped(e.target.value)} />
            </label>
            <button
              className="button danger"
              disabled={
                busy ||
                typed !== (confirm.p?.code || confirm.m?.name || 'RESTORE')
              }
              onClick={async () => {
                try {
                  if (confirm.type === 'restore')
                    await act('/system/restore', 'POST', {
                      backup,
                      confirm: typed,
                    });
                  else if (confirm.type === 'media')
                    await act('/media/' + confirm.m.id, 'DELETE', {
                      confirm: typed,
                    });
                  else
                    await act('/products/' + confirm.p.id, 'DELETE', {
                      confirm: typed,
                    });
                  setConfirm(null);
                } catch {}
              }}
            >
              {t('Confirm action', 'تأیید عملیات')}
            </button>
            <button className="button" onClick={() => setConfirm(null)}>
              {t('Cancel', 'انصراف')}
            </button>
          </Dialog>
        )}
      </div>
    </main>
  );
}

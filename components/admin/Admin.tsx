import type { AuthStatus, MediaRecord, SystemStatus } from '../../domain/api-contracts';
import type { BearingProduct } from '../../domain/product';
import { loadAdminData, type AdminData } from '../../lib/admin-data';
type Confirmation = { type: 'restore'; p?: never; m?: never } | { type: 'delete'; p: BearingProduct; m?: never } | { type: 'media'; m: MediaRecord; p?: never };
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Package,
  Inbox,
  Settings,
  LogOut,
  Image as ImageIcon,
  FileText,
  Building2,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
  Globe,
  PanelTop,
  ScrollText,
} from 'lucide-react';
import { api, ApiError, errorMessage } from '../../lib/api';
import { readMediaUpload } from '../../lib/media-upload';
import { usePlatform } from '../platform/Context';
import Dialog from '../platform/Dialog';
import ProductEditor from './ProductEditor';
import SettingsEditor from './SettingsEditor';
import WebsiteEditor from './WebsiteEditor';
import CatalogWorkspace from './CatalogWorkspace';
import MfaSetup from './MfaSetup';
import DashboardSummary from './DashboardSummary';
const tabs = [
  ['overview', 'Overview', 'نمای کلی', LayoutDashboard],
  ['products', 'Products', 'محصولات', Package],
  ['media', 'Media', 'رسانه', ImageIcon],
  ['company', 'Company', 'شرکت', Building2],
  ['inquiries', 'Inquiries', 'استعلام‌ها', Inbox],
  ['content', 'Website editor', 'ویرایشگر وب‌سایت', FileText],
  ['header', 'Header', 'سربرگ', PanelTop],
  ['seo', 'SEO', 'سئو', Globe],
  ['system', 'System & security', 'سیستم و امنیت', Settings],
  ['audit', 'Audit logs', 'گزارش رویدادها', ScrollText],
] as const;
const tabGroups = [
  { labelEn: 'Dashboard', labelFa: 'داشبورد', ids: ['overview'] },
  { labelEn: 'Catalog & communication', labelFa: 'کاتالوگ و ارتباطات', ids: ['products', 'media', 'inquiries'] },
  { labelEn: 'Website', labelFa: 'وب‌سایت', ids: ['content', 'header', 'company', 'seo'] },
  { labelEn: 'Administration', labelFa: 'مدیریت سامانه', ids: ['system', 'audit'] },
];
export default function Admin() {
  const { fa, t, toggle, reload, content } = usePlatform();
  const [status, setStatus] = useState<AuthStatus | null>(null),
    [tab, setTab] = useState('overview'),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState<{ data: AdminData; version: number; userId: string } | null>(null),
    [loadVersion, setLoadVersion] = useState(0),
    [q, setQ] = useState(''),
    [filter, setFilter] = useState('all'),
    [edit, setEdit] = useState<Partial<BearingProduct> | null | undefined>(undefined),
    [confirm, setConfirm] = useState<Confirmation | null>(null),
    [typed, setTyped] = useState(''),
    [backup, setBackup] = useState<unknown>(null),
    [settingsDirty, setSettingsDirty] = useState(false),
    [mobileMenuOpen, setMobileMenuOpen] = useState(false),
    [duplicateSource, setDuplicateSource] = useState('');
  const check = useCallback(() =>
    api('/auth/status')
      .then(setStatus)
      .catch((e) => setError(errorMessage(e))), []);
  useEffect(() => {
    void check();
  }, [check]);
  // Associate each response with its tab; never render another tab's payload.
  const data = loaded?.data.tab === tab && loaded.version === loadVersion && loaded.userId === status?.user?.id ? loaded.data : null;
  const load = () => { setError(''); setLoadVersion((version) => version + 1); };
  useEffect(() => {
    if (!status?.user) return;
    let cancelled = false;
    if (['content', 'header', 'company', 'seo'].includes(tab)) return;
    loadAdminData(tab).then((value) => {
      if (!cancelled) { setLoaded({data:value,version:loadVersion,userId:status.user!.id}); setError(''); }
    }).catch((e: unknown) => {
      if (cancelled) return;
      setError(errorMessage(e));
      if (e instanceof ApiError && e.status === 401) void check();
    });
    return () => { cancelled = true; };
  }, [tab, status?.user, loadVersion, check]);
  const act = async (path: string, method: string, body?: unknown) => {
    setBusy(true);
    try {
      const r = await api(path, method, body);
      setMessage('saved');
      setError('');
      load();
      reload();
      return r;
    } catch (e: unknown) {
      setError(errorMessage(e));
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
    setLoaded(null);
    setError('');
    setMobileMenuOpen(false);
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
  if (status.enrollmentRequired)
    return <main id="main" className="admin-login">
      <div className="login-intro">
        <h1>{t('Set up two-step verification', 'راه‌اندازی تأیید دومرحله‌ای')}</h1>
        <p>{t('Add your authenticator before opening the administration workspace. This enrollment session expires in ten minutes.', 'پیش از ورود به مدیریت، رمزساز خود را اضافه کنید. نشست راه‌اندازی پس از ده دقیقه منقضی می‌شود.')}</p>
        <button className="button" onClick={async () => { await api('/auth/logout', 'POST', {}); await check(); }}>{t('Sign out', 'خروج')}</button>
      </div>
      <MfaSetup onDone={check} />
    </main>;
  if (!status.user)
    return (
      <main id="main" className="admin-login">
        <div className="login-intro">
          <img
            className="admin-brand-logo"
            src={content?.brand?.logoUrl || '/brand/logo.png'}
            width={560}
            height={575}
            alt={t('Polad Charkhesh Arian Tech company logo', 'نشان شرکت پولاد چرخش آرین تک')}
          />
          <div className="section-label">POLAD CHARKHESH ARIAN TECH / ADMINISTRATION</div>
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
            } catch (e: unknown) {
              setError(errorMessage(e));
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
          {status.isConfigured && <label>
            {t('Authenticator or recovery code (if enabled)', 'کد رمزساز یا بازیابی (در صورت فعال بودن)')}
            <input dir="ltr" name="code" autoComplete="one-time-code" maxLength={35} />
          </label>}
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
        <button className="admin-mobile-toggle" aria-expanded={mobileMenuOpen} aria-controls="admin-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={18}/> : <Menu size={18}/>}
          {t('Management modules', 'بخش‌های مدیریت')}
        </button>
        <div className="section-label">
          {t('CONTROL CENTER', 'مرکز مدیریت')}
        </div>
        <strong>{status.user.username}</strong>
        <small>{status.user.role}</small>
        <nav id="admin-navigation" className={mobileMenuOpen ? 'open' : ''} aria-label={t('Admin navigation', 'ناوبری مدیریت')}>
          {tabGroups.map((group) => <div className="admin-nav-group" key={group.labelEn}>
            <span className="admin-nav-label">{t(group.labelEn, group.labelFa)}</span>
            {group.ids.map((id) => {
              if (id === 'audit' && status.user?.role !== 'superadmin') return null;
              const item = tabs.find(([key]) => key === id)!;
              const [k, e, f, Icon] = item;
              return <button key={k} className={tab === k ? 'active' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => changeTab(k)}>
                <Icon size={17} aria-hidden="true"/>{t(e, f)}
              </button>;
            })}
          </div>)}
        </nav>
        <button
          disabled={busy}
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
            setBusy(true);
            setError('');
            try {
              await api('/auth/logout', 'POST', {});
              setLoaded(null);
              setStatus(null);
              setSettingsDirty(false);
              await check();
            } catch (e: unknown) {
              if (e instanceof ApiError && e.status === 401) await check();
              else setError(e instanceof Error ? e.message : t('Sign out failed. Please retry.', 'خروج انجام نشد. دوباره تلاش کنید.'));
            } finally {
              setBusy(false);
            }
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
          <output className="success" >
            {message === 'saved' ? t('Saved successfully.', 'با موفقیت ذخیره شد.') : message === 'product-saved' ? t('Product saved.', 'محصول ذخیره شد.') : message === 'password-changed' ? t('Password changed. Sign in again.', 'رمز عبور تغییر کرد. دوباره وارد شوید.') : message}
          </output>
        )}
        {tab === 'overview' && <DashboardSummary key={status.user.id} onSessionExpired={check} />}
        {['content', 'header'].includes(tab) ? (
          <WebsiteEditor key={tab} initialTab={tab === 'header' ? 'header' : 'sections'} onDirty={setSettingsDirty} />
        ) : ['company', 'seo'].includes(tab) ? (
          <SettingsEditor key={tab} kind={tab} onDirty={setSettingsDirty} />
        ) : !data ? (
          <div className="state">
            {t('Loading workspace…', 'در حال دریافت اطلاعات…')}
          </div>
        ) : data.tab === 'overview' ? (
          <>
            <div className="admin-stats">
              {[
                ['products', 'Components', 'قطعه'],
                ['active', 'Active', 'فعال'],
                ['archived', 'Archived', 'بایگانی'],
                ['newInquiries', 'New inquiries', 'استعلام جدید'],
                ['factorsRecorded', 'Factors recorded', 'ضرایب ثبت‌شده'],
                ['brands', 'Referenced brands', 'برندهای ثبت‌شده'],
                ['media', 'Media files', 'فایل رسانه'],
                ['auditEvents', 'Audit events', 'رویداد ثبت‌شده'],
              ].map(([k, e, f]) => (
                <div key={k}>
                  <strong>{Number(data.value[k as keyof SystemStatus] ?? 0)}</strong>
                  <span>{t(e, f)}</span>
                </div>
              ))}
            </div>
            <p className="admin-metric-note">{t('Engineering factor coverage counts recorded values only; manufacturer verification is still required.', 'پوشش ضرایب مهندسی فقط مقادیر ثبت‌شده را می‌شمارد؛ تأیید با اطلاعات سازنده همچنان ضروری است.')}</p>
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
                <button className="button" onClick={() => changeTab('company')}>{t('Company settings', 'تنظیمات شرکت')}</button>
                <a className="button" href="/api/system/backup" download>{t('Export backup', 'دریافت پشتیبان')}</a>
              </div>
            </div>
          </>
        ) : data.tab === 'products' ? (
          <CatalogWorkspace products={data.value.products} request={act} canDelete={status.user.role === 'superadmin'}
            onEdit={p => { setDuplicateSource(''); setEdit(p); }}
            onDelete={p => { setConfirm({ type: 'delete', p }); setTyped(''); }}
            onDuplicate={p => {
              const template: Partial<BearingProduct> = structuredClone(p);
              for (const key of ['id', 'code', 'slug', 'createdAt', 'updatedAt', 'updatedBy', 'isArchived'] as const) delete template[key];
              setDuplicateSource(p.code); setEdit({ ...template, code: '', slug: '', featured: false });
            }} />
        ) : data.tab === 'inquiries' ? (
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
            {!data.value.inquiries.length ? (
              <div className="state">
                {t(
                  'No inquiries yet. Submitted website inquiries will appear here.',
                  'هنوز استعلامی ثبت نشده است. درخواست‌های وب‌سایت در اینجا نمایش داده می‌شوند.',
                )}
              </div>
            ) : (
              data.value.inquiries
                .filter(
                  (i) =>
                    JSON.stringify(i).toLowerCase().includes(q.toLowerCase()) &&
                    (filter === 'all' || i.status === filter),
                )
                .map((i) => (
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
        ) : data.tab === 'media' ? (
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
                aria-label={t('Upload media', 'بارگذاری رسانه')}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                disabled={busy}
                onChange={async (e) => {
                  const input = e.currentTarget;
                  const file = input.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  setError('');
                  setMessage('');
                  try {
                    await act('/media', 'POST', await readMediaUpload(file));
                  } catch (error: unknown) {
                    setError(error instanceof Error ? error.message : t('Upload failed. Please retry.', 'بارگذاری انجام نشد. دوباره تلاش کنید.'));
                  } finally {
                    input.value = '';
                    setBusy(false);
                  }
                }}
              />
            </div>
            <div className="media-grid">
              {data.value.media.map((m) => (
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
        ) : data.tab === 'audit' ? (
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
                {data.value.logs.map((l) => (
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
                {t('Database', 'پایگاه داده')}: {data.value.database} ·{' '}
                {t('Version', 'نسخه')}: {data.value.version} · {data.value.products}{' '}
                {t('products', 'محصول')}
              </p>
              {Boolean(data.value.securityAlerts?.length) && <div>
                <h4>{t('Recent security alerts', 'هشدارهای امنیتی اخیر')}</h4>
                <ul>{data.value.securityAlerts?.map((alert, i) => <li key={i}>
                  <time dateTime={alert.timestamp}>{new Date(alert.timestamp).toLocaleString(fa ? 'fa-IR' : 'en-GB')}</time>
                  {' · '}{alert.action === 'SECURITY_ALERT_ACCOUNT_LOCKED' ? t('Account temporarily locked after failed sign-ins', 'قفل موقت حساب پس از ورودهای ناموفق') : t('A recovery code was used', 'یک کد بازیابی استفاده شده است')}
                </li>)}</ul>
              </div>}
              {status.user.role === 'superadmin' && <a className="button" href="/api/system/backup" download>
                {t('Download secure backup', 'دریافت نسخه پشتیبان')}
              </a>}
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
                        } catch (e: unknown) {
                          setError(errorMessage(e));
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>
            {status.mfaAvailable && <MfaSetup enabled={status.mfaEnabled} onDone={check} />}
            <form
              className="panel"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = Object.fromEntries(new FormData(e.currentTarget));
                try {
                  await api('/auth/change-password', 'POST', form);
                  setMessage('password-changed');
                  await check();
                } catch (e: unknown) {
                  setError(errorMessage(e));
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
            duplicateSource={duplicateSource}
            onClose={() => setEdit(undefined)}
            onSaved={() => {
              setEdit(undefined);
              load();
              reload();
              setMessage('product-saved');
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
            {error && <p role="alert" className="error">{error}</p>}
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

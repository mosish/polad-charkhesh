import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Cpu,
  Database,
  Eye,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { usePlatform } from '../platform/Context';
import type { DashboardSnapshot } from '../../domain/dashboard';
import './dashboard.css';

export default function DashboardSummary({
  onSessionExpired,
}: {
  onSessionExpired: () => void;
}) {
  const { fa, t } = usePlatform();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(true),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true,
      pending = false;
    const update = async () => {
      if (pending || document.visibilityState !== 'visible') return;
      pending = true;
      setBusy(true);
      try {
        const value = await api('/system/dashboard');
        if (alive) {
          setSnapshot(value);
          setError(false);
        }
      } catch (failure) {
        if (alive) {
          setError(true);
          if (
            failure instanceof ApiError &&
            [401, 403].includes(failure.status)
          ) {
            setSnapshot(null);
            if (failure.status === 401) onSessionExpired();
          }
        }
      } finally {
        pending = false;
        if (alive) setBusy(false);
      }
    };
    void update();
    const timer = window.setInterval(() => void update(), 30_000);
    const visible = () => {
      if (document.visibilityState === 'visible') void update();
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [version, onSessionExpired]);
  const locale = fa ? 'fa-IR' : 'en-GB';
  const number = (value: number, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(
      value,
    );
  const bytes = (value: number) =>
    value >= 1024 ** 3
      ? `${number(value / 1024 ** 3, 1)} ${t('GB', 'گیگابایت')}`
      : `${number(value / 1024 ** 2, 0)} ${t('MB', 'مگابایت')}`;
  const duration = (seconds: number) => {
    const days = Math.floor(seconds / 86400),
      hours = Math.floor((seconds % 86400) / 3600),
      minutes = Math.floor((seconds % 3600) / 60);
    return days
      ? `${number(days)} ${t('d', 'روز')} ${number(hours)} ${t('h', 'ساعت')}`
      : hours
        ? `${number(hours)} ${t('h', 'ساعت')} ${number(minutes)} ${t('m', 'دقیقه')}`
        : `${number(minutes)} ${t('min', 'دقیقه')}`;
  };
  const website = snapshot?.website,
    server = snapshot?.server;
  const peak = Math.max(1, ...(website?.daily.map((day) => day.views) || []));
  const date = (day: string, short = false) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: 'Asia/Tehran',
      day: 'numeric',
      month: short ? 'numeric' : 'short',
    }).format(new Date(day + 'T12:00:00Z'));
  const memoryUsed = server
    ? Math.max(0, server.memory.totalBytes - server.memory.availableBytes)
    : 0;
  const meter = (value: number, total: number, label: string) => (
    <meter
      min={0}
      max={Math.max(1, total)}
      value={value}
      aria-label={label}
      className={value / total > 0.9 ? 'is-high' : ''}
    />
  );
  return (
    <section
      className="dashboard-summary"
      aria-labelledby="website-statistics-heading"
      aria-busy={busy}
    >
      <div className="dashboard-summary-heading">
        <div>
          <span className="section-label">
            {t('WEBSITE PULSE', 'نبض وب‌سایت')}
          </span>
          <h2 id="website-statistics-heading">
            {t(
              'Website statistics & server status',
              'آمار وب‌سایت و وضعیت سرور',
            )}
          </h2>
        </div>
        <div className="dashboard-refresh">
          <span>
            {snapshot
              ? t('Updated ', 'به‌روزرسانی ') +
                new Intl.DateTimeFormat(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZone: 'Asia/Tehran',
                }).format(new Date(snapshot.sampledAt))
              : t('Connecting…', 'در حال اتصال…')}
          </span>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => setVersion((value) => value + 1)}
            aria-label={t(
              'Refresh statistics and server status',
              'به‌روزرسانی آمار و وضعیت سرور',
            )}
          >
            <RefreshCw
              size={15}
              className={busy ? 'dashboard-refreshing' : ''}
            />
            {t('Refresh', 'به‌روزرسانی')}
          </button>
        </div>
      </div>
      {error && (
        <p className="dashboard-error" role="alert">
          {snapshot
            ? t(
                'Refresh failed. Values below are from the last successful update.',
                'به‌روزرسانی ناموفق بود. مقادیر زیر مربوط به آخرین دریافت موفق هستند.',
              )
            : t(
                'Statistics are unavailable. Use Refresh to try again.',
                'دریافت آمار ممکن نیست. برای تلاش دوباره، به‌روزرسانی را بزنید.',
              )}
        </p>
      )}
      {!snapshot && !error && (
        <p className="dashboard-loading">
          {t(
            'Loading website activity and server metrics…',
            'در حال دریافت آمار وب‌سایت و وضعیت سرور…',
          )}
        </p>
      )}
      {website && server && (
        <>
          <div className="dashboard-columns">
            <div className="dashboard-traffic">
              <div className="dashboard-card-title">
                <Eye size={17} />
                <h3>{t('Page views', 'بازدید صفحات')}</h3>
                <span>{t('Both domains', 'هر دو دامنه')}</span>
              </div>
              <div className="dashboard-totals">
                <div className="dashboard-today">
                  <strong>{number(website.today)}</strong>
                  <span>{t('Today', 'امروز')}</span>
                </div>
                <dl>
                  {[
                    [t('Yesterday', 'دیروز'), website.yesterday],
                    [t('Last 7 days', '۷ روز اخیر'), website.last7Days],
                    [t('Last 30 days', '۳۰ روز اخیر'), website.last30Days],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{number(Number(value))}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <ol
                className="dashboard-trend"
                aria-label={t(
                  'Daily page views over the last seven days',
                  'بازدید روزانه در هفت روز اخیر',
                )}
              >
                {website.daily.map((day) => (
                  <li
                    key={day.day}
                    aria-label={`${date(day.day)}: ${number(day.views)} ${t('views', 'بازدید')}`}
                  >
                    <span className="dashboard-bar-value" aria-hidden="true">
                      {number(day.views)}
                    </span>
                    <div className="dashboard-bar-track" aria-hidden="true">
                      <div style={{ height: `${(day.views / peak) * 100}%` }} />
                    </div>
                    <time dateTime={day.day} aria-hidden="true">
                      {date(day.day, true)}
                    </time>
                  </li>
                ))}
              </ol>
              {website.last7Days === 0 && (
                <p className="dashboard-empty">
                  {t(
                    'No page views recorded yet. Counts begin with this release.',
                    'هنوز بازدیدی ثبت نشده است. شمارش از زمان فعال‌سازی این نسخه آغاز می‌شود.',
                  )}
                </p>
              )}
              <div className="dashboard-domains">
                {website.domains.map((domain) => (
                  <div key={domain.domain}>
                    <span dir="ltr">{domain.domain}</span>
                    <strong>
                      {number(domain.views)}{' '}
                      <small>{t('views / 30 days', 'بازدید / ۳۰ روز')}</small>
                    </strong>
                  </div>
                ))}
              </div>
            </div>
            <div className={'dashboard-server' + (error ? ' is-stale' : '')}>
              <div className="dashboard-card-title">
                <Server size={17} />
                <h3>{t('Server status', 'وضعیت سرور')}</h3>
                <span
                  className={
                    'dashboard-status ' + (error ? 'is-stale' : 'is-online')
                  }
                >
                  <i />
                  {error ? t('Stale', 'قدیمی') : t('Online', 'فعال')}
                </span>
              </div>
              <div className="dashboard-services">
                <span>
                  <Activity size={14} />
                  {error
                    ? t('Last response: online', 'آخرین پاسخ: فعال')
                    : t('Application responding', 'برنامه پاسخ‌گو است')}
                </span>
                <span>
                  <Database size={14} />
                  {error
                    ? t(
                        'Last database check: connected',
                        'آخرین بررسی پایگاه داده: متصل',
                      )
                    : t('Database connected', 'پایگاه داده متصل است')}
                </span>
              </div>
              <dl className="dashboard-resources">
                <div>
                  <dt>
                    <Cpu size={15} />
                    {t('CPU usage', 'مصرف پردازنده')}
                  </dt>
                  <dd>
                    {server.cpuPercent === null
                      ? t('Sampling…', 'در حال نمونه‌گیری…')
                      : number(server.cpuPercent, 1) + (fa ? '٪' : '%')}
                  </dd>
                  {server.cpuPercent !== null &&
                    meter(
                      server.cpuPercent,
                      100,
                      t('CPU usage', 'مصرف پردازنده'),
                    )}
                  <small>
                    {number(server.cpuCores)}{' '}
                    {t(
                      'logical cores · since previous sample',
                      'هسته منطقی · از نمونه قبلی',
                    )}
                  </small>
                </div>
                <div>
                  <dt>
                    <MemoryStick size={15} />
                    {t('System memory in use', 'حافظه در حال استفاده')}
                  </dt>
                  <dd>
                    {bytes(memoryUsed)}{' '}
                    <span>/ {bytes(server.memory.totalBytes)}</span>
                  </dd>
                  {meter(
                    memoryUsed,
                    server.memory.totalBytes,
                    t(
                      'Memory in use including OS cache',
                      'حافظه مصرفی شامل حافظه نهان سیستم',
                    ),
                  )}
                  <small>
                    {t(
                      'Includes OS cache · app: ',
                      'شامل حافظه نهان سیستم · برنامه: ',
                    )}
                    {bytes(server.memory.processBytes)}
                  </small>
                </div>
                <div>
                  <dt>
                    <HardDrive size={15} />
                    {t('Data disk available', 'فضای آزاد دیسک داده')}
                  </dt>
                  <dd>
                    {server.disk
                      ? bytes(server.disk.availableBytes)
                      : t('Unavailable', 'در دسترس نیست')}
                  </dd>
                  {server.disk &&
                    meter(
                      server.disk.totalBytes - server.disk.availableBytes,
                      server.disk.totalBytes,
                      t('Data disk usage', 'مصرف دیسک داده'),
                    )}
                  <small>
                    {server.disk
                      ? t('Total capacity: ', 'ظرفیت کل: ') +
                        bytes(server.disk.totalBytes)
                      : t(
                          'Filesystem metrics are unavailable.',
                          'دریافت وضعیت دیسک ممکن نیست.',
                        )}
                  </small>
                </div>
              </dl>
              <div className="dashboard-uptime">
                <Clock3 size={16} />
                <div>
                  <span>{t('Application uptime', 'زمان فعالیت برنامه')}</span>
                  <strong>{duration(server.applicationUptimeSeconds)}</strong>
                </div>
                <div>
                  <span>{t('Server uptime', 'زمان فعالیت سرور')}</span>
                  <strong>{duration(server.serverUptimeSeconds)}</strong>
                </div>
              </div>
            </div>
          </div>
          {website.topPages.length > 0 && (
            <div className="dashboard-top-pages">
              <h3>
                {t('Top pages · last 30 days', 'صفحات پربازدید · ۳۰ روز اخیر')}
              </h3>
              <ol>
                {website.topPages.map((page) => (
                  <li key={page.path}>
                    <a href={page.path} target="_blank" rel="noreferrer">
                      <span dir="ltr">{page.path}</span>
                      <ArrowUpRight size={13} />
                    </a>
                    <strong>{number(page.views)}</strong>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="dashboard-footnote">
            {t(
              'Page views, not unique visitors. No tracking cookies or stored visitor IPs. Tehran time · refreshes every 30 seconds · 90-day aggregate retention.',
              'این آمار تعداد بازدید صفحات است، نه کاربران یکتا. بدون کوکی رهگیری یا ذخیره IP بازدیدکننده. زمان تهران · به‌روزرسانی هر ۳۰ ثانیه · نگهداری آمار تجمیعی تا ۹۰ روز.',
            )}
          </p>
        </>
      )}
    </section>
  );
}

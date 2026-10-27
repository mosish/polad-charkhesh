import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from './database';
import { publicPagePaths } from '../domain/catalog-hubs';
import type { WebsiteStatistics } from '../domain/dashboard';

const dayMs = 86_400_000;
const retentionDays = 90;
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
export function statisticsDay(now = new Date()) {
  return formatter.format(now);
}
function shiftDay(day: string, offset: number) {
  return new Date(Date.parse(day + 'T00:00:00Z') + offset * dayMs)
    .toISOString()
    .slice(0, 10);
}

export function trackedPath(value: unknown): string | null {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.length > 240 ||
    /[?#\\\s]/.test(value) ||
    Array.from(value).some((character) => character.charCodeAt(0) < 32)
  )
    return null;
  const route = value.replace(/\/+$/, '') || '/';
  if (publicPagePaths().includes(route)) return route;
  if (!route.startsWith('/product/')) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(route.slice(9));
  } catch {
    return null;
  }
  const product = db
    .prepare('SELECT slug FROM products WHERE slug=? AND archived=0')
    .get(slug);
  return product
    ? '/product/' + encodeURIComponent(String(product.slug))
    : null;
}

// Short-lived, bounded admission control. No visitor IP, UA or identifier is
// persisted in analytics. This per-process key is replaced on every restart.
const limiterKey = crypto.randomBytes(32);
const buckets = new Map<string, { count: number; expires: number }>();
let globalWindow = { count: 0, expires: 0 };
function admitted(ip: string, now: number) {
  if (globalWindow.expires <= now) {
    globalWindow = { count: 0, expires: now + 60_000 };
    for (const [key, bucket] of buckets)
      if (bucket.expires <= now) buckets.delete(key);
  }
  if (++globalWindow.count > 1200) return false;
  const key = crypto.createHmac('sha256', limiterKey).update(ip).digest('hex');
  let bucket = buckets.get(key);
  if (!bucket || bucket.expires <= now) {
    if (!bucket && buckets.size >= 4096) return false;
    bucket = { count: 0, expires: now + 60_000 };
    buckets.set(key, bucket);
  }
  return ++bucket.count <= 60;
}

export const analytics = Router();
let lastPrunedDay = '';
export function pruneWebsiteStatistics(now = new Date()) {
  const day = statisticsDay(now);
  if (lastPrunedDay !== day) {
    db.prepare('DELETE FROM website_pageviews WHERE day<?').run(
      shiftDay(day, -(retentionDays - 1)),
    );
    lastPrunedDay = day;
  }
}
analytics.post('/pageview', (req, res) => {
  // Only same-origin browser reports are accepted. No public statistics read API.
  if (
    req.get('origin') !== `${req.protocol}://${req.get('host')}` ||
    (req.get('sec-fetch-site') && req.get('sec-fetch-site') !== 'same-origin')
  )
    return res.status(403).json({ error: 'Same-origin page view required.' });
  if (
    req.get('DNT') === '1' ||
    req.get('Sec-GPC') === '1' ||
    /bot|crawler|spider|headless|lighthouse|slurp/i.test(
      req.get('user-agent') || '',
    )
  )
    return res.sendStatus(204);
  const route = trackedPath(req.body?.path);
  const language = req.body?.language;
  const domain = req.hostname.toLowerCase();
  if (
    !route ||
    !['en', 'fa'].includes(language) ||
    ![
      'poladcharkhesh.ir',
      'poladcharkhesh.com',
      'localhost',
      '127.0.0.1',
    ].includes(domain) ||
    !req.body ||
    Object.keys(req.body).some((key) => !['path', 'language'].includes(key))
  )
    return res.status(400).json({ error: 'Invalid public page view.' });
  if (!admitted(req.ip || '', Date.now()))
    return res.status(429).json({ error: 'Page view limit reached.' });
  const day = statisticsDay();
  pruneWebsiteStatistics();
  db.prepare(`INSERT INTO website_pageviews(day,domain,path,language,views) VALUES(?,?,?,?,1)
    ON CONFLICT(day,domain,path,language) DO UPDATE SET views=views+1`).run(
    day,
    domain,
    route,
    language,
  );
  res.sendStatus(204);
});

export function websiteStatistics(now = new Date()): WebsiteStatistics {
  const today = statisticsDay(now),
    yesterday = shiftDay(today, -1);
  const since7 = shiftDay(today, -6),
    since30 = shiftDay(today, -29);
  const total = (from: string, to = today) =>
    Number(
      db
        .prepare(
          'SELECT COALESCE(SUM(views),0) n FROM website_pageviews WHERE day BETWEEN ? AND ?',
        )
        .get(from, to)!.n,
    );
  const rows = db
    .prepare(
      'SELECT day,SUM(views) views FROM website_pageviews WHERE day BETWEEN ? AND ? GROUP BY day',
    )
    .all(since7, today) as { day: string; views: number }[];
  return {
    startedAt: String(
      db
        .prepare(
          'SELECT started_at FROM website_statistics_metadata WHERE id=1',
        )
        .get()!.started_at,
    ),
    timezone: 'Asia/Tehran',
    retentionDays,
    today: total(today),
    yesterday: total(yesterday, yesterday),
    last7Days: total(since7),
    last30Days: total(since30),
    daily: Array.from({ length: 7 }, (_, index) => {
      const day = shiftDay(today, index - 6);
      return {
        day,
        views: Number(rows.find((row) => row.day === day)?.views || 0),
      };
    }),
    domains: ['poladcharkhesh.ir', 'poladcharkhesh.com'].map((domain) => ({
      domain,
      views: Number(
        db
          .prepare(
            'SELECT COALESCE(SUM(views),0) n FROM website_pageviews WHERE domain=? AND day BETWEEN ? AND ?',
          )
          .get(domain, since30, today)!.n,
      ),
    })),
    topPages: db
      .prepare(
        'SELECT path,SUM(views) views FROM website_pageviews WHERE day BETWEEN ? AND ? GROUP BY path ORDER BY views DESC,path LIMIT 5',
      )
      .all(since30, today) as { path: string; views: number }[],
  };
}

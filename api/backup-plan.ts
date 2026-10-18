import type { BearingProduct } from '../domain/product';
import { seoDefaults } from '../domain/seo';
import { upgradeContent } from '../domain/site-content';
import { object } from './content-validation';
import { readProductRecord } from './product-record';
import { sameShape } from './settings-shape';
import { safeObject, validateSettings } from './validation';

interface InquiryRow {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  data: string;
}
interface MediaRow {
  id: string;
  data: string;
}
const kinds = ['company', 'content', 'seo'] as const;
type Settings = Record<(typeof kinds)[number], unknown>;
export interface RestorePlan extends Settings {
  products: BearingProduct[];
  inquiries: InquiryRow[];
  media: MediaRow[];
}
type RestoreResult =
  | { backup: RestorePlan; error?: never }
  | { backup?: never; error: string };

function jsonObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    return object(value) && safeObject(value) ? value : null;
  } catch {
    return null;
  }
}

/** Validate the complete backup before the transaction starts. Never mutate input. */
export function planRestore(input: unknown, current: Settings): RestoreResult {
  if (
    !object(input) ||
    input.version !== 1 ||
    !safeObject(input) ||
    !Array.isArray(input.products) ||
    !input.products.length ||
    input.products.length > 10000
  )
    return { error: 'Invalid backup or confirmation.' };
  const products: BearingProduct[] = [];
  for (const value of input.products as unknown[]) {
    const result = readProductRecord(value);
    if (!result.product) return { error: result.errors.join(' ') };
    products.push(result.product);
  }
  if (
    new Set(products.map((p) => p.id)).size !== products.length ||
    new Set(products.map((p) => p.slug)).size !== products.length ||
    new Set(products.map((p) => p.code.toLowerCase())).size !== products.length
  )
    return { error: 'Duplicate product identities in backup.' };
  if (!object(input.content)) return { error: 'Invalid backup content.' };
  const content: unknown = upgradeContent(input.content);
  // Version-1 backups predate route-specific SEO. Add only that missing group.
  const seo =
    object(input.seo) && input.seo.pages === undefined
      ? { ...input.seo, pages: structuredClone(seoDefaults.pages) }
      : input.seo;
  const settings: Settings = { company: input.company, content, seo };
  for (const kind of kinds)
    if (
      validateSettings(kind, settings[kind]).length ||
      (kind !== 'content' && !sameShape(settings[kind], current[kind]))
    )
      return { error: 'Invalid backup settings.' };
  if (!Array.isArray(input.inquiries) || !Array.isArray(input.media))
    return { error: 'Invalid backup collections.' };
  const inquiries: InquiryRow[] = [];
  const media: MediaRow[] = [];
  for (const row of input.inquiries as unknown[]) {
    if (
      !object(row) ||
      typeof row.id !== 'string' ||
      typeof row.data !== 'string' ||
      typeof row.created_at !== 'string' ||
      typeof row.updated_at !== 'string' ||
      typeof row.status !== 'string' ||
      !['new', 'reviewed', 'contacted', 'closed'].includes(row.status)
    )
      return { error: 'Invalid inquiry record.' };
    const value = jsonObject(row.data);
    if (!value || typeof value.message !== 'string')
      return { error: 'Invalid inquiry record.' };
    inquiries.push({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      status: row.status,
      data: row.data,
    });
  }
  for (const row of input.media as unknown[]) {
    if (
      !object(row) ||
      typeof row.id !== 'string' ||
      typeof row.data !== 'string'
    )
      return { error: 'Invalid media record.' };
    const value = jsonObject(row.data);
    if (
      !value ||
      typeof value.mime !== 'string' ||
      !['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(
        value.mime,
      ) ||
      typeof value.url !== 'string' ||
      !/^\/uploads\/[a-z0-9.-]+$/.test(value.url)
    )
      return { error: 'Invalid media metadata.' };
    media.push({ id: row.id, data: row.data });
  }
  if (
    new Set(inquiries.map((row) => row.id)).size !== inquiries.length ||
    new Set(media.map((row) => row.id)).size !== media.length
  )
    return { error: 'Duplicate collection identities in backup.' };
  return { backup: { ...settings, products, inquiries, media } };
}

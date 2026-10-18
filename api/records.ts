import type { SQLOutputValue } from 'node:sqlite';
import type { CompanyContactInfo } from '../domain/company';
import type { SeoSettings } from '../domain/seo';
import type { SiteContent } from '../domain/site-content';

export interface SessionUser {
  id: string;
  username: string;
  role: 'superadmin' | 'editor';
}
export interface AdminRecord extends SessionUser {
  password_hash: string;
}
export interface MediaRecord {
  id: string;
  name: string;
  mime: 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';
  size: number;
  url: string;
  createdAt: string;
}
export interface InquiryData {
  name: string;
  phone: string;
  company: string;
  email: string;
  message: string;
}
export interface PublishedSettings {
  company: CompanyContactInfo;
  content: SiteContent;
  seo: SeoSettings;
}

/** Decode JSON from our database, not an upload. T describes the persisted
 * contract; it does not validate JSON. External input must be validated first. */
export function parse<T = unknown>(row: Record<string, SQLOutputValue>): T;
export function parse<T = unknown>(
  row: Record<string, SQLOutputValue> | undefined,
): T | null;
export function parse<T = unknown>(
  row: Record<string, SQLOutputValue> | undefined,
): T | null {
  if (!row) return null;
  if (typeof row.data !== 'string')
    throw new Error('Expected a stored JSON text column.');
  return JSON.parse(row.data) as T;
}

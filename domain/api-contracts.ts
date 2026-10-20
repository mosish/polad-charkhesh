import type { BearingProduct } from './product';
import type { CompanyContactInfo } from './company';
import type { SiteContent } from './site-content';
import type { SeoSettings } from './seo';
import type { SessionUser, MediaRecord, InquiryData } from '../api/records';
export type { SessionUser, MediaRecord } from '../api/records';
export interface AuthStatus {
  isConfigured: boolean; user: SessionUser | null;
  enrollmentRequired?: boolean; mfaEnabled?: boolean; mfaAvailable?: boolean; mfaRequired?: boolean;
}
export interface Inquiry extends InquiryData { id: string; status: 'new' | 'reviewed' | 'contacted' | 'closed'; created_at: string; updated_at: string }
export interface AuditLog { id: string; timestamp: string; actor: string; action: string; entity: string }
export interface SystemStatus { version: string; database: string; products: number; active: number; archived: number; inquiries: number; newInquiries: number; media: number; auditEvents: number; brands: number; factorsRecorded: number; securityAlerts?: { timestamp: string; action: string }[] }
export interface ApiReads {
  '/auth/status': AuthStatus;
  '/products': { products: BearingProduct[]; count: number };
  '/products?includeArchived=true': { products: BearingProduct[]; count: number };
  '/company': { data: CompanyContactInfo };
  '/content': { data: SiteContent };
  '/seo': { data: SeoSettings; indexingEnabled?: boolean };
  '/media': { media: MediaRecord[] };
  '/inquiries': { inquiries: Inquiry[] };
  '/system/audit': { logs: AuditLog[] };
  '/system/status': SystemStatus;
}

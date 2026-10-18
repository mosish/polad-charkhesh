import { api } from './api';
import type { ApiReads } from '../domain/api-contracts';
export type AdminData =
  | { tab: 'overview' | 'system'; value: ApiReads['/system/status'] }
  | { tab: 'products'; value: ApiReads['/products'] }
  | { tab: 'inquiries'; value: ApiReads['/inquiries'] }
  | { tab: 'media'; value: ApiReads['/media'] }
  | { tab: 'audit'; value: ApiReads['/system/audit'] };
export async function loadAdminData(tab: string): Promise<AdminData> {
  switch (tab) {
    case 'products': return { tab, value: await api('/products?includeArchived=true') };
    case 'inquiries': return { tab, value: await api('/inquiries') };
    case 'media': return { tab, value: await api('/media') };
    case 'audit': return { tab, value: await api('/system/audit') };
    case 'overview': case 'system': return { tab, value: await api('/system/status') };
    default: throw new Error('Unsupported admin workspace.');
  }
}

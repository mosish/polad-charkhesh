import { useRef, useState } from 'react';
import type { BearingProduct } from '../../domain/product';
import { productGaps, gapLabels, type CatalogGap } from '../../lib/catalog-quality';
import { usePlatform } from '../platform/Context';
import { api } from '../../lib/api';
import Dialog from '../platform/Dialog';

type Props = {
  products: BearingProduct[];
  onEdit: (product: BearingProduct | null) => void;
  onDuplicate: (product: BearingProduct) => void;
  onDelete: (product: BearingProduct) => void;
  canDelete: boolean;
  request: (path: string, method: string, body?: unknown) => Promise<unknown>;
};
type Preview = { revision: string; created: number; updated: number; rows: { code: string; action: string; changes: { field: string; before: unknown; after: unknown }[] }[] };
export default function CatalogWorkspace({ products, onEdit, onDuplicate, onDelete, canDelete, request }: Props) {
  const { t, fa } = usePlatform();
  const [query, setQuery] = useState(''), [status, setStatus] = useState('all');
  const [gap, setGap] = useState<CatalogGap | ''>('');
  const [selected, setSelected] = useState<string[]>([]), [action, setAction] = useState('feature');
  const [brands, setBrands] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [pendingBulk, setPendingBulk] = useState(false);
  const [importRows, setImportRows] = useState<unknown[]>([]), [preview, setPreview] = useState<Preview | null>(null);
  const [filename, setFilename] = useState(''), [reviewed, setReviewed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const visible = products.filter(p => (p.code + ' ' + p.nameEn + ' ' + p.nameFa + ' ' + p.brands.join(' ')).toLowerCase().includes(query.toLowerCase()) &&
    (status === 'all' || (status === 'archived' ? p.isArchived : !p.isArchived)) && (!gap || productGaps(p).includes(gap)));
  const download = (name: string, records: unknown) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const execute = async (path: string, body: unknown) => {
    setBusy(true); setError('');
    try { await request(path, 'POST', body); setSelected([]); setPreview(null); setPendingBulk(false); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  const actions = [
    ['feature', 'Mark featured', 'شاخص کردن'], ['unfeature', 'Remove featured', 'حذف شاخص'],
    ['archive', 'Archive', 'بایگانی'], ['restore', 'Restore', 'بازیابی'],
    ['brands', 'Set manufacturers', 'تعیین سازندگان'],
  ];
  const loadImport = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError(''); setPreview(null); setReviewed(false); setFilename(file.name);
    try {
      if (file.size > 2_000_000) throw new Error(t('The file must be smaller than 2 MB.', 'حجم فایل باید کمتر از ۲ مگابایت باشد.'));
      const parsed = JSON.parse(await file.text());
      const rows = Array.isArray(parsed) ? parsed : parsed.products;
      if (!Array.isArray(rows) || !rows.length || rows.length > 200) throw new Error(t('Provide a JSON array of 1–200 products.', 'آرایه JSON شامل ۱ تا ۲۰۰ محصول وارد کنید.'));
      const result = await api<Preview>('/products/import', 'POST', { products: rows, preview: true });
      setImportRows(rows); setPreview(result);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return <>
    <div className="catalog-quality-cards" aria-label={t('Catalog content coverage', 'پوشش محتوای کاتالوگ')}>
      {(Object.keys(gapLabels) as CatalogGap[]).map(key => <button key={key} aria-pressed={gap === key} onClick={() => setGap(gap === key ? '' : key)}>
        <strong>{products.filter(p => !p.isArchived && productGaps(p).includes(key)).length}</strong><span>{t(gapLabels[key][0], gapLabels[key][1])}</span>
      </button>)}
    </div>
    <p className="admin-metric-note">{t('Counts cover active records. A recorded image or source link still needs manufacturer verification.', 'آمار مربوط به رکوردهای فعال است. تصویر یا پیوند ثبت‌شده همچنان باید با سازنده تطبیق داده شود.')}</p>
    <div className="catalog-toolbar catalog-maintenance-toolbar">
      <input aria-label={t('Search products', 'جستجوی محصولات')} placeholder={t('Code, name or manufacturer…', 'کد، نام یا سازنده…')} value={query} onChange={e => setQuery(e.target.value)} />
      <select aria-label={t('Record status', 'وضعیت رکورد')} value={status} onChange={e => setStatus(e.target.value)}>
        <option value="all">{t('All', 'همه')}</option><option value="active">{t('Active', 'فعال')}</option><option value="archived">{t('Archived', 'بایگانی')}</option>
      </select>
      <select aria-label={t('Missing content filter', 'فیلتر محتوای ناقص')} value={gap} onChange={e => setGap(e.target.value as CatalogGap | '')}>
        <option value="">{t('All content', 'همه محتوا')}</option>{(Object.keys(gapLabels) as CatalogGap[]).map(key => <option key={key} value={key}>{t(gapLabels[key][0], gapLabels[key][1])}</option>)}
      </select>
      <button className="button primary" onClick={() => onEdit(null)}>{t('Add product', 'افزودن محصول')}</button>
    </div>
    <div className="catalog-maintenance-actions">
      <button className="button" onClick={() => download('polad-catalog.json', { products })}>{t('Export catalog JSON', 'دریافت JSON کاتالوگ')}</button>
      <button className="button" disabled={busy} onClick={() => input.current?.click()}>{t('Import JSON · preview first', 'ورود JSON · پیش‌نمایش اولیه')}</button>
      <input hidden type="file" accept=".json,application/json" ref={input} onChange={e => { void loadImport(e.target.files?.[0]); }} />
      <button className="button" onClick={() => download('polad-product-template.json', [{
        code: 'YOUR-CODE', slug: 'your-code', category: 'ball', schematicType: 'deep-groove',
        nameEn: '', nameFa: '', descriptionEn: '', descriptionFa: '', d: 0, D: 0, B: 0,
        weightKg: 0, crKn: 0, corKn: 0, speedGreaseRpm: 0, speedOilRpm: 0,
        cageMaterialEn: '', cageMaterialFa: '', sealingEn: '', sealingFa: '',
        clearanceOptions: [], applicationsEn: [], applicationsFa: [], brands: [], imageUrl: '', pdfUrl: '',
      }])}>{t('Download import template', 'دریافت الگوی ورود')}</button>
    </div>
    <p className="admin-metric-note">{t('JSON imports match existing records by product code. New codes create records; matching codes update supplied fields. Up to 200 rows per file.', 'ورود JSON بر اساس کد محصول تطبیق می‌دهد. کد جدید رکورد می‌سازد و کد موجود فقط فیلدهای ارائه‌شده را به‌روز می‌کند. حداکثر ۲۰۰ ردیف در هر فایل.')}</p>
    {error && <p className="error import-errors" role="alert">{error}</p>}
    <div className="catalog-bulk-bar">
      <span>{selected.length} {t('selected', 'انتخاب‌شده')} · {visible.length} {t('shown', 'نمایش داده‌شده')}</span>
      <button disabled={!visible.length || busy} onClick={() => setSelected(visible.slice(0, 200).map(p => p.id))}>{t('Select filtered results', 'انتخاب نتایج فیلتر')}</button>
      <button disabled={!selected.length || busy} onClick={() => setSelected([])}>{t('Clear selection', 'پاک کردن انتخاب')}</button>
      <select aria-label={t('Bulk action', 'عملیات گروهی')} value={action} onChange={e => setAction(e.target.value)}>{actions.map(([key, en, fa]) => <option value={key} key={key}>{t(en, fa)}</option>)}</select>
      {action === 'brands' && <input aria-label={t('Manufacturers separated by commas', 'سازندگان با کاما جدا شوند')} value={brands} onChange={e => setBrands(e.target.value)} placeholder="SKF, NSK" />}
      <button className="button" disabled={busy || !selected.length || (action === 'brands' && !brands.trim())} onClick={() => setPendingBulk(true)}>{t('Review bulk change', 'بررسی تغییر گروهی')}</button>
    </div>
    <div className="table-scroll"><table className="catalog-admin-table"><thead><tr><th>{t('Select', 'انتخاب')}</th><th>{t('Component', 'قطعه')}</th><th dir="ltr">d / D / B</th><th>{t('Content to complete', 'محتوای نیازمند تکمیل')}</th><th>{t('Actions', 'عملیات')}</th></tr></thead><tbody>
      {visible.map(p => <tr key={p.id}><td><input type="checkbox" aria-label={t('Select component', 'انتخاب قطعه') + ' ' + p.code} checked={selected.includes(p.id)} disabled={busy || (!selected.includes(p.id) && selected.length >= 200)} onChange={e => setSelected(e.target.checked ? [...selected, p.id] : selected.filter(id => id !== p.id))} /></td>
        <td><code>{p.code}</code><small>{p[fa ? 'nameFa' : 'nameEn']}</small><small>{p.isArchived ? t('Archived', 'بایگانی') : t('Active', 'فعال')}{p.featured ? ' · ' + t('Featured', 'شاخص') : ''}</small></td>
        <td dir="ltr">{p.d} / {p.D} / {p.B}</td><td><div className="quality-badges">{productGaps(p).map(key => <span key={key}>{t(gapLabels[key][0], gapLabels[key][1])}</span>)}{!productGaps(p).length && <span className="complete">{t('Content recorded', 'محتوا ثبت شده')}</span>}</div></td>
        <td><div className="table-actions"><button disabled={busy} onClick={() => onEdit(p)}>{t('Edit', 'ویرایش')}</button><button disabled={busy} onClick={() => onDuplicate(p)}>{t('Duplicate', 'رونوشت')}</button><button disabled={busy} onClick={() => { void execute('/products/bulk', { ids: [p.id], action: p.isArchived ? 'restore' : 'archive' }); }}>{p.isArchived ? t('Restore', 'بازیابی') : t('Archive', 'بایگانی')}</button>{p.isArchived && canDelete && <button className="danger" onClick={() => onDelete(p)}>{t('Delete', 'حذف')}</button>}</div></td>
      </tr>)}
    </tbody></table></div>
    {!visible.length && <p className="state">{t('No products match these filters.', 'محصولی مطابق این فیلترها یافت نشد.')}</p>}
    {pendingBulk && <Dialog title={t('Review bulk change', 'بررسی تغییر گروهی')} onClose={() => { if (!busy) setPendingBulk(false); }}>
      <p>{t('This change applies to every selected record, including selections outside the current filter.', 'این تغییر روی همه رکوردهای انتخاب‌شده، حتی موارد خارج از فیلتر فعلی، اعمال می‌شود.')}</p>
      <strong>{selected.length} · {t(actions.find(x => x[0] === action)![1], actions.find(x => x[0] === action)![2])}</strong>
      {action === 'brands' && <p>{brands}</p>}<p className="bulk-codes" dir="ltr">{products.filter(p => selected.includes(p.id)).map(p => p.code).join(' · ')}</p>
      <button className="button primary" disabled={busy} onClick={() => { void execute('/products/bulk', { ids: selected, action, brands: brands.split(',').map(x => x.trim()).filter(Boolean) }); }}>{t('Apply to selected products', 'اعمال روی محصولات انتخاب‌شده')}</button>
      {error && <p className="error" role="alert">{error}</p>}
    </Dialog>}
    {preview && <Dialog title={t('Import preview', 'پیش‌نمایش ورود')} onClose={() => { if (!busy) setPreview(null); }}>
      <p dir="auto">{filename}</p><p>{preview.created} {t('new records', 'رکورد جدید')} · {preview.updated} {t('updates', 'به‌روزرسانی')}</p>
      <div className="import-preview-list">{preview.rows.map((row, i) => <details key={i}><summary><code>{row.code}</code> · {row.action === 'create' ? t('Create', 'ایجاد') : t('Update', 'به‌روزرسانی')} · {row.changes.length} {t('changed fields', 'فیلد تغییر یافته')}</summary><dl>{row.changes.map(change => <div key={change.field}><dt>{change.field}</dt><dd><del>{JSON.stringify(change.before)?.slice(0, 300)}</del><span> → {JSON.stringify(change.after)?.slice(0, 300)}</span></dd></div>)}</dl></details>)}</div>
      <label className="import-review"><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />{t('I reviewed these records and their manufacturer data.', 'رکوردها و داده‌های سازنده را بررسی کردم.')}</label>
      <button className="button primary" disabled={busy || !reviewed} onClick={() => { void execute('/products/import', { products: importRows, confirm: 'IMPORT', revision: preview.revision }); }}>{t('Save imported records', 'ذخیره رکوردهای واردشده')}</button>
      {error && <p className="error import-errors" role="alert">{error}</p>}
    </Dialog>}
  </>;
}

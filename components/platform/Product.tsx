import ManufacturerLibrary from './ManufacturerLibrary';
import { BearingViewer } from './Viewer';
import Copy from './Copy';
import { mediaFor } from '../../lib/media';
import { useEffect, useState } from 'react';
import { ArrowRight, Download, ArrowUpRight } from 'lucide-react';
import type { BearingProduct } from '../../domain/product';
import { usePlatform, DataState } from './Context';
import Dialog from './Dialog';
import { Schematic } from './Schematic';
export function ProductImage({ p }: { p: BearingProduct }) {
  const { content } = usePlatform();
  const [failed, setFailed] = useState(false);
  const media = mediaFor(p, content);
  useEffect(() => setFailed(false), [media.url]);
  return p.category === 'lubricant' && !media.url ? (
    <div className="non-bearing-tech">
      <strong>
        {p.weightKg}
        <Copy text="kg" />
      </strong>
      <small>
        <Copy text="Lubricant · technical reference" />
      </small>
    </div>
  ) : failed || !media.url ? (
    <Schematic p={p} />
  ) : (
    <>
      <img
        src={media.url}
        alt={media.reference ? 'Bearing family reference image' : p.nameEn}
        onError={() => setFailed(true)}
        loading="lazy"
        width={640}
        height={640}
      />
      {media.reference && (
        <small className="reference-label">
          <Copy text="Family reference · illustration only" />
        </small>
      )}
    </>
  );
}
export function ProductCard({
  p,
  onSelect,
}: {
  p: BearingProduct;
  onSelect: (p: BearingProduct) => void;
}) {
  const { fa, t } = usePlatform();
  return (
    <button
      type="button"
      className="product-card"
      aria-label={t('View product details', 'مشاهده جزئیات محصول') + ' ' + p.code}
      onClick={() => onSelect(p)}
    >
      <div className="product-photo">
        <ProductImage p={p} />
        <span>{p.schematicType.replaceAll('-', ' ')}</span>
        <ArrowUpRight size={18} />
      </div>
      <div className="product-info">
        <code dir="ltr">{p.code}</code>
        <h3>{p[fa ? 'nameFa' : 'nameEn']}</h3>
        <p className="dimension-row" dir="ltr">
          <span>
            <Copy text="d" />
            <b>{p.d}</b>
          </span>
          <span>
            <Copy text="D" />
            <b>{p.D}</b>
          </span>
          <span>
            <Copy text="B" />
            <b>{p.B}</b>
          </span>
          <small>
            <Copy text="mm" />
          </small>
        </p>
        <span className="card-cta">
          {t('View technical specifications', 'مشاهده مشخصات فنی')}
          <ArrowRight size={16} />
        </span>
      </div>
    </button>
  );
}
export async function datasheet(
  p: BearingProduct,
  company: any,
  content?: any,
) {
  const { buildDatasheet } = await import('../../lib/pdf');
  const media = mediaFor(p, content);
  const fontResponse = await fetch('/fonts/IRANSans.ttf');
  if (!fontResponse.ok)
    throw new Error('PDF font could not be loaded. Please retry.');
  const bytes = new Uint8Array(await fontResponse.arrayBuffer());
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  let image: string | undefined;
  if (media.url) {
    try {
      const r = await fetch(media.url);
      if (r.ok) {
        const bitmap = await createImageBitmap(await r.blob());
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas
          .getContext('2d')!
          .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        image = canvas.toDataURL('image/png');
        bitmap.close();
      }
    } catch {
      /* Dimensional envelope remains available if external media cannot be fetched. */
    }
  }
  const logoResponse = await fetch(
    content?.brand?.logoUrl || '/brand/logo.png',
  );
  if (!logoResponse.ok)
    throw new Error('Company logo could not be loaded. Please retry.');
  const logo = new Uint8Array(await logoResponse.arrayBuffer());
  const pdf = buildDatasheet(p, company, {
    logo,
    fontBase64: btoa(binary),
    image,
    reference: media.reference,
  });
  pdf.save((p.slug || p.id) + '-datasheet.pdf');
}
export function TechnicalContent({
  p,
  full = false,
  inline = false,
}: {
  p: BearingProduct;
  full?: boolean;
  inline?: boolean;
}) {
  const { fa, t, company, content } = usePlatform();
  const [image, setImage] = useState(p.imageUrl);
  const [error, setError] = useState('');
  const [view,setView]=useState(false);
  const [rpm,setRpm]=useState(0);
  const rows = [
    ['d / D / B', `${p.d} / ${p.D} / ${p.B} mm`],
    [t('Weight', 'وزن'), p.weightKg + ' kg'],
    [t('Dynamic rating Cr', 'بار دینامیکی Cr'), p.crKn + ' kN'],
    [t('Static rating C₀r', 'بار استاتیکی C₀r'), p.corKn + ' kN'],
    [
      t('Grease / oil speed', 'سرعت گریس / روغن'),
      `${p.speedGreaseRpm} / ${p.speedOilRpm} rpm`,
    ],
    [t('Cage', 'قفسه'), p[fa ? 'cageMaterialFa' : 'cageMaterialEn']],
    [t('Sealing', 'آب‌بندی'), p[fa ? 'sealingFa' : 'sealingEn']],
    [t('Clearance', 'لقی'), p.clearanceOptions.join(' · ')],
  ];
  return (
    <>
      <div className="product-detail-grid">
        <div>
          <div className="detail-image">
            <ProductImage p={{ ...p, imageUrl: image }} />
          </div>
          {(p.images?.filter((u) => !u.startsWith('/assets/images/')).length ||
            0) > 1 && (
            <div className="gallery">
              {p.images
                ?.filter((u) => !u.startsWith('/assets/images/'))
                .map((u) => (
                  <button
                    key={u}
                    onClick={() => setImage(u)}
                    aria-label="Select image"
                    type="button"
                  >
                    <img src={u} alt="Product view" width={120} height={120} />
                  </button>
                ))}
            </div>
          )}
          {mediaFor(p, content).url && <Schematic p={p} />}
        </div>
        <div>
          <div className="section-label">{p.schematicType.toUpperCase()}</div>
          {inline ? <h3 className="product-code" dir="ltr">{p.code}</h3> : <h1 className="product-code" dir="ltr">
            {p.code}
          </h1>}
          {inline ? <h4 className="product-title">{p[fa ? 'nameFa' : 'nameEn']}</h4> : <h2 className="product-title">{p[fa ? 'nameFa' : 'nameEn']}</h2>}
          <p className="muted">{p[fa ? 'descriptionFa' : 'descriptionEn']}</p>
          <dl className="specs">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd dir="auto">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="action-row">
            <a
              className="button primary"
              href={'/?product=' + encodeURIComponent(p.slug || p.id) + '#engineering'}
            >
              {t('Use in engineering tools', 'محاسبه مهندسی')}
              <ArrowUpRight size={16} />
            </a>
            <button
              className="button"
              onClick={() =>
                datasheet(p, company, content).catch((e) => setError(e.message))
              }
            >
              <Download size={16} />
              {t('PDF datasheet', 'دیتاشیت PDF')}
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
          <a
            className="text-link"
            href={
              company.whatsappUrl +
              '?text=' +
              encodeURIComponent(
                t('Technical inquiry: ', 'استعلام فنی: ') + p.code,
              )
            }
            target="_blank"
            rel="noreferrer"
          >
            {t('Ask about this component', 'مشاوره و استعلام این قطعه')}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      {full&&<section className="product-explorer"><button className="button" aria-expanded={view} onClick={()=>setView(!view)}>{view?t('Close geometry view','بستن نمای هندسی'):t('Explore product geometry','بررسی هندسه محصول')}</button>{view&&<BearingViewer p={p} rpm={rpm} onRpmChange={setRpm}/>}</section>}
      <ManufacturerLibrary brands={p.brands}/>
      <section className="product-documents"><h3>{t('Product documents','اسناد محصول')}</h3>{p.pdfUrl?<a className="button" href={p.pdfUrl} target="_blank" rel="noreferrer">{t('Open attached product PDF','باز کردن PDF محصول')} ↗</a>:<p className="muted">{t('No manufacturer PDF attached yet. The generated datasheet summarizes this catalog record.','هنوز PDF سازنده پیوست نشده است. دیتاشیت تولیدشده خلاصه اطلاعات این رکورد است.')}</p>}</section>
      <div className="source-note">
        <strong>{t('Technical provenance', 'منشأ اطلاعات فنی')}</strong>
        <p>
          {t(
            'Specifications and source notes imported from the reference repository. Verification dates below are inherited records, not new verification by this platform. Confirm the exact manufacturer and suffix before selection.',
            'مشخصات و یادداشت‌های منابع از مخزن مرجع وارد شده‌اند. تاریخ‌های تأیید زیر متعلق به مرجع هستند و به معنی تأیید مجدد در این سامانه نیستند. پیش از انتخاب، سازنده و پسوند دقیق را بررسی کنید.',
          )}
        </p>
        {p.technicalSources?.map((s, i) => (
          <p key={i}>
            {s.manufacturer} · {s.catalogCode}
            <br />
            {s.reference} · {t('Source-record date', 'تاریخ ثبت مرجع')}:{' '}
            {s.verifiedAt || t('Unverified', 'تأیید نشده')}
          </p>
        ))}
      </div>
      {full && (
        <>
          <h2>{t('Typical applications', 'کاربردهای رایج')}</h2>
          <div className="chips">
            {p[fa ? 'applicationsFa' : 'applicationsEn'].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div className="note">
            {t(
              'Ratings describe the imported record. Availability and suitability are confirmed manually. Basic life calculations do not replace application engineering.',
              'مقادیر مربوط به رکورد واردشده هستند. موجودی و تناسب کاربرد به صورت دستی تأیید می‌شوند. محاسبه عمر پایه جایگزین بررسی مهندسی کاربرد نیست.',
            )}
          </div>
        </>
      )}
    </>
  );
}
export function QuickView({
  p,
  onClose,
}: {
  p: BearingProduct;
  onClose: () => void;
}) {
  const { t } = usePlatform();
  return (
    <Dialog title={p.code} onClose={onClose}>
      <TechnicalContent p={p} />
      <a className="button" href={'/product/' + p.slug}>
        {t('Open complete product page', 'صفحه کامل محصول')}
        <ArrowRight size={16} />
      </a>
    </Dialog>
  );
}
/** Compact, complete catalog view that stays over the showroom. */
export function ShowroomProductPanel({
  p,
  onClose,
}: {
  p: BearingProduct;
  onClose: () => void;
}) {
  const { fa, t, company, content } = usePlatform();
  const media = mediaFor(p, content);
  const uploadedImages = [p.imageUrl, ...(p.images || [])].filter(
    (url): url is string => typeof url === 'string' && url.length > 0 && !url.startsWith('/assets/images/'),
  );
  const photos = [...new Set([...uploadedImages, ...(media.url ? [media.url] : [])])];
  const [activeImage, setActiveImage] = useState(photos[0] || '');
  const [drawing, setDrawing] = useState(!photos.length);
  const [imageFailed, setImageFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const referenceImage = media.reference && activeImage === media.url && !uploadedImages.includes(activeImage);
  const specifications = [
    [t('Bore diameter · d', 'قطر داخلی · d'), `${p.d} mm`],
    [t('Outside diameter · D', 'قطر خارجی · D'), `${p.D} mm`],
    [t('Width · B', 'عرض · B'), `${p.B} mm`],
    [t('Weight', 'وزن'), `${p.weightKg} kg`],
    [t('Dynamic load · Cr', 'بار دینامیکی · Cr'), `${p.crKn} kN`],
    [t('Static load · C₀r', 'بار استاتیکی · C₀r'), `${p.corKn} kN`],
    [t('Grease speed', 'سرعت گریس'), `${p.speedGreaseRpm} rpm`],
    [t('Oil speed', 'سرعت روغن'), `${p.speedOilRpm} rpm`],
    [t('Cage', 'قفسه'), p[fa ? 'cageMaterialFa' : 'cageMaterialEn'] || '—'],
    [t('Sealing', 'آب‌بندی'), p[fa ? 'sealingFa' : 'sealingEn'] || '—'],
    [t('Clearance', 'لقی'), p.clearanceOptions.join(' · ') || '—'],
    ...(p.rMin ? [[t('Minimum chamfer', 'حداقل پخ'), `${p.rMin} mm`]] : []),
    ...(p.contactAngle ? [[t('Contact angle', 'زاویه تماس'), p.contactAngle]] : []),
  ];
  return (
    <Dialog title={t('Product specifications', 'مشخصات فنی محصول') + ' · ' + p.code} onClose={onClose} className="product-float">
      <div className="product-panel-layout">
        <div className="product-panel-gallery">
          <div className="product-panel-stage">
            {drawing || imageFailed || !activeImage ? <Schematic p={p} /> : <img src={activeImage} alt={p[fa ? 'nameFa' : 'nameEn']} onError={() => setImageFailed(true)} />}
            {!drawing && !imageFailed && referenceImage && <span className="product-panel-reference">{t('Family reference image', 'تصویر مرجع خانواده')}</span>}
          </div>
          <div className="product-panel-thumbnails" aria-label={t('Product image gallery', 'گالری تصاویر محصول')}>
            {photos.map((url, index) => <button type="button" key={url} className={!drawing && activeImage === url ? 'active' : ''} aria-pressed={!drawing && activeImage === url} aria-label={t('View image', 'نمایش تصویر') + ' ' + (index + 1)} onClick={() => { setActiveImage(url); setDrawing(false); setImageFailed(false); }}><img src={url} alt="" /></button>)}
            <button type="button" className={drawing ? 'active' : ''} aria-pressed={drawing} onClick={() => setDrawing(true)}>{t('Drawing', 'نقشه')}</button>
          </div>
          <small className="product-panel-media-note">{!drawing && !imageFailed && referenceImage ? t('Family illustration; confirm the exact product with its manufacturer.', 'تصویر خانواده محصول است؛ کد دقیق را با سازنده بررسی کنید.') : t('Image and dimensional drawing from the current catalog record.', 'تصویر و نقشه ابعادی از رکورد فعلی کاتالوگ.')}</small>
        </div>
        <div className="product-panel-details">
          <div className="product-panel-identity">
            <span className="section-label">{p.schematicType.replaceAll('-', ' ').toUpperCase()}</span>
            <h2 dir="ltr">{p.code}</h2>
            <h3>{p[fa ? 'nameFa' : 'nameEn']}</h3>
            <p>{p[fa ? 'descriptionFa' : 'descriptionEn']}</p>
          </div>
          <dl className="product-panel-specs">
            {specifications.map(([name, value]) => <div key={name}><dt>{name}</dt><dd dir="auto">{value}</dd></div>)}
          </dl>
          <div className="product-panel-context">
            <span><b>{t('Applications', 'کاربردها')}</b> {p[fa ? 'applicationsFa' : 'applicationsEn'].slice(0, 3).join(' · ') || '—'}</span>
            <span><b>{t('References', 'مراجع')}</b> {p.brands.join(' · ') || '—'}</span>
          </div>
        </div>
      </div>
      <div className="product-panel-actions">
        <a className="button primary" href={'/?product=' + encodeURIComponent(p.slug || p.id) + '#engineering'}>{t('Use in engineering tools', 'استفاده در ابزارهای مهندسی')} <ArrowUpRight size={16} /></a>
        <button className="button" disabled={downloading} onClick={async () => { setDownloading(true); setDownloadError(''); try { await datasheet(p, company, content); } catch (error) { setDownloadError(error instanceof Error ? error.message : String(error)); } finally { setDownloading(false); } }}><Download size={16} />{t(downloading ? 'Preparing PDF…' : 'Company datasheet', downloading ? 'آماده‌سازی PDF…' : 'دیتاشیت شرکت')}</button>
        {p.pdfUrl ? <a className="button" href={p.pdfUrl} target="_blank" rel="noreferrer">{t('Attached manufacturer PDF', 'PDF پیوست سازنده')} <ArrowUpRight size={16} /></a> : <span className="product-panel-document-note">{t('No manufacturer PDF attached yet.', 'هنوز PDF سازنده پیوست نشده است.')}</span>}
      </div>
      {downloadError && <p role="alert" className="error">{downloadError}</p>}
    </Dialog>
  );
}
export default function ProductPage() {
  const { products, loading, error, t, fa, seo } = usePlatform();
  let slug = '';
  try {
    slug = decodeURIComponent(
      location.pathname.replace(/\/+$/, '').split('/').pop() || '',
    );
  } catch {
    // A malformed product URL resolves to the ordinary not-found view.
  }
  const p = products.find((p) => p.slug === slug);
  useEffect(() => {
    if (!p || !seo) return;
    document.title =
      p[fa ? 'metaTitleFa' : 'metaTitleEn'] || p[fa ? 'nameFa' : 'nameEn'];
  }, [p, fa, seo]);
  if (loading || error)
    return (
      <main id="main">
        <DataState />
      </main>
    );
  if (!p)
    return (
      <main id="main" className="section state">
        <h1>{t('Product not found', 'محصول یافت نشد')}</h1>
        <p>{slug}</p>
        <a
          className="button primary"
          href={'/catalog?q=' + encodeURIComponent(slug)}
        >
          {t('Search the catalog', 'جستجوی کاتالوگ')}
        </a>
        <a className="button" href="/#contact">
          {t('Ask the engineering team', 'ارتباط با تیم فنی')}
        </a>
      </main>
    );
  return (
    <main id="main" className="section">
      <div className="breadcrumbs">
        <a href="/">{t('Home', 'خانه')}</a> /{' '}
        <a href="/catalog">{t('Catalog', 'کاتالوگ')}</a> / {p.code}
      </div>
      <TechnicalContent p={p} full />
      <h2>{t('Related components', 'قطعات مرتبط')}</h2>
      <div className="product-grid">
        {products
          .filter((x) => x.category === p.category && x.id !== p.id)
          .slice(0, 3)
          .map((x) => (
            <a className="related-link" key={x.id} href={'/product/' + x.slug}>
              <ProductImage p={x} />
              <code>{x.code}</code>
              <span>{x[fa ? 'nameFa' : 'nameEn']}</span>
            </a>
          ))}
      </div>
    </main>
  );
}

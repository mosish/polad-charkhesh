import PageSection from './PageSection';
import Copy from './Copy';
import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Factory,
  Flame,
  Mountain,
  Wind,
  Settings2,
  Droplets,
} from 'lucide-react';
import { usePlatform, DataState } from './Context';
import { api } from '../../lib/api';
import { ProductCard, QuickView } from './Product';
import type { BearingProduct } from '../../domain/product';
const industries = [
  ['Steel & metals', 'فولاد و فلزات', 'steel', Factory],
  ['Mining & cement', 'معدن و سیمان', 'mining', Mountain],
  ['Oil & petrochemical', 'نفت و پتروشیمی', 'oil', Flame],
  ['Power generation', 'تولید برق', 'power', Wind],
  ['Pumps & fluid systems', 'پمپ و سیالات', 'pumps', Droplets],
  ['Gearboxes & machinery', 'گیربکس و ماشین‌آلات', 'gearboxes', Settings2],
] as const;
export default function HomeSections() {
  const { products, fa, t, company, content, loading, error } = usePlatform();
  const [selected, setSelected] = useState<BearingProduct | null>(null),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState(''),
    [success, setSuccess] = useState(false);
  if (loading || error) return <DataState />;
  return (
    <>
      <PageSection id="featured">
        <section className="section featured-section" id="catalog">
          <div className="section-heading">
            <div>
              <div className="section-label">
                02 / {t('COMPONENTS, CONSIDERED', 'انتخاب دقیق قطعات')}
              </div>
              <h2>
                {t('Find your next solution.', 'راه‌حل بعدی را پیدا کنید.')}
              </h2>
            </div>
            <a className="text-link" href={content.links.featured}>
              {t('View all', 'مشاهده همه')} {products.length}{' '}
              {t('components', 'قطعه')}
              <ArrowUpRight size={20} />
            </a>
          </div>
          <div className="product-grid">
            {products
              .filter((p) => p.featured)
              .slice(0, 3)
              .map((p) => (
                <ProductCard key={p.id} p={p} onSelect={setSelected} />
              ))}
          </div>
        </section>
      </PageSection>
      <PageSection id="engineering">
        <section className="engineering-invitation">
          <div>
            <div className="section-label">
              03 / {t('ENGINEERING, WITH CONTEXT', 'مهندسی با شناخت کاربرد')}
            </div>
            <h2>{content.engineering[fa ? 'titleFa' : 'titleEn']}</h2>
            <p>
              {t(
                'Go beyond the part number. Explore bearing geometry, calculate basic rating life and understand how operating conditions shape your selection.',
                'فراتر از شماره فنی بروید؛ هندسه بیرینگ، عمر پایه و اثر شرایط کاری بر انتخاب را بررسی کنید.',
              )}
            </p>
            <a className="button" href={content.links.engineering}>
              {t('Open engineering workspace', 'ورود به کارگاه مهندسی')}
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="formula-board">
            <span>
              <Copy text="BASIC RATING LIFE" />
            </span>
            <strong>
              <Copy text="L₁₀ = (C/P)" />
              <sup>
                <Copy text="p" />
              </sup>
            </strong>
            <p>
              <Copy text="p = 3" />
              <span>
                <Copy text="Ball bearings" />
              </span>
            </p>
            <p>
              <Copy text="p = 10/3" />
              <span>
                <Copy text="Roller bearings" />
              </span>
            </p>
            <small>
              {t(
                'From specification to an informed decision.',
                'از مشخصات فنی تا تصمیم آگاهانه.',
              )}
            </small>
          </div>
        </section>
      </PageSection>
      <PageSection id="industries">
        <section className="section industries" id="industries">
          <div className="section-heading">
            <div>
              <div className="section-label">
                04 / {t('INDUSTRIES WE SUPPORT', 'صنایع تحت پوشش')}
              </div>
              <h2>{content.industries[fa ? 'titleFa' : 'titleEn']}</h2>
            </div>
            <p>
              {t(
                'Different environments. Different demands. One considered approach to selection.',
                'محیط‌های متفاوت، نیازهای متفاوت؛ انتخاب بر پایه شرایط واقعی.',
              )}
            </p>
          </div>
          <div className="industry-grid">
            {content.cards.industries.map((card: any, i: number) => (
              <a key={card.id} href={card.href || '/catalog'}>
                <span className="industry-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {card.imageUrl ? (
                  <img
                    className="industry-image"
                    src={card.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <Factory size={32} />
                )}
                <h3>{card[fa ? 'titleFa' : 'titleEn']}</h3>
                {card[fa ? 'descriptionFa' : 'descriptionEn'] && (
                  <p>{card[fa ? 'descriptionFa' : 'descriptionEn']}</p>
                )}
                <ArrowUpRight size={19} />
              </a>
            ))}
          </div>
        </section>
      </PageSection>
      <PageSection id="why">
        <section className="section why-section">
          <div>
            <div className="section-label">
              05 / {t('WHY POLAD CHARKHESH', 'چرا پولاد چرخش')}
            </div>
            <h2>{content.why[fa ? 'titleFa' : 'titleEn']}</h2>
            <p>{content.why[fa ? 'descriptionFa' : 'descriptionEn']}</p>
          </div>
          <div className="reasons">
            {content.cards.reasons.map((card: any, i: number) => (
              <div key={card.id}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>
                    {card.href ? (
                      <a href={card.href}>{card[fa ? 'titleFa' : 'titleEn']}</a>
                    ) : (
                      card[fa ? 'titleFa' : 'titleEn']
                    )}
                  </h3>
                  <p>{card[fa ? 'descriptionFa' : 'descriptionEn']}</p>
                </div>
                {card.imageUrl ? (
                  <img className="card-icon-image" src={card.imageUrl} alt="" />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
            ))}
          </div>
        </section>
      </PageSection>
      <PageSection id="support">
        <section className="support-strip">
          <div>
            <div className="section-label">
              {t('YOUR TECHNICAL SUPPORT TEAM', 'تیم پشتیبانی فنی شما')}
            </div>
            <h2>
              {t('People behind the precision.', 'کارشناسان، پشتوانه دقت.')}
            </h2>
            <p>
              {t(
                'Share a part number, dimensional sketch or operating challenge. Our team can help you move the discussion forward.',
                'شماره قطعه، نقشه ابعادی یا مسئله کاربردی خود را مطرح کنید؛ تیم فنی در بررسی و انتخاب همراه شماست.',
              )}
            </p>
          </div>
          <a href={company.primaryPhoneTel} className="button primary">
            <Phone size={17} />
            {company.primaryPhoneDisplayEn}
          </a>
        </section>
      </PageSection>
      <PageSection id="contact">
        <section className="section contact-section" id="contact">
          <div>
            <div className="section-label">
              06 / {t('LET’S TALK ENGINEERING', 'گفت‌وگوی مهندسی')}
            </div>
            <h2>{content.contact[fa ? 'titleFa' : 'titleEn']}</h2>
            <div className="contact-details">
              <a href={company.landlinePhoneTel}>
                <Phone size={19} />
                <span>
                  <small>{t('Central office', 'دفتر مرکزی')}</small>
                  <b dir="ltr">{company.landlinePhoneDisplayEn}</b>
                </span>
              </a>
              <a href={'mailto:' + company.email}>
                <Mail size={19} />
                <span>
                  <small>{t('Email', 'ایمیل')}</small>
                  {company.email}
                </span>
              </a>
              <div>
                <MapPin size={19} />
                <span>{company[fa ? 'addressFa' : 'addressEn']}</span>
              </div>
              <div>
                <Clock size={19} />
                <span>{company[fa ? 'workingHoursFa' : 'workingHoursEn']}</span>
              </div>
            </div>
            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {t('Continue on WhatsApp', 'ارتباط در واتساپ')}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <form
            className="inquiry-form panel"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setBusy(true);
              setFormError('');
              try {
                await api(
                  '/inquiries',
                  'POST',
                  Object.fromEntries(new FormData(form)),
                );
                setSuccess(true);
                form.reset();
              } catch (e: any) {
                setFormError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h3>
              {t('Tell us what you’re working on.', 'از نیاز فنی خود بگویید.')}
            </h3>
            <div className="form-grid">
              <label>
                {t('Full name', 'نام و نام خانوادگی')}
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label>
                {t('Phone number', 'شماره تماس')}
                <input
                  name="phone"
                  required
                  type="tel"
                  minLength={7}
                  maxLength={30}
                  autoComplete="tel"
                />
              </label>
              <label>
                {t('Company', 'شرکت')}
                <input
                  name="company"
                  maxLength={200}
                  autoComplete="organization"
                />
              </label>
              <label>
                {t('Email (optional)', 'ایمیل (اختیاری)')}
                <input
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                />
              </label>
            </div>
            <label>
              {t('Your technical inquiry', 'موضوع استعلام فنی')}
              <textarea
                name="message"
                rows={4}
                required
                minLength={10}
                maxLength={5000}
                placeholder={t(
                  'Part number, dimensions, application or operating conditions…',
                  'شماره قطعه، ابعاد، کاربرد یا شرایط کار…',
                )}
              />
            </label>
            <div className="honeypot" aria-hidden="true">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
            {formError && (
              <p role="alert" className="error">
                {formError}
              </p>
            )}
            {success && (
              <p className="success" role="status">
                {t(
                  'Your inquiry has been saved. Our team will review your request.',
                  'استعلام شما ثبت شد. تیم فنی درخواست را بررسی خواهد کرد.',
                )}
              </p>
            )}
            <button className="button primary" disabled={busy}>
              {t(
                busy ? 'Submitting…' : 'Send technical inquiry',
                busy ? 'در حال ارسال…' : 'ارسال استعلام فنی',
              )}
              <ArrowUpRight size={18} />
            </button>
            <p className="privacy-note">
              {t(
                'We use these details to respond to your inquiry. Availability and commercial terms are confirmed directly.',
                'اطلاعات شما فقط برای پاسخ‌گویی به استعلام استفاده می‌شود. موجودی و شرایط تجاری مستقیماً تأیید خواهند شد.',
              )}
            </p>
          </form>
        </section>
      </PageSection>
      {selected && <QuickView p={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

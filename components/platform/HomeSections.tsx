import PageSection from './PageSection';
import { lazy, Suspense, useState } from 'react';
import {
  ArrowUpRight,
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
import { publicHref } from '../../lib/public-links';
const Catalog = lazy(() => import('./Catalog'));
const Engineering = lazy(() => import('./Engineering'));
const industries = [
  ['Steel & metals', 'فولاد و فلزات', 'steel', Factory],
  ['Mining & cement', 'معدن و سیمان', 'mining', Mountain],
  ['Oil & petrochemical', 'نفت و پتروشیمی', 'oil', Flame],
  ['Power generation', 'تولید برق', 'power', Wind],
  ['Pumps & fluid systems', 'پمپ و سیالات', 'pumps', Droplets],
  ['Gearboxes & machinery', 'گیربکس و ماشین‌آلات', 'gearboxes', Settings2],
] as const;
export default function HomeSections() {
  const { fa, t, company, content, loading, error } = usePlatform();
  const [busy, setBusy] = useState(false),
    [formError, setFormError] = useState(''),
    [success, setSuccess] = useState(false);
  if (loading || error) return <DataState />;
  return (
    <>
      <PageSection id="featured">
        <section className="one-page-workspace" id="catalog">
          <Suspense fallback={<div className="state" role="status">{t('Loading catalog…', 'در حال بارگذاری کاتالوگ…')}</div>}><Catalog embedded /></Suspense>
        </section>
      </PageSection>
      <PageSection id="engineering">
        <section className="one-page-workspace" id="engineering">
          <Suspense fallback={<div className="state" role="status">{t('Loading engineering tools…', 'در حال بارگذاری ابزارهای مهندسی…')}</div>}><Engineering embedded /></Suspense>
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
              <a key={card.id} href={publicHref(card.href || '/catalog')}>
                <span className="industry-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {card.imageUrl ? (
                  <img
                    className="industry-image"
                    src={card.imageUrl}
                    alt=""
                    loading="lazy"
                    width={480}
                    height={260}
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
                      <a href={publicHref(card.href)}>{card[fa ? 'titleFa' : 'titleEn']}</a>
                    ) : (
                      card[fa ? 'titleFa' : 'titleEn']
                    )}
                  </h3>
                  <p>{card[fa ? 'descriptionFa' : 'descriptionEn']}</p>
                </div>
                {card.imageUrl ? (
                  <img className="card-icon-image" src={card.imageUrl} alt="" width={56} height={56} />
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
    </>
  );
}

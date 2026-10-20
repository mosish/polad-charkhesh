import { useState } from 'react';
import { api, errorMessage } from '../../lib/api';
import { usePlatform } from '../platform/Context';

export default function MfaSetup({ enabled = false, onDone }: { enabled?: boolean; onDone: () => void }) {
  const { t } = usePlatform();
  const [secret, setSecret] = useState(''), [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  return <section className="panel login-form">
    <h2>{t(enabled ? 'Replace recovery codes' : 'Protect your account', enabled ? 'جایگزینی کدهای بازیابی' : 'حفاظت از حساب کاربری')}</h2>
    {codes.length ? <>
      <output>{t('Save these recovery codes in your password manager. Each works once. They will not be shown again.', 'این کدهای بازیابی را در مدیر رمز عبور ذخیره کنید. هر کد یک‌بار قابل استفاده است و دوباره نمایش داده نمی‌شود.')}</output>
      <pre dir="ltr" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{codes.join('\n')}</pre>
      <button className="button primary" onClick={() => { setCodes([]); setSecret(''); onDone(); }}>
        {t('I saved my recovery codes', 'کدهای بازیابی را ذخیره کردم')}
      </button>
    </> : <form onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError('');
      const form = e.currentTarget;
      const values = Object.fromEntries(new FormData(form));
      try {
        if (!enabled && !secret) {
          const result = await api<{ secret: string }>('/auth/mfa/start', 'POST', values);
          form.reset(); setSecret(result.secret);
        } else {
          const result = await api<{ recoveryCodes: string[] }>(enabled ? '/auth/mfa/recovery-codes' : '/auth/mfa/confirm', 'POST', values);
          form.reset(); setSecret(''); setCodes(result.recoveryCodes);
        }
      } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
    }}>
      {!secret && <label>{t('Current password', 'رمز عبور فعلی')}
        <input name="password" type="password" required maxLength={256} autoComplete="current-password" />
      </label>}
      {secret && <>
        <p>{t('In your authenticator app, add a time-based account named Polad Charkhesh using this setup key. Then enter its six-digit code.', 'در برنامه رمزساز، حسابی مبتنی بر زمان با نام Polad Charkhesh و این کلید بسازید. سپس کد شش‌رقمی آن را وارد کنید.')}</p>
        <label>{t('Authenticator setup key', 'کلید راه‌اندازی رمزساز')}
          <input dir="ltr" readOnly value={secret} onFocus={e => e.currentTarget.select()} />
        </label>
      </>}
      {(secret || enabled) && <label>{t('Authenticator code', 'کد رمزساز')}
        <input dir="ltr" name="code" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6} />
      </label>}
      {enabled && <p>{t('This invalidates all previous recovery codes. Use a fresh authenticator code.', 'با این کار همه کدهای بازیابی قبلی باطل می‌شوند. یک کد تازه از رمزساز وارد کنید.')}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="button primary" disabled={busy}>
        {busy ? t('Please wait…', 'لطفاً صبر کنید…') : secret ? t('Enable two-step verification', 'فعال‌سازی تأیید دومرحله‌ای') :
          enabled ? t('Generate new recovery codes', 'ساخت کدهای بازیابی جدید') : t('Set up authenticator', 'راه‌اندازی رمزساز')}
      </button>
    </form>}
  </section>;
}

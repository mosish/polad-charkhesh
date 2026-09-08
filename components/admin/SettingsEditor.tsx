import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { usePlatform } from '../platform/Context';
export default function SettingsEditor({
  kind,
  onDirty,
}: {
  kind: string;
  onDirty: (dirty: boolean) => void;
}) {
  const { t, reload } = usePlatform();
  const [value, setValue] = useState<any>(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [dirty, setDirty] = useState(false);
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => {
    api('/' + kind)
      .then((r) => setValue(r.data))
      .catch((e) => setError(e.message));
  }, [kind]);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    addEventListener('beforeunload', f);
    return () => removeEventListener('beforeunload', f);
  }, [dirty]);
  const update = (path: string[], v: string) => {
    const next = structuredClone(value);
    let ref = next;
    for (const k of path.slice(0, -1)) ref = ref[k];
    ref[path.at(-1)!] = v;
    setValue(next);
    setDirty(true);
    setMessage('');
  };
  function fields(obj: any, prefix: string[] = []): React.ReactNode {
    return Object.entries(obj).map(([k, v]) =>
      typeof v === 'object' && v && !Array.isArray(v) ? (
        <fieldset key={k}>
          <legend>{k}</legend>
          <div className="form-grid">{fields(v, [...prefix, k])}</div>
        </fieldset>
      ) : typeof v === 'string' ? (
        <label key={k}>
          {k}
          {v.length > 140 || /description|title|address/i.test(k) ? (
            <textarea
              rows={3}
              value={v}
              dir={k.endsWith('Fa') ? 'rtl' : 'ltr'}
              onChange={(e) => update([...prefix, k], e.target.value)}
            />
          ) : (
            <input
              value={v}
              dir={k.endsWith('Fa') ? 'rtl' : 'ltr'}
              onChange={(e) => update([...prefix, k], e.target.value)}
            />
          )}
        </label>
      ) : null,
    );
  }
  const save = async () => {
    try {
      await api('/' + kind, 'PUT', value);
      setDirty(false);
      setMessage(t('Changes saved.', 'تغییرات ذخیره شد.'));
      setError('');
      reload();
    } catch (e: any) {
      setError(e.message);
    }
  };
  return (
    <div className="panel">
      {!value ? (
        <p>{error || t('Loading…', 'در حال دریافت…')}</p>
      ) : (
        <>
          <div className="form-grid">{fields(value)}</div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="sticky-save">
            <button className="button primary" onClick={save}>
              {t('Save changes', 'ذخیره تغییرات')}
            </button>
            <span role="status">
              {message ||
                (dirty ? t('Unsaved changes', 'تغییرات ذخیره‌نشده') : '')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

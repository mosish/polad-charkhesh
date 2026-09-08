import { useId, useState } from 'react';
import { api } from '../../lib/api';
import { usePlatform } from '../platform/Context';
export default function MediaPicker({
  value,
  onChange,
  label = 'Image',
  pdf = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  pdf?: boolean;
}) {
  const { t } = usePlatform();
  const [id] = useState(() => Math.random().toString(36).slice(2)),
    [library, setLibrary] = useState<any[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t('Maximum 5 MB.', 'حداکثر ۵ مگابایت.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1]);
        r.onerror = () => reject(new Error('File could not be read.'));
        r.readAsDataURL(file);
      });
      const result = await api('/media', 'POST', {
        name: file.name,
        mime: file.type,
        base64,
      });
      onChange(result.media.url);
      setLibrary(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="media-picker">
      <label htmlFor={'media-' + id}>{label}</label>
      {value && !pdf && (
        <img className="media-picker-preview" src={value} alt={label} />
      )}
      <input
        id={'media-' + id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/image.png or https://…"
        dir="ltr"
      />
      <div className="action-row">
        <label className="button upload-button">
          {t(
            busy ? 'Uploading…' : 'Upload file',
            busy ? 'در حال بارگذاری…' : 'بارگذاری فایل',
          )}
          <input
            type="file"
            disabled={busy}
            accept={pdf ? 'application/pdf' : 'image/png,image/jpeg,image/webp'}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <button
          type="button"
          className="button"
          onClick={async () => {
            try {
              const r = await api('/media');
              setLibrary(
                r.media.filter((m: any) =>
                  pdf
                    ? m.mime === 'application/pdf'
                    : m.mime.startsWith('image/'),
                ),
              );
            } catch (e: any) {
              setError(e.message);
            }
          }}
        >
          {t('Choose from library', 'انتخاب از کتابخانه')}
        </button>
        {value && (
          <button type="button" className="button" onClick={() => onChange('')}>
            {t('Remove from this section', 'حذف از این بخش')}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {library && (
        <div className="media-picker-library">
          <button
            type="button"
            className="button"
            onClick={() => setLibrary(null)}
          >
            {t('Close library', 'بستن کتابخانه')}
          </button>
          {library.length === 0 && (
            <p>
              {t(
                'Upload a file to start your library.',
                'برای شروع یک فایل بارگذاری کنید.',
              )}
            </p>
          )}
          {library.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => {
                onChange(m.url);
                setLibrary(null);
              }}
            >
              {!pdf && <img src={m.url} alt="" />}
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlatform } from './Context';
export default function Dialog({
  title,
  onClose,
  children,
  className = '',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = usePlatform();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement,
      old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = old;
      before?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={'dialog ' + className}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-heading">
          <strong>{title}</strong>
          <button onClick={onClose} aria-label={t('Close dialog', 'بستن پنجره')}>
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

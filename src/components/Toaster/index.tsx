import { useEffect } from 'react';
import { t } from 'lib/i18n';
import type { Toast } from 'common/types';
import type { Locale } from 'common/types/AccountSettings';

interface ToasterProps {
  toasts: Toast[];
  locale: Locale;
  onDismiss: (id: string) => void;
}

const TOAST_DURATION_MS = 5_000;

export default function Toaster({ toasts, locale, onDismiss }: ToasterProps) {
  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [onDismiss, toasts]);

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <span className="toast__icon" aria-hidden="true">
            {toast.type === 'success' ? '✓' : '!'}
          </span>
          <div className="toast__content">
            <strong>{t(locale, toast.type)}</strong>
            <p>{toast.message}</p>
          </div>
          <button className="toast__close" type="button" onClick={() => onDismiss(toast.id)} aria-label={t(locale, 'close')}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

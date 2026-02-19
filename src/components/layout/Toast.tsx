import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <div style={{ fontWeight: 600, marginBottom: 5 }}>
        {type === 'success' ? '✅ Success' : type === 'error' ? '❌ Error' : 'ℹ️ Info'}
      </div>
      <div>{message}</div>
    </div>
  );
}

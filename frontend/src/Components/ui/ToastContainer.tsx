import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../Context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            t.type === 'success'
              ? 'bg-white/95 border-teal-200 text-teal-900'
              : t.type === 'error'
              ? 'bg-white/95 border-red-200 text-red-900'
              : 'bg-white/95 border-amber-200 text-amber-900'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-amber-600 shrink-0" />}
          <span className="text-sm font-medium text-[#1f1b11]">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;
        let borderClass = 'border-slate-800 bg-[#11192B]/95 text-slate-100';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#39D6C4] shrink-0" />;
          borderClass = 'border-[#39D6C4]/30 bg-[#11192B]/95 text-slate-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/30 bg-[#11192B]/95 text-slate-100';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/30 bg-[#11192B]/95 text-slate-100';
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold tracking-tight">{toast.title}</h5>
              {toast.message && (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

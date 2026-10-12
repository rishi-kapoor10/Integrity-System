import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#11192B] border border-slate-800 rounded-xl p-5 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-lg shrink-0 ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="modal-title" className="text-sm font-semibold text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-900/30'
                : 'bg-[#39D6C4] hover:bg-[#39D6C4]/90 text-slate-950 font-semibold'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

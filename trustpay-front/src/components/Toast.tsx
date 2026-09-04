import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast, setCurrentScreen } = useApp();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const isEmergency = toastMessage.type === 'emergency';
  const isSuccess = toastMessage.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border text-slate-900 flex items-start gap-3 bg-white ${
          isEmergency
            ? 'border-rose-500 bg-rose-50/95 ring-4 ring-rose-500/10'
            : isSuccess
            ? 'border-emerald-500 bg-emerald-50/95'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isEmergency ? (
            <AlertOctagon className="w-5 h-5 text-rose-600 animate-bounce" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Info className="w-5 h-5 text-blue-600" />
          )}
        </div>

        <div className="flex-1 text-xs">
          <h4 className="font-bold text-slate-900">{toastMessage.title}</h4>
          <p className="text-slate-600 mt-0.5 leading-relaxed">{toastMessage.body}</p>
          {isEmergency && (
            <button
              onClick={() => {
                clearToast();
                setCurrentScreen('notifications');
              }}
              className="mt-2 text-[11px] font-bold text-rose-700 hover:text-rose-800 underline block cursor-pointer"
            >
              View Dispatched Trusted Contact Alerts →
            </button>
          )}
        </div>

        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-slate-600 p-1 shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

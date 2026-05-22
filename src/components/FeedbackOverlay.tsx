import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { playSound } from '../lib/sound';
import { useEffect } from 'react';

interface OverlayProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

export function FeedbackOverlay({ status, errorMessage }: OverlayProps) {
  useEffect(() => {
    if (status === 'processing') playSound('process');
    if (status === 'success') {
      playSound('success');
    }
    if (status === 'error') {
      playSound('error');
    }
  }, [status]);

  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-[2px] transition-colors"
        >
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-5 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl transition-colors">
              <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-lg">
                Procesando...
              </span>
            </div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-green-600 dark:text-green-500 transition-colors"
            >
              <CheckCircle className="h-20 w-20" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">¡Operación Exitosa!</h2>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border-t-4 border-red-500 transition-colors"
            >
              <XCircle className="h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Error en Operación</h2>
              {errorMessage && (
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-center max-w-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 text-sm">
                  {errorMessage}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

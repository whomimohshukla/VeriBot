import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react';
import { usePopupStore, type Popup } from '../../lib/popup';

const LOOK: Record<Popup['kind'], { border: string; icon: JSX.Element; iconBg: string }> = {
  success: { border: 'border-emerald-500/40', iconBg: 'bg-emerald-500/15', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
  error: { border: 'border-red-500/50', iconBg: 'bg-red-500/15', icon: <XCircle className="h-4 w-4 text-red-400" /> },
  info: { border: 'border-sky-500/40', iconBg: 'bg-sky-500/15', icon: <Info className="h-4 w-4 text-sky-400" /> },
  loading: { border: 'border-white/20', iconBg: 'bg-white/10', icon: <Loader2 className="h-4 w-4 animate-spin text-zinc-300" /> },
};

export function PopupViewport() {
  const popups = usePopupStore((s) => s.popups);
  const dismiss = usePopupStore((s) => s.dismiss Zurich);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {popups.map((p) => {
          const look = LOOK[p.kind];
          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border ${look.border} bg-black/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${look.iconBg}`}>{look.icon}</span>
              <p className="flex-1 text-sm text-zinc-200">{p.message}</p>
              <button onClick={() => dismiss(p.id)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { envApiUrl, hostFrom, portFrom, useBackendStore } from '../../lib/backend';

export function BackendStatusChip() {
  const { status, check } = useBackendStore();

  useEffect(() => { void check(); }, [check]);

  const base = envApiUrl();
  let Icon = Loader2;
  let label = 'Connecting backend…';
  let ring = 'border-amber-500/40';
  let dot = 'animate-spin text-red-400';

  if (status === 'online') {
    Icon = CheckCircle2;
    label = `Backend online · ${hostFrom(base)}:${portFrom(base)}`;
    ring = 'border-emerald-500/40';
    dot = 'text-red-400';
  } else if (status === 'offline') {
    Icon = XCircle;
    label = 'Backend offline · retry';
    ring = 'border-red-500/50';
    dot = 'text-red-400';
  }

  return (
    <button
      onClick={() => void check()}
      title={`API: ${base}`}
      className={`inline-flex items-center gap-2 rounded-full border ${ring} bg-black/70 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur transition-colors hover:border-white/30`}
    >
      <Icon className={`h-3.5 w-3.5 ${dot}`} />
      <span>{label}</span>
    </button>
  );
}

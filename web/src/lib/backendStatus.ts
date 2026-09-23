import { create } from 'zustand';

export const DEFAULT_API_URL = 'http://localhost:4000';

export interface BackendStatus {
  status: 'connecting' | 'online' | 'offline';
  host: string;
  port: string;
  lastChecked: number | null;
  error?: string;
}

function envApiUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw && raw.trim()) return raw.trim().replace(/\/+$/, '');
  return DEFAULT_API_URL;
}

function parsePort(u: string): { host: string; port: string } {
  try {
    const url = new URL(u);
    return { host: url.hostname, port: url.port || (url.protocol === 'https:' ? '443' : '80') };
  } catch {
    return { host: 'localhost', port: '4000' };
  }
}

async function probe(u: string, timeoutMs: number): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(u, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export const useBackendStatus = create<{
  status: BackendStatus['status'];
  host: string;
  port: string;
  error?: string;
  checking: () => void;
  check: () => Promise<void>;
}>((set) => ({
  status: 'connecting',
  host: 'localhost',
  port: '4000',
  checking: () => set({ status: 'connecting' }),
  check: async () => {
    const base = envApiUrl();
    const { host, port } = parsePort(base);
    set({ status: 'connecting', host, port, error: undefined });
    const candidates = [
      `${base}/api/v1/health`,
      `${base}/health`,
      `${base}/api/v1`,
      `${base}`,
    ];
    for (const u of candidates) {
      const ok = await probe(u, 2000);
      if (ok) {
        set({ status: 'online', host, port, error: undefined });
        return;
      }
    }
    set({ status: 'offline', host, port, error: `Could not reach backend at ${base}. Start the API server locally (port ${port}).` });
  },
}));

export function apiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined || DEFAULT_API_URL).replace(/\/+$/, '');
}

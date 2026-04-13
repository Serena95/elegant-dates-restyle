/**
 * Offline cache layer - stores cloud data in localStorage for offline access
 * and queues mutations for sync when connection returns.
 */

const CACHE_KEY = "offline_cloud_cache";
const PENDING_KEY = "offline_pending_sync";

export interface OfflineCache {
  piano: Record<string, any>;
  allenamentiData: any;
  storicoCal: Record<string, any>;
  attrezzi: string[];
  livello: string;
  giorniAllenamento: number[];
  ultimiAttrezzi: string[];
  profile: any;
  misure: any[];
  pasti: any[];
  acqua: number;
  sfida: any;
  cycleEntries: any[];
  pregnancySettings: any;
  timestamp: number;
}

export function saveOfflineCache(data: Partial<OfflineCache>) {
  try {
    const existing = loadOfflineCache();
    const merged = { ...existing, ...data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
  } catch {}
}

export function loadOfflineCache(): OfflineCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

// Track the last generation key to prevent re-generation on reload
const GEN_KEY = "workout_generation_key";

export function getStoredGenerationKey(): string {
  return localStorage.getItem(GEN_KEY) || "";
}

export function setStoredGenerationKey(key: string) {
  localStorage.setItem(GEN_KEY, key);
}

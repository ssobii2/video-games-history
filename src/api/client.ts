import type { MuseumData } from '../types';
import { catalogData } from '../../shared/catalog/index';

const API_TIMEOUT_MS = 5000;

/**
 * Loads museum data from the serverless API. When the API is unreachable
 * (plain `vite dev` without `vercel dev`, offline demo, cold misconfig) the
 * embedded curated catalog takes over — same shape, zero broken states.
 */
export async function loadMuseum(): Promise<MuseumData> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    const res = await fetch('/api/museum', { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`api ${res.status}`);
    const data = (await res.json()) as MuseumData;
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('empty payload');
    return data;
  } catch {
    return catalogData();
  }
}

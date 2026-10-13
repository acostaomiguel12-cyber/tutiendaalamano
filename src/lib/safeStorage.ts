/** Storage seguro con fallback en memoria (iframes con storage bloqueado). */
const mem = new Map<string, string>();

export function safeGet(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    // bloqueado: sigue a memoria
  }
  return mem.has(key) ? mem.get(key)! : null;
}

export function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      mem.set(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  mem.delete(key);
}

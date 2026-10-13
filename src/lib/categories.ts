import type { Product } from '../types';

export interface SubcategoryEntry {
  name: string;
  count: number;
}

export interface DepartmentEntry {
  name: string;
  count: number;
  subcategories: SubcategoryEntry[];
}

/** Agrupa el catálogo en departamentos con sus subcategorías (para menús desplegables). */
export function getDepartmentTree(products: Product[]): DepartmentEntry[] {
  const map = new Map<string, { count: number; subs: Map<string, number> }>();
  for (const p of products) {
    if (p.active === false) continue;
    const dept = (p.category || 'Otros').trim() || 'Otros';
    let entry = map.get(dept);
    if (!entry) {
      entry = { count: 0, subs: new Map() };
      map.set(dept, entry);
    }
    entry.count += 1;
    const sub = (p.subcategory || '').trim();
    if (sub) entry.subs.set(sub, (entry.subs.get(sub) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      count: v.count,
      subcategories: Array.from(v.subs.entries())
        .map(([sname, scount]) => ({ name: sname, count: scount }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * ¿El producto coincide con el filtro? Vale categoría o subcategoría
 * (coincidencia exacta, contenida o por palabras de 3+ letras).
 */
export function productMatchesFilter(p: Product, filter: string | null): boolean {
  if (!filter) return true;
  const target = filter.toLowerCase().trim();
  if (!target) return true;
  const haystacks = [(p.category || '').toLowerCase().trim(), (p.subcategory || '').toLowerCase().trim()].filter(Boolean);
  for (const hay of haystacks) {
    if (hay === target || hay.includes(target) || target.includes(hay)) return true;
  }
  const tokens = (s: string) => s.split(/[&/,\s]+/).filter((t) => t.length > 2);
  const targetTokens = tokens(target);
  for (const hay of haystacks) {
    if (targetTokens.some((tok) => hay.includes(tok))) return true;
    const hayTokens = tokens(hay);
    if (hayTokens.some((tok) => target.includes(tok))) return true;
  }
  return false;
}

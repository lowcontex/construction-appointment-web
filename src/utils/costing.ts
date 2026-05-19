import { Service, CostBreakdown } from '@/types';

export function calcCost(
  service: Service,
  area: number,
  floors: number = 1,
  grade: 'standard' | 'premium' | 'economy' = 'standard',
  timeline: 'normal' | 'rush' = 'normal'
): CostBreakdown {
  const gm = grade === 'premium' ? 1.3 : grade === 'economy' ? 0.8 : 1;
  const lm = timeline === 'rush' ? 1.2 : 1;
  const totalArea = area * floors;
  const mat = service.baseCostPerSqm.materials * totalArea * gm;
  const labor = service.baseCostPerSqm.labor * totalArea * lm;
  const fixed = service.materials
    .filter(m => m.fixed)
    .reduce((s, m) => s + (m.fixed! * gm), 0);
  const subtotal = mat + labor + fixed;
  const vat = subtotal * 0.12;
  const total = subtotal + vat;
  return { mat, labor, fixed, vat, total, totalArea };
}

export function formatPHP(n: number): string {
  return '₱' + Math.round(n).toLocaleString();
}

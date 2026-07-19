import { FINANCE, MONTHS_SHORT, MONTHS_LONG } from './config';

// Formata número como moeda BRL: R$ 12.698,02
export function formatBRL(value) {
  const n = Number(value) || 0;
  return n.toLocaleString(FINANCE.LOCALE, {
    style: 'currency',
    currency: FINANCE.CURRENCY,
  });
}

// Formata sem o símbolo (para inputs/labels compactos)
export function formatNumber(value) {
  const n = Number(value) || 0;
  return n.toLocaleString(FINANCE.LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// "2026-08" -> "Ago/26"
export function monthKeyLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_SHORT[m - 1]}/${String(y).slice(2)}`;
}

// "2026-08" -> "Agosto de 2026"
export function monthKeyLong(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} de ${y}`;
}

// Date -> "2026-08"
export function toMonthKey(year, month /* 1-12 */) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// Gera a lista de chaves de mês projetadas a partir do início configurado.
export function projectionMonthKeys() {
  const keys = [];
  let y = FINANCE.START_YEAR;
  let m = FINANCE.START_MONTH;
  for (let i = 0; i < FINANCE.PROJECTION_MONTHS; i++) {
    keys.push(toMonthKey(y, m));
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return keys;
}

// Mês "atual" do app: hoje se já estivermos no período projetado,
// senão o mês inicial do cenário (Ago/2026).
export function currentMonthKey() {
  const now = new Date();
  const nowKey = toMonthKey(now.getFullYear(), now.getMonth() + 1);
  const start = toMonthKey(FINANCE.START_YEAR, FINANCE.START_MONTH);
  return nowKey < start ? start : nowKey;
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.max(0, Math.min(100, (part / whole) * 100));
}

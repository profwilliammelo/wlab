import { projectionMonthKeys } from './format';

// Agrupa transações por mês (chave "YYYY-MM").
export function txMonthKey(tx) {
  return String(tx.occurred_on).slice(0, 7);
}

// Resumo de um único mês.
export function monthSummary(transactions, monthKey) {
  const inMonth = transactions.filter((t) => txMonthKey(t) === monthKey);

  let income = 0;
  let expenseFixed = 0;
  let expenseVar = 0;

  for (const t of inMonth) {
    const amt = Number(t.amount) || 0;
    if (t.kind === 'income') income += amt;
    else if (t.is_fixed) expenseFixed += amt;
    else expenseVar += amt;
  }

  const expense = expenseFixed + expenseVar;
  const free = income - expense; // saldo livre

  return {
    monthKey,
    income,
    expense,
    expenseFixed,
    expenseVar,
    free,
    transactions: inMonth,
  };
}

// Série para o gráfico de fluxo (todos os meses projetados).
export function cashFlowSeries(transactions, monthlyGoal) {
  const keys = allMonthKeys(transactions);
  return keys.map((key) => {
    const s = monthSummary(transactions, key);
    return {
      monthKey: key,
      receitas: round2(s.income),
      despesas: round2(s.expense),
      saldo: round2(s.free),
      meta: monthlyGoal,
    };
  });
}

// Saldo acumulado (soma de saldos livres ao longo dos meses).
export function accumulatedBalance(transactions, upToMonthKey) {
  const keys = allMonthKeys(transactions).filter((k) => k <= upToMonthKey);
  return keys.reduce((acc, k) => acc + monthSummary(transactions, k).free, 0);
}

// União das chaves projetadas + chaves que realmente têm transações.
export function allMonthKeys(transactions) {
  const set = new Set(projectionMonthKeys());
  for (const t of transactions) set.add(txMonthKey(t));
  return [...set].sort();
}

// Distribuição de despesas por categoria (para o mês dado).
export function expenseByCategory(transactions, monthKey) {
  const map = new Map();
  for (const t of transactions) {
    if (t.kind !== 'expense' || txMonthKey(t) !== monthKey) continue;
    map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round2(value) }))
    .sort((a, b) => b.value - a.value);
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// ------------------------- CAIXINHAS (cumulativo) ---------------------
// Saldo de uma caixinha AO FINAL de um mês = soma de todos os movimentos
// cujo mês seja <= o mês informado. Assim ela acumula mês a mês e não
// "vaza" valor para meses anteriores ao aporte.
export function boxBalanceAtMonth(movements, boxId, monthKey) {
  let total = 0;
  for (const m of movements) {
    if (m.box_id === boxId && String(m.occurred_on).slice(0, 7) <= monthKey) {
      total += Number(m.amount) || 0;
    }
  }
  return round2(total);
}

// Total provisionado (todas as caixinhas) até o mês informado.
export function totalProvisionedAtMonth(movements, monthKey) {
  let total = 0;
  for (const m of movements) {
    if (String(m.occurred_on).slice(0, 7) <= monthKey) total += Number(m.amount) || 0;
  }
  return round2(total);
}

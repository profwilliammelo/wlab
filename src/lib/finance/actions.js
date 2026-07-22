// =====================================================================
//  Camada de acesso a dados do app financeiro.
//
//  Em Next.js estas seriam Server Actions (app/actions/finance.ts).
//  Como o projeto é uma SPA Vite, elas rodam no cliente e falam direto
//  com o Supabase — a segurança fica por conta do Row Level Security
//  (cada usuário só toca nas próprias linhas, user_id = auth.uid()).
// =====================================================================

import { supabase } from '../supabaseClient';
import {
  SETTINGS_KEYS, DEFAULT_MONTHLY_GOAL, SEED_VERSION,
  MONTHLY_INCOMES, EXTRA_INCOMES, FIXED_EXPENSES, SEED_BOXES,
} from './config';
import { projectionMonthKeys } from './format';

// ----------------------------- TRANSAÇÕES -----------------------------

export async function listTransactions() {
  const { data, error } = await supabase
    .from('fin_transactions')
    .select('*')
    .order('occurred_on', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Cria uma transação. Se for uma DESPESA vinculada a uma caixinha
// (box_id) e syncBox=true, gera um MOVIMENTO datado no extrato da caixinha
// (fin_box_movements), na data da despesa — assim a caixinha acumula mês a
// mês. Se o movimento falhar, desfazemos a transação (ação compensatória).
export async function createTransaction(tx, { syncBox = true } = {}) {
  const { data, error } = await supabase
    .from('fin_transactions')
    .insert(sanitizeTx(tx))
    .select()
    .single();
  if (error) throw error;

  if (syncBox && data.kind === 'expense' && data.box_id) {
    try {
      await syncBoxMovementForTx(data);
    } catch (e) {
      await supabase.from('fin_transactions').delete().eq('id', data.id);
      throw e;
    }
  }
  return data;
}

// Update "cru" (primitivo) — não mexe em caixinha.
export async function updateTransaction(id, patch) {
  const { data, error } = await supabase
    .from('fin_transactions')
    .update(sanitizeTx(patch))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Edita uma transação. Opções:
//   • applyToGroup: aplica a mesma mudança a TODAS as ocorrências
//     recorrentes (mesmo group_id) — ex.: mudar a despesa fixa em todos
//     os meses. Preserva o mês de cada ocorrência (só a "forma" muda).
//   • syncBox: reconcilia o extrato da caixinha de cada linha afetada
//     (o movimento datado é recriado a partir do estado novo da despesa).
export async function editTransaction(original, patch, { syncBox = true, applyToGroup = false } = {}) {
  let targets = [original];
  if (applyToGroup && original.group_id) {
    const { data, error } = await supabase
      .from('fin_transactions')
      .select('*')
      .eq('group_id', original.group_id);
    if (error) throw error;
    if (data && data.length) targets = data;
  }

  // Campos de "forma" propagados a todas as ocorrências.
  const shape = {};
  for (const f of ['description', 'category', 'kind', 'amount', 'is_fixed', 'box_id']) {
    if (patch[f] !== undefined) shape[f] = patch[f];
  }

  let last = null;
  for (const t of targets) {
    const rowPatch = { ...shape };
    // Numa edição de linha única, a data/dia também pode mudar.
    if (!applyToGroup && patch.occurred_on !== undefined) rowPatch.occurred_on = patch.occurred_on;
    last = await updateTransaction(t.id, rowPatch);
    if (syncBox) await syncBoxMovementForTx(last);
  }
  return last;
}

// Delete "cru" (primitivo).
export async function deleteTransaction(id) {
  const { error } = await supabase.from('fin_transactions').delete().eq('id', id);
  if (error) throw error;
}

// Exclui uma transação. O movimento de caixinha vinculado some sozinho
// (ON DELETE CASCADE em transaction_id). Com applyToGroup, remove todas as
// ocorrências recorrentes.
export async function removeTransaction(tx, { applyToGroup = false } = {}) {
  if (applyToGroup && tx.group_id) {
    const { error } = await supabase.from('fin_transactions').delete().eq('group_id', tx.group_id);
    if (error) throw error;
    return;
  }
  await deleteTransaction(tx.id);
}

function sanitizeTx(tx) {
  const out = {};
  if (tx.occurred_on !== undefined) out.occurred_on = tx.occurred_on;
  if (tx.description !== undefined) out.description = tx.description;
  if (tx.category !== undefined) out.category = tx.category;
  if (tx.kind !== undefined) out.kind = tx.kind;
  if (tx.amount !== undefined) out.amount = Number(tx.amount);
  if (tx.is_fixed !== undefined) out.is_fixed = !!tx.is_fixed;
  if (tx.is_projected !== undefined) out.is_projected = !!tx.is_projected;
  if (tx.box_id !== undefined) out.box_id = tx.box_id || null;
  if (tx.group_id !== undefined) out.group_id = tx.group_id || null;
  return out;
}

// ----------------------------- CAIXINHAS ------------------------------

export async function listBoxes() {
  const { data, error } = await supabase
    .from('fin_boxes')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createBox(box) {
  const { data, error } = await supabase
    .from('fin_boxes')
    .insert(sanitizeBox(box))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBox(id, patch) {
  const { data, error } = await supabase
    .from('fin_boxes')
    .update(sanitizeBox(patch))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBox(id) {
  const { error } = await supabase.from('fin_boxes').delete().eq('id', id);
  if (error) throw error;
}

function sanitizeBox(box) {
  const out = {};
  if (box.name !== undefined) out.name = box.name;
  if (box.goal_amount !== undefined) out.goal_amount = Number(box.goal_amount);
  if (box.current_amount !== undefined) out.current_amount = Number(box.current_amount);
  if (box.color !== undefined) out.color = box.color;
  if (box.icon !== undefined) out.icon = box.icon;
  if (box.sort_order !== undefined) out.sort_order = box.sort_order;
  return out;
}

// -------------------- EXTRATO DAS CAIXINHAS (movimentos) --------------
// O saldo de uma caixinha num mês é a soma dos movimentos até aquele mês
// (ver derive.js:boxBalanceAtMonth). Cada movimento é datado.

export async function listBoxMovements() {
  const { data, error } = await supabase
    .from('fin_box_movements')
    .select('*')
    .order('occurred_on', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Estorna (remove) um movimento manual do extrato. Movimentos ligados a
// uma despesa (transaction_id) não são removidos por aqui — mexa na
// despesa. O saldo é recalculado sozinho, pois é derivado do extrato.
export async function deleteBoxMovement(id) {
  const { error } = await supabase.from('fin_box_movements').delete().eq('id', id);
  if (error) throw error;
}

// Aporte/retirada manual, DATADO no mês informado (dia 15). Positivo entra,
// negativo sai. É o que faz a caixinha "acumular" a partir daquele mês.
export async function addManualBoxMovement(boxId, monthKey, amount, note = 'Aporte manual') {
  if (!boxId || !Number(amount)) return null;
  const { data, error } = await supabase
    .from('fin_box_movements')
    .insert({ box_id: boxId, occurred_on: `${monthKey}-15`, amount: Number(amount), note })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Ajuste manual do SALDO ACUMULADO (global — box_id NULL). Datado no mês.
// Não cria receita/despesa: só corrige o acumulado a partir daquele mês.
export async function addGlobalAdjustment(monthKey, amount, note = 'Ajuste de saldo') {
  if (!Number(amount)) return null;
  const { data, error } = await supabase
    .from('fin_box_movements')
    .insert({ box_id: null, occurred_on: `${monthKey}-15`, amount: Number(amount), note })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Mantém 1 movimento por despesa vinculada (chave: transaction_id).
// Cria/atualiza quando a despesa aponta para uma caixinha; remove quando
// deixa de apontar (virou receita, perdeu o vínculo, etc.).
export async function syncBoxMovementForTx(tx) {
  const shouldHave = tx.kind === 'expense' && !!tx.box_id;

  const { data: existing, error: exErr } = await supabase
    .from('fin_box_movements')
    .select('id')
    .eq('transaction_id', tx.id)
    .maybeSingle();
  if (exErr) throw exErr;

  if (!shouldHave) {
    if (existing) {
      const { error } = await supabase.from('fin_box_movements').delete().eq('id', existing.id);
      if (error) throw error;
    }
    return null;
  }

  const payload = {
    box_id: tx.box_id,
    transaction_id: tx.id,
    occurred_on: tx.occurred_on,
    amount: Number(tx.amount),
    note: 'Despesa vinculada',
  };
  if (existing) {
    const { error } = await supabase.from('fin_box_movements').update(payload).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('fin_box_movements').insert(payload);
    if (error) throw error;
  }
  return null;
}

// ---------------------------- CONFIGURAÇÕES ---------------------------

export async function getSetting(key, fallback = null) {
  const { data, error } = await supabase
    .from('fin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : fallback;
}

export async function setSetting(key, value) {
  const { data, error } = await supabase
    .from('fin_settings')
    .upsert({ key, value }, { onConflict: 'user_id,key' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ------------------------- SEED DO CENÁRIO ----------------------------
// Gera as receitas e despesas fixas projetadas (a partir de Ago/2026) e as
// caixinhas iniciais, a partir das listas em config.js. Tudo editável depois.

// Monta as linhas de transação do cenário (não grava — só monta).
// Cada linha recorrente compartilha um group_id estável entre os meses,
// para permitir "editar em todos os meses".
function buildScenarioTransactions() {
  const months = projectionMonthKeys();
  const txs = [];
  const groups = new Map();
  const groupFor = (k) => {
    if (!groups.has(k)) groups.set(k, crypto.randomUUID());
    return groups.get(k);
  };

  for (const key of months) {
    const day = (d) => `${key}-${String(d).padStart(2, '0')}`;

    for (const inc of MONTHLY_INCOMES) {
      txs.push(income(day(inc.day), inc.description, inc.category, inc.amount, true, groupFor('inc:' + inc.description)));
    }
    for (const ex of EXTRA_INCOMES) {
      if (ex.monthKey === key) {
        txs.push(income(day(ex.day), ex.description, ex.category, ex.amount, false, groupFor('extra:' + ex.description)));
      }
    }
    for (const exp of FIXED_EXPENSES) {
      txs.push(expense(day(exp.day), exp.description, exp.category, exp.amount, true, groupFor('exp:' + exp.description)));
    }
  }
  return txs;
}

// Grava o cenário completo (transações + caixinhas + settings).
async function writeScenario() {
  const txs = buildScenarioTransactions();
  if (txs.length) {
    const { error } = await supabase.from('fin_transactions').insert(txs);
    if (error) throw error;
  }

  const { error: boxErr } = await supabase.from('fin_boxes').insert(SEED_BOXES);
  if (boxErr) throw boxErr;

  await setSetting(SETTINGS_KEYS.MONTHLY_GOAL, DEFAULT_MONTHLY_GOAL);
  await setSetting(SETTINGS_KEYS.SEEDED, true);
  await setSetting(SETTINGS_KEYS.SEED_VERSION, SEED_VERSION);
}

// Roda uma vez, no primeiro acesso (se ainda não houver cenário).
export async function ensureSeeded() {
  const seeded = await getSetting(SETTINGS_KEYS.SEEDED, false);
  if (seeded) return false;
  await writeScenario();
  return true;
}

// Apaga TODO o cenário atual (transações + caixinhas) e regenera do zero
// com os valores projetados de config.js. Usado pelo botão "Regenerar
// cenário" — ideal para reaplicar a projeção fixa. Zera edições manuais.
const ALL_ROWS = '00000000-0000-0000-0000-000000000000';
export async function regenerateScenario() {
  // Movimentos primeiro (cascatas também cobririam, mas somos explícitos).
  const delMov = await supabase.from('fin_box_movements').delete().neq('id', ALL_ROWS);
  if (delMov.error) throw delMov.error;
  const delTx = await supabase.from('fin_transactions').delete().neq('id', ALL_ROWS);
  if (delTx.error) throw delTx.error;
  const delBox = await supabase.from('fin_boxes').delete().neq('id', ALL_ROWS);
  if (delBox.error) throw delBox.error;
  await writeScenario();
  return true;
}

function income(occurred_on, description, category, amount, is_fixed = true, group_id = null) {
  return { occurred_on, description, category, kind: 'income', amount, is_fixed, is_projected: true, group_id };
}
function expense(occurred_on, description, category, amount, is_fixed = true, group_id = null) {
  return { occurred_on, description, category, kind: 'expense', amount, is_fixed, is_projected: true, group_id };
}

// ------------------------- CARGA COMPLETA -----------------------------
// Busca tudo de uma vez para montar o dashboard.

export async function loadFinanceData() {
  await ensureSeeded();
  const [transactions, boxes, movements, monthlyGoal] = await Promise.all([
    listTransactions(),
    listBoxes(),
    listBoxMovements(),
    getSetting(SETTINGS_KEYS.MONTHLY_GOAL, DEFAULT_MONTHLY_GOAL),
  ]);
  return { transactions, boxes, movements, monthlyGoal: Number(monthlyGoal) || DEFAULT_MONTHLY_GOAL };
}

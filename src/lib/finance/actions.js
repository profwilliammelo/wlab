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
// (box_id) e syncBox=true, soma automaticamente o valor no montante da
// caixinha — em "uma operação" do ponto de vista do usuário. Como o
// Supabase-JS não abre transação multi-tabela no cliente, garantimos a
// consistência com uma ação compensatória: se a atualização da caixinha
// falhar, desfazemos a transação recém-criada.
export async function createTransaction(tx, { syncBox = true } = {}) {
  const { data, error } = await supabase
    .from('fin_transactions')
    .insert(sanitizeTx(tx))
    .select()
    .single();
  if (error) throw error;

  if (syncBox && data.kind === 'expense' && data.box_id) {
    try {
      await adjustBoxAmount(data.box_id, Number(data.amount));
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

// Edita uma transação e concilia o saldo das caixinhas envolvidas.
// `original` é a linha atual (antes da edição); `patch` traz os campos
// novos. Com syncBox=true:
//   • se a caixinha continuou a mesma, aplica só a diferença de valor;
//   • se mudou (ou virou receita / perdeu o vínculo), devolve o valor
//     antigo à caixinha antiga e lança o novo na caixinha nova.
export async function editTransaction(original, patch, { syncBox = true } = {}) {
  const merged = { ...original, ...patch };
  const updated = await updateTransaction(original.id, patch);

  if (syncBox) {
    const oldBox = original.kind === 'expense' ? original.box_id : null;
    const newBox = merged.kind === 'expense' ? merged.box_id : null;
    const oldAmt = Number(original.amount) || 0;
    const newAmt = Number(merged.amount) || 0;

    if (oldBox && oldBox === newBox) {
      await adjustBoxAmount(oldBox, newAmt - oldAmt);
    } else {
      if (oldBox) await adjustBoxAmount(oldBox, -oldAmt);
      if (newBox) await adjustBoxAmount(newBox, newAmt);
    }
  }
  return updated;
}

// Delete "cru" (primitivo) — não mexe em caixinha.
export async function deleteTransaction(id) {
  const { error } = await supabase.from('fin_transactions').delete().eq('id', id);
  if (error) throw error;
}

// Exclui uma transação e, se for despesa vinculada, devolve o valor à
// caixinha (conciliação automática).
export async function removeTransaction(tx, { syncBox = true } = {}) {
  await deleteTransaction(tx.id);
  if (syncBox && tx.kind === 'expense' && tx.box_id) {
    await adjustBoxAmount(tx.box_id, -Number(tx.amount));
  }
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

// Aloca (ou retira, com valor negativo) um valor na caixinha.
export async function allocateToBox(box, delta) {
  const next = Math.max(0, Number(box.current_amount) + Number(delta));
  return updateBox(box.id, { current_amount: next });
}

// Igual ao allocateToBox, mas só recebe o id — busca o saldo atual antes
// de somar o delta. Usado pela automação de despesas vinculadas.
export async function adjustBoxAmount(boxId, delta) {
  if (!boxId || !Number(delta)) return null;
  const { data: box, error } = await supabase
    .from('fin_boxes')
    .select('id, current_amount')
    .eq('id', boxId)
    .single();
  if (error) throw error;
  const next = Math.max(0, Number(box.current_amount) + Number(delta));
  return updateBox(boxId, { current_amount: next });
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
function buildScenarioTransactions() {
  const months = projectionMonthKeys();
  const txs = [];

  for (const key of months) {
    const day = (d) => `${key}-${String(d).padStart(2, '0')}`;

    for (const inc of MONTHLY_INCOMES) {
      txs.push(income(day(inc.day), inc.description, inc.category, inc.amount));
    }
    for (const ex of EXTRA_INCOMES) {
      if (ex.monthKey === key) {
        txs.push(income(day(ex.day), ex.description, ex.category, ex.amount, false));
      }
    }
    for (const exp of FIXED_EXPENSES) {
      txs.push(expense(day(exp.day), exp.description, exp.category, exp.amount));
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
  const delTx = await supabase.from('fin_transactions').delete().neq('id', ALL_ROWS);
  if (delTx.error) throw delTx.error;
  const delBox = await supabase.from('fin_boxes').delete().neq('id', ALL_ROWS);
  if (delBox.error) throw delBox.error;
  await writeScenario();
  return true;
}

function income(occurred_on, description, category, amount, is_fixed = true) {
  return { occurred_on, description, category, kind: 'income', amount, is_fixed, is_projected: true };
}
function expense(occurred_on, description, category, amount, is_fixed = true) {
  return { occurred_on, description, category, kind: 'expense', amount, is_fixed, is_projected: true };
}

// ------------------------- CARGA COMPLETA -----------------------------
// Busca tudo de uma vez para montar o dashboard.

export async function loadFinanceData() {
  await ensureSeeded();
  const [transactions, boxes, monthlyGoal] = await Promise.all([
    listTransactions(),
    listBoxes(),
    getSetting(SETTINGS_KEYS.MONTHLY_GOAL, DEFAULT_MONTHLY_GOAL),
  ]);
  return { transactions, boxes, monthlyGoal: Number(monthlyGoal) || DEFAULT_MONTHLY_GOAL };
}

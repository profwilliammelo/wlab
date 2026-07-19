// =====================================================================
//  Camada de acesso a dados do app financeiro.
//
//  Em Next.js estas seriam Server Actions (app/actions/finance.ts).
//  Como o projeto é uma SPA Vite, elas rodam no cliente e falam direto
//  com o Supabase — a segurança fica por conta do Row Level Security
//  (cada usuário só toca nas próprias linhas, user_id = auth.uid()).
// =====================================================================

import { supabase } from '../supabaseClient';
import { FINANCE, SETTINGS_KEYS, DEFAULT_MONTHLY_GOAL } from './config';
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

export async function createTransaction(tx) {
  const { data, error } = await supabase
    .from('fin_transactions')
    .insert(sanitizeTx(tx))
    .select()
    .single();
  if (error) throw error;
  return data;
}

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

export async function deleteTransaction(id) {
  const { error } = await supabase.from('fin_transactions').delete().eq('id', id);
  if (error) throw error;
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
// Gera as receitas projetadas (salário + GERER todo mês, 13º em Junho),
// algumas despesas fixas de exemplo e caixinhas iniciais.
// Idempotente: só roda se a flag `seeded` ainda não existir.

export async function ensureSeeded() {
  const seeded = await getSetting(SETTINGS_KEYS.SEEDED, false);
  if (seeded) return false;

  const months = projectionMonthKeys();
  const txs = [];

  for (const key of months) {
    const m = Number(key.split('-')[1]);
    const day = (d) => `${key}-${String(d).padStart(2, '0')}`;

    // Receitas fixas do mês
    txs.push(income(day(5), 'Salário base (líquido)', 'Salário', FINANCE.SALARY_BASE));
    txs.push(income(day(5), 'GERER — Regime Suplementar (líquido)', 'GERER', FINANCE.GERER));

    // 13º salário — só em Junho
    if (m === FINANCE.THIRTEENTH_MONTH) {
      txs.push(income(day(20), '13º Salário (provisão)', '13º Salário', FINANCE.THIRTEENTH, false));
    }

    // Despesas fixas de exemplo (edite/ajuste à vontade no painel)
    txs.push(expense(day(10), 'Moradia (aluguel/condomínio)', 'Moradia', 3200));
    txs.push(expense(day(12), 'Alimentação', 'Alimentação', 1800));
    txs.push(expense(day(15), 'Transporte', 'Transporte', 700));
    txs.push(expense(day(8), 'Assinaturas e serviços', 'Assinaturas', 250));
  }

  // Insere transações em lote
  if (txs.length) {
    const { error } = await supabase.from('fin_transactions').insert(txs);
    if (error) throw error;
  }

  // Caixinhas iniciais
  const boxes = [
    { name: 'Leão / IR', goal_amount: 12000, current_amount: 0, color: '#b45309', icon: 'landmark', sort_order: 1 },
    { name: 'Reserva de Emergência', goal_amount: 60000, current_amount: 0, color: '#047857', icon: 'shield', sort_order: 2 },
    { name: 'Viagem', goal_amount: 15000, current_amount: 0, color: '#be123c', icon: 'plane', sort_order: 3 },
  ];
  const { error: boxErr } = await supabase.from('fin_boxes').insert(boxes);
  if (boxErr) throw boxErr;

  await setSetting(SETTINGS_KEYS.MONTHLY_GOAL, DEFAULT_MONTHLY_GOAL);
  await setSetting(SETTINGS_KEYS.SEEDED, true);
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

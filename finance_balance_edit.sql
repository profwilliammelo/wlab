-- =====================================================================
--  MIGRAÇÃO — Edição manual de saldo (caixinhas e Saldo Acumulado)
--  Rode UMA VEZ no SQL Editor (depois do finance_boxes_ledger.sql).
--  Idempotente.
--
--  Permite gravar um "ajuste" de saldo global (não ligado a nenhuma
--  caixinha) no mesmo extrato datado: box_id NULL = ajuste do Saldo
--  Acumulado. Assim dá pra DEFINIR o saldo direto, sem criar despesa/
--  receita, e ele acumula do mês escolhido em diante.
-- =====================================================================

alter table public.fin_box_movements alter column box_id drop not null;

-- Pronto. Movimentos com box_id NULL são ajustes do Saldo Acumulado;
-- com box_id preenchido são aportes/retiradas de uma caixinha.

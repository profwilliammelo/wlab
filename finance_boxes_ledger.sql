-- =====================================================================
--  MIGRAÇÃO — Caixinhas cumulativas por mês + edição recorrente
--
--  Rode UMA VEZ no SQL Editor (depois do finance_schema.sql).
--  Idempotente.
--
--  O que muda:
--   1) fin_transactions ganha group_id (agrupa ocorrências recorrentes,
--      para "editar em todos os meses").
--   2) Nova tabela fin_box_movements: o saldo da caixinha passa a ser um
--      EXTRATO datado. O saldo num mês = soma dos movimentos até aquele
--      mês (cumulativo, sem "vazar" valor para meses anteriores).
-- =====================================================================

-- 1) group_id para recorrência ---------------------------------------
alter table public.fin_transactions add column if not exists group_id uuid;
create index if not exists fin_transactions_group_idx on public.fin_transactions (group_id);

-- Backfill: recorrentes existentes (fixas) com mesma descrição+tipo
-- passam a compartilhar um group_id estável.
update public.fin_transactions
   set group_id = md5(lower(description) || '|' || kind)::uuid
 where is_fixed = true
   and group_id is null;

-- 2) Extrato datado das caixinhas ------------------------------------
create table if not exists public.fin_box_movements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  box_id          uuid not null references public.fin_boxes (id) on delete cascade,
  -- quando o movimento nasce de uma despesa vinculada, guardamos o vínculo
  transaction_id  uuid references public.fin_transactions (id) on delete cascade,
  occurred_on     date not null,
  amount          numeric(12,2) not null,   -- + entra na caixinha, − sai
  note            text,
  created_at      timestamptz not null default now()
);

create index if not exists fin_box_movements_box_date_idx
  on public.fin_box_movements (box_id, occurred_on);

-- Um movimento por despesa vinculada (facilita o "upsert" na edição).
create unique index if not exists fin_box_movements_tx_uidx
  on public.fin_box_movements (transaction_id)
  where transaction_id is not null;

-- RLS: admin + dono, igual às demais tabelas fin_
alter table public.fin_box_movements enable row level security;
drop policy if exists fin_box_movements_admin_owner on public.fin_box_movements;
create policy fin_box_movements_admin_owner on public.fin_box_movements
  for all to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());

-- 3) Preserva saldos atuais ------------------------------------------
-- Converte o current_amount que já existe em um movimento inicial datado
-- em Ago/2026, para não perder o que já foi provisionado. Depois zera o
-- current_amount (o saldo passa a ser derivado do extrato).
insert into public.fin_box_movements (user_id, box_id, occurred_on, amount, note)
select b.user_id, b.id, date '2026-08-01', b.current_amount, 'Saldo inicial (migração)'
  from public.fin_boxes b
 where b.current_amount <> 0
   and not exists (
     select 1 from public.fin_box_movements m where m.box_id = b.id
   );

update public.fin_boxes set current_amount = 0 where current_amount <> 0;

-- Pronto. Daqui pra frente o app grava movimentos datados e o saldo de
-- cada mês é calculado de forma cumulativa.

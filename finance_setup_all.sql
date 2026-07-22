-- =====================================================================
--  APP FINANCEIRO PESSOAL — SETUP COMPLETO (tudo de uma vez)
--
--  Rode este arquivo INTEIRO no SQL Editor do Supabase do site.
--  É IDEMPOTENTE e seguro: pode rodar mesmo que partes já tenham sido
--  aplicadas antes — nada é duplicado nem perdido.
--
--  Reúne: finance_schema.sql + finance_boxes_ledger.sql +
--         finance_balance_edit.sql
--
--  Requisito: a função public.is_admin() já existe no banco (é a mesma
--  que o Modo Exu usa). Tabelas prefixadas fin_ para conviver com o site.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CAIXINHAS
-- ---------------------------------------------------------------------
create table if not exists public.fin_boxes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name            text not null,
  goal_amount     numeric(12,2) not null default 0,
  current_amount  numeric(12,2) not null default 0,
  color           text not null default '#b45309',
  icon            text not null default 'piggy-bank',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) TRANSAÇÕES (receitas e despesas — reais e projetadas)
-- ---------------------------------------------------------------------
create table if not exists public.fin_transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  occurred_on   date not null,
  description   text not null,
  category      text not null default 'Geral',
  kind          text not null check (kind in ('income','expense')),
  amount        numeric(12,2) not null check (amount >= 0),
  is_fixed      boolean not null default false,
  is_projected  boolean not null default true,
  box_id        uuid references public.fin_boxes (id) on delete set null,
  group_id      uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Garante colunas novas mesmo se a tabela já existia numa versão antiga.
alter table public.fin_transactions add column if not exists box_id   uuid references public.fin_boxes (id) on delete set null;
alter table public.fin_transactions add column if not exists group_id uuid;

create index if not exists fin_transactions_user_date_idx on public.fin_transactions (user_id, occurred_on);
create index if not exists fin_transactions_box_idx       on public.fin_transactions (box_id);
create index if not exists fin_transactions_group_idx     on public.fin_transactions (group_id);

-- ---------------------------------------------------------------------
-- 3) CONFIGURAÇÕES / METAS (key-value por usuário)
-- ---------------------------------------------------------------------
create table if not exists public.fin_settings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key         text not null,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  unique (user_id, key)
);

-- ---------------------------------------------------------------------
-- 3.5) EXTRATO DAS CAIXINHAS (movimentos datados)
--      Saldo da caixinha num mês = soma dos movimentos até aquele mês.
--      box_id NULL = ajuste do SALDO ACUMULADO (global).
-- ---------------------------------------------------------------------
create table if not exists public.fin_box_movements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  box_id          uuid references public.fin_boxes (id) on delete cascade,
  transaction_id  uuid references public.fin_transactions (id) on delete cascade,
  occurred_on     date not null,
  amount          numeric(12,2) not null,
  note            text,
  created_at      timestamptz not null default now()
);

-- Se a tabela já existia com box_id NOT NULL, libera o NULL (ajuste global).
alter table public.fin_box_movements alter column box_id drop not null;

create index if not exists fin_box_movements_box_date_idx on public.fin_box_movements (box_id, occurred_on);
create unique index if not exists fin_box_movements_tx_uidx
  on public.fin_box_movements (transaction_id) where transaction_id is not null;

-- ---------------------------------------------------------------------
-- 4) trigger updated_at
-- ---------------------------------------------------------------------
create or replace function public.fin_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fin_boxes_touch on public.fin_boxes;
create trigger trg_fin_boxes_touch before update on public.fin_boxes
  for each row execute function public.fin_touch_updated_at();

drop trigger if exists trg_fin_transactions_touch on public.fin_transactions;
create trigger trg_fin_transactions_touch before update on public.fin_transactions
  for each row execute function public.fin_touch_updated_at();

drop trigger if exists trg_fin_settings_touch on public.fin_settings;
create trigger trg_fin_settings_touch before update on public.fin_settings
  for each row execute function public.fin_touch_updated_at();

-- ---------------------------------------------------------------------
-- 5) Row Level Security — admin (public.is_admin()) + dono da linha
--    Anônimo e logado-não-admin são bloqueados no próprio Postgres.
-- ---------------------------------------------------------------------
alter table public.fin_boxes         enable row level security;
alter table public.fin_transactions  enable row level security;
alter table public.fin_settings      enable row level security;
alter table public.fin_box_movements enable row level security;

-- Remove tanto os nomes antigos (v1) quanto os atuais, para poder recriar.
drop policy if exists fin_boxes_owner_all           on public.fin_boxes;
drop policy if exists fin_boxes_admin_owner         on public.fin_boxes;
drop policy if exists fin_transactions_owner_all    on public.fin_transactions;
drop policy if exists fin_transactions_admin_owner  on public.fin_transactions;
drop policy if exists fin_settings_owner_all        on public.fin_settings;
drop policy if exists fin_settings_admin_owner      on public.fin_settings;
drop policy if exists fin_box_movements_admin_owner on public.fin_box_movements;

create policy fin_boxes_admin_owner on public.fin_boxes
  for all to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());

create policy fin_transactions_admin_owner on public.fin_transactions
  for all to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());

create policy fin_settings_admin_owner on public.fin_settings
  for all to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());

create policy fin_box_movements_admin_owner on public.fin_box_movements
  for all to authenticated
  using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());

-- ---------------------------------------------------------------------
-- 6) Backfills idempotentes (só corrigem dados antigos; não repetem)
-- ---------------------------------------------------------------------

-- 6a) group_id para despesas/receitas fixas recorrentes que ainda não têm.
update public.fin_transactions
   set group_id = md5(lower(description) || '|' || kind)::uuid
 where is_fixed = true
   and group_id is null;

-- 6b) Preserva saldo atual das caixinhas: converte current_amount em um
--     movimento inicial datado em Ago/2026 e zera o campo (o saldo passa
--     a ser derivado do extrato). Só roda para caixinhas que ainda não
--     têm nenhum movimento — portanto seguro reexecutar.
insert into public.fin_box_movements (user_id, box_id, occurred_on, amount, note)
select b.user_id, b.id, date '2026-08-01', b.current_amount, 'Saldo inicial (migração)'
  from public.fin_boxes b
 where b.current_amount <> 0
   and not exists (select 1 from public.fin_box_movements m where m.box_id = b.id);

update public.fin_boxes set current_amount = 0 where current_amount <> 0;

-- =====================================================================
--  Pronto. O app popula o cenário (Ago/2026) na primeira vez que você
--  abre o Modo Exu > Finanças logado. Nada aqui precisa do seu user_id.
-- =====================================================================

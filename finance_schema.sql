-- =====================================================================
--  APP FINANCEIRO PESSOAL — Schema Supabase
--  Prefixo `fin_` para conviver com as tabelas do site profwilliammelo
--  no mesmo banco compartilhado.
--
--  Rode este script UMA VEZ no SQL Editor do projeto Supabase do site.
--  Todas as tabelas usam Row Level Security: cada usuário só enxerga e
--  edita as próprias linhas (user_id = auth.uid()).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CAIXINHAS (envelopes de provisionamento)
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
  is_fixed      boolean not null default false,   -- despesa/receita fixa recorrente
  is_projected  boolean not null default true,    -- projeção x realizado
  box_id        uuid references public.fin_boxes (id) on delete set null,
  group_id      uuid,                             -- agrupa ocorrências recorrentes
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists fin_transactions_user_date_idx
  on public.fin_transactions (user_id, occurred_on);

-- FK opcional para a caixinha de destino (despesa que abastece um envelope).
-- Já declarada acima em box_id; o índice acelera a conciliação por caixinha.
create index if not exists fin_transactions_box_idx
  on public.fin_transactions (box_id);

create index if not exists fin_transactions_group_idx
  on public.fin_transactions (group_id);

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
--      O saldo de uma caixinha num mês = soma dos movimentos até aquele
--      mês. Assim ela acumula mês a mês, sem "vazar" valor para o passado.
-- ---------------------------------------------------------------------
create table if not exists public.fin_box_movements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  box_id          uuid not null references public.fin_boxes (id) on delete cascade,
  transaction_id  uuid references public.fin_transactions (id) on delete cascade,
  occurred_on     date not null,
  amount          numeric(12,2) not null,   -- + entra na caixinha, − sai
  note            text,
  created_at      timestamptz not null default now()
);

create index if not exists fin_box_movements_box_date_idx
  on public.fin_box_movements (box_id, occurred_on);

create unique index if not exists fin_box_movements_tx_uidx
  on public.fin_box_movements (transaction_id)
  where transaction_id is not null;

-- ---------------------------------------------------------------------
-- 4) trigger de updated_at
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
-- 5) Row Level Security — DEFESA EM CAMADAS
--
--    Regra: só o ADMIN do site (public.is_admin(), a mesma função que o
--    Modo Exu já usa) E dono da linha (user_id = auth.uid()) pode ler ou
--    escrever. Consequências:
--      • anônimo (sem login) ............ bloqueado (políticas são `to authenticated`)
--      • logado que NÃO é admin ......... bloqueado (is_admin() = false)
--      • admin (você) ................... só enxerga/edita as próprias linhas
--    Ou seja: mesmo que alguém consiga uma sessão válida, não toca em nada.
-- ---------------------------------------------------------------------
alter table public.fin_boxes         enable row level security;
alter table public.fin_transactions  enable row level security;
alter table public.fin_settings      enable row level security;
alter table public.fin_box_movements enable row level security;

-- Recria as políticas de forma idempotente (drop + create) para garantir a
-- versão endurecida mesmo se uma versão anterior mais permissiva já existir.
drop policy if exists fin_boxes_owner_all        on public.fin_boxes;
drop policy if exists fin_transactions_owner_all on public.fin_transactions;
drop policy if exists fin_settings_owner_all     on public.fin_settings;
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

-- =====================================================================
--  Pronto. O app popula o cenário inicial (Ago/2026 em diante) na
--  primeira vez que você abre o dashboard logado — nenhum seed manual
--  é necessário aqui, pois cada linha precisa do seu auth.uid().
-- =====================================================================

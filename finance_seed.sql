-- =====================================================================
--  SEED / POPULAÇÃO DO CENÁRIO FINANCEIRO (opcional)
--
--  O app já popula sozinho na sua conta ao abrir o Modo Exu > Finanças
--  (ou pelo botão "Regenerar cenário"). Este script é uma ALTERNATIVA
--  para inserir os mesmos dados direto no banco, via SQL Editor.
--
--  Pré-requisito: rode antes o finance_schema.sql (tabelas + RLS).
--  Ajuste o e-mail admin abaixo se necessário.
-- =====================================================================

do $$
declare
  uid uuid;
  m   date;
  start_month date := date '2026-08-01';
  meses int := 12;
begin
  -- 1) Descobre o user_id do admin pelo e-mail
  select id into uid from auth.users
   where email = 'williamcorrea95@gmail.com'
   limit 1;

  if uid is null then
    raise exception 'Usuário admin não encontrado. Ajuste o e-mail no script.';
  end if;

  -- 2) Limpa cenário anterior deste usuário (idempotente)
  delete from public.fin_transactions where user_id = uid;
  delete from public.fin_boxes        where user_id = uid;

  -- 3) Gera 12 meses a partir de Ago/2026
  for i in 0..(meses - 1) loop
    m := start_month + (i || ' months')::interval;

    -- Receitas fixas mensais
    insert into public.fin_transactions (user_id, occurred_on, description, category, kind, amount, is_fixed, is_projected) values
      (uid, m + 4,  'Salário base (líquido)',                 'Salário', 'income', 12698.02, true, true),
      (uid, m + 4,  'GERER — Regime Suplementar (líquido)',   'GERER',   'income',  4548.92, true, true);

    -- Receitas pontuais projetadas
    if to_char(m, 'YYYY-MM') = '2026-12' then
      insert into public.fin_transactions (user_id, occurred_on, description, category, kind, amount, is_fixed, is_projected)
        values (uid, m + 19, '13º Salário — 2ª parcela', '13º Salário', 'income', 7443.17, false, true);
    end if;
    if to_char(m, 'YYYY-MM') = '2027-01' then
      insert into public.fin_transactions (user_id, occurred_on, description, category, kind, amount, is_fixed, is_projected)
        values (uid, m + 19, 'Férias — 1/3 constitucional', 'Férias', 'income', 6331.03, false, true);
    end if;

    -- Despesas fixas mensais
    insert into public.fin_transactions (user_id, occurred_on, description, category, kind, amount, is_fixed, is_projected) values
      (uid, m + 9,  'Financiamento Imobiliário',  'Moradia',     'expense', 3900.00, true, true),
      (uid, m + 9,  'Fatura do Cartão (Nubank)',  'Cartão',      'expense', 3500.00, true, true),
      (uid, m + 9,  'Cannabis Medicinal',         'Saúde',       'expense', 2000.00, true, true),
      (uid, m + 11, 'Mercado',                    'Alimentação', 'expense', 1500.00, true, true),
      (uid, m + 4,  'Elaine (Diarista)',          'Serviços',    'expense', 1000.00, true, true),
      (uid, m + 14, 'Terapia',                    'Saúde',       'expense',  600.00, true, true),
      (uid, m + 9,  'Cota IR (Parcelamento)',     'Impostos',    'expense',  900.00, true, true),
      (uid, m + 19, 'Conta de Luz (Média)',       'Utilidades',  'expense',  250.00, true, true),
      (uid, m + 14, 'Plano TIM',                  'Utilidades',  'expense',   30.99, true, true);
  end loop;

  -- 4) Caixinhas iniciais
  insert into public.fin_boxes (user_id, name, goal_amount, current_amount, color, icon, sort_order) values
    (uid, 'Leão / IR',              12000, 0, '#f5b301', 'landmark', 1),
    (uid, 'Reserva de Emergência',  60000, 0, '#3bd16f', 'shield',   2),
    (uid, 'Viagem',                 15000, 0, '#ff4d6d', 'plane',    3);

  -- 5) Settings
  insert into public.fin_settings (user_id, key, value) values
    (uid, 'monthly_goal', to_jsonb(3500)),
    (uid, 'seeded',       to_jsonb(true)),
    (uid, 'seed_version', to_jsonb(2))
  on conflict (user_id, key) do update set value = excluded.value;

  raise notice 'Cenário financeiro populado para %', uid;
end $$;

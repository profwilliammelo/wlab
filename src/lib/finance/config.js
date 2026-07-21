// Regras de negócio do app financeiro pessoal.
// Cenário projetado a partir de Agosto/2026.

export const FINANCE = {
  // Receitas líquidas mensais recorrentes
  SALARY_BASE: 12698.02,   // Salário base líquido
  GERER: 4548.92,          // GERER — Regime Suplementar líquido
  // GERER = 12 tempos de execução (tabela de 18h, cargo "Estaca Zero").
  // Desconto exclusivo de 27,5% de IRRF; isento de previdência/ISSM.

  // Mês inicial do cenário (o dashboard abre aqui)
  START_YEAR: 2026,
  START_MONTH: 8,          // Agosto

  // Quantos meses projetar a partir do início
  PROJECTION_MONTHS: 12,

  CURRENCY: 'BRL',
  LOCALE: 'pt-BR',
};

// Meta mensal padrão de sobra (saldo livre) — usada nos gráficos.
export const DEFAULT_MONTHLY_GOAL = 3500;

// Versão do cenário-semente. Aumente para que o botão "Regenerar cenário"
// saiba que há uma projeção nova a aplicar.
export const SEED_VERSION = 2;

// Chaves usadas na tabela fin_settings
export const SETTINGS_KEYS = {
  SEEDED: 'seeded',            // marca que o cenário inicial já foi gerado
  SEED_VERSION: 'seed_version',
  MONTHLY_GOAL: 'monthly_goal',
};

// Categorias sugeridas
export const CATEGORIES = {
  income: ['Salário', 'GERER', '13º Salário', 'Férias', 'Extra'],
  expense: [
    'Moradia', 'Alimentação', 'Saúde', 'Serviços', 'Cartão',
    'Impostos', 'Utilidades', 'Transporte', 'Educação', 'Lazer', 'Assinaturas', 'Outros',
  ],
};

// ---------------------------------------------------------------------
//  DADOS PROJETADOS (MOCK) — tudo editável depois no app.
//  Cenário a partir de Ago/2026.
// ---------------------------------------------------------------------

// Receitas fixas de todo mês do cenário
export const MONTHLY_INCOMES = [
  { description: 'Salário base (líquido)', category: 'Salário', amount: FINANCE.SALARY_BASE, day: 5 },
  { description: 'GERER — Regime Suplementar (líquido)', category: 'GERER', amount: FINANCE.GERER, day: 5 },
];

// Receitas pontuais projetadas (mês específico "YYYY-MM")
export const EXTRA_INCOMES = [
  { monthKey: '2026-12', description: '13º Salário — 2ª parcela', category: '13º Salário', amount: 7443.17, day: 20 },
  { monthKey: '2027-01', description: 'Férias — 1/3 constitucional', category: 'Férias', amount: 6331.03, day: 20 },
];

// Despesas fixas mensais
// (Streaming/assinaturas já entram embutidos na fatura do cartão — não duplicar.)
export const FIXED_EXPENSES = [
  { description: 'Financiamento Imobiliário', category: 'Moradia', amount: 3900, day: 10 },
  { description: 'Fatura do Cartão (Nubank)', category: 'Cartão', amount: 3500, day: 10 },
  { description: 'Cannabis Medicinal', category: 'Saúde', amount: 2000, day: 10 },
  { description: 'Mercado', category: 'Alimentação', amount: 1500, day: 12 },
  { description: 'Elaine (Diarista)', category: 'Serviços', amount: 1000, day: 5 },
  { description: 'Terapia', category: 'Saúde', amount: 600, day: 15 },
  { description: 'Cota IR (Parcelamento)', category: 'Impostos', amount: 900, day: 10 },
  { description: 'Conta de Luz (Média)', category: 'Utilidades', amount: 250, day: 20 },
  { description: 'Plano TIM', category: 'Utilidades', amount: 30.99, day: 15 },
];

// Caixinhas iniciais
export const SEED_BOXES = [
  { name: 'Leão / IR', goal_amount: 12000, current_amount: 0, color: '#f5b301', icon: 'landmark', sort_order: 1 },
  { name: 'Reserva de Emergência', goal_amount: 60000, current_amount: 0, color: '#3bd16f', icon: 'shield', sort_order: 2 },
  { name: 'Viagem', goal_amount: 15000, current_amount: 0, color: '#ff4d6d', icon: 'plane', sort_order: 3 },
];

// Meses abreviados PT-BR
export const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

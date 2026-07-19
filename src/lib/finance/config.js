// Regras de negócio do app financeiro pessoal.
// Cenário projetado a partir de Agosto/2026.

export const FINANCE = {
  // Receitas líquidas mensais recorrentes
  SALARY_BASE: 12698.02,   // Salário base líquido
  GERER: 4548.92,          // GERER — Regime Suplementar líquido
  // GERER = 12 tempos de execução (tabela de 18h, cargo "Estaca Zero").
  // Desconto exclusivo de 27,5% de IRRF; isento de previdência/ISSM.

  THIRTEENTH: 9780.00,     // 13º salário — provisionado só em Junho
  THIRTEENTH_MONTH: 6,     // Junho

  // Mês inicial do cenário (o dashboard abre aqui)
  START_YEAR: 2026,
  START_MONTH: 8,          // Agosto

  // Quantos meses projetar a partir do início
  PROJECTION_MONTHS: 12,

  CURRENCY: 'BRL',
  LOCALE: 'pt-BR',
};

// Meta mensal padrão de sobra (saldo livre) — usada nos gráficos.
export const DEFAULT_MONTHLY_GOAL = 5000;

// Chaves usadas na tabela fin_settings
export const SETTINGS_KEYS = {
  SEEDED: 'seeded',            // marca que o cenário inicial já foi gerado
  MONTHLY_GOAL: 'monthly_goal',
};

// Categorias sugeridas
export const CATEGORIES = {
  income: ['Salário', 'GERER', '13º Salário', 'Extra'],
  expense: ['Moradia', 'Alimentação', 'Transporte', 'Educação', 'Saúde', 'Lazer', 'Assinaturas', 'Outros'],
};

// Meses abreviados PT-BR
export const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

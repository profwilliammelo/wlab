import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatBRL } from '../../lib/finance/format';

function Card({ icon: Icon, label, value, hint, tone }) {
  const tones = {
    green: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    red: 'from-rose-500/15 to-rose-500/5 border-rose-500/30 text-rose-400',
    amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/30 text-amber-400',
    sky: 'from-sky-500/15 to-sky-500/5 border-sky-500/30 text-sky-400',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {label}
        </span>
        <Icon size={18} className="opacity-80" />
      </div>
      <p className="mt-3 text-2xl font-bold text-white tabular-nums">{formatBRL(value)}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export default function SummaryCards({ summary, accumulated }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        icon={TrendingUp}
        tone="green"
        label="Receitas"
        value={summary.income}
        hint="Entradas do mês"
      />
      <Card
        icon={TrendingDown}
        tone="red"
        label="Despesas Fixas"
        value={summary.expenseFixed}
        hint={summary.expenseVar ? `+ ${formatBRL(summary.expenseVar)} variáveis` : 'Custos recorrentes'}
      />
      <Card
        icon={Wallet}
        tone="amber"
        label="Saldo Livre"
        value={summary.free}
        hint="Disponível p/ provisionar"
      />
      <Card
        icon={PiggyBank}
        tone="sky"
        label="Saldo Acumulado"
        value={accumulated}
        hint="Somatório até o mês atual"
      />
    </div>
  );
}

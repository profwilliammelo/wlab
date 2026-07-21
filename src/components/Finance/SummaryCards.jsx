import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatBRL } from '../../lib/finance/format';

// Painel de estatística estilo HUD de Mega Drive.
function Stat({ icon: Icon, label, value, hint, color }) {
  return (
    <div className="mega-panel mega-scanlines overflow-hidden">
      {/* faixa de topo colorida */}
      <div className="mega-strip flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: color }}>
        <span className="font-pixel text-[8px] uppercase tracking-wider text-black/80">{label}</span>
        <Icon size={13} className="text-black/80" />
      </div>
      <div className="px-3 py-3">
        <p className="font-arcade text-3xl leading-none text-white mega-glow tabular-nums" style={{ color }}>
          {formatBRL(value)}
        </p>
        {hint && <p className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-500">{hint}</p>}
      </div>
    </div>
  );
}

export default function SummaryCards({ summary, accumulated }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={TrendingUp} color="#3bd16f" label="Receitas" value={summary.income} hint="Entradas do mês" />
      <Stat icon={TrendingDown} color="#ff4d6d" label="Despesas Fixas" value={summary.expenseFixed}
        hint={summary.expenseVar ? `+ ${formatBRL(summary.expenseVar)} variáveis` : 'Custos recorrentes'} />
      <Stat icon={Wallet} color="#f5b301" label="Saldo Livre" value={summary.free} hint="Pronto p/ provisionar" />
      <Stat icon={PiggyBank} color="#49b6ff" label="Saldo Acumulado" value={accumulated} hint="Somatório até aqui" />
    </div>
  );
}

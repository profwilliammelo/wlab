import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Pencil, Check, X } from 'lucide-react';
import { formatBRL } from '../../lib/finance/format';

// Painel de estatística estilo HUD de Mega Drive.
// Se receber onEdit, o valor pode ser DEFINIDO manualmente (sem lançamento).
function Stat({ icon: Icon, label, value, hint, color, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  const start = () => { setVal(String(value ?? '')); setEditing(true); };
  const save = async () => {
    setBusy(true);
    try { await onEdit(Number(val)); setEditing(false); }
    finally { setBusy(false); }
  };

  return (
    <div className="mega-panel mega-scanlines overflow-hidden">
      <div className="mega-strip flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: color }}>
        <span className="font-pixel text-[8px] uppercase tracking-wider text-black/80">{label}</span>
        {onEdit
          ? (
            <button onClick={editing ? () => setEditing(false) : start} className="text-black/70 hover:text-black" title="Definir saldo">
              {editing ? <X size={13} /> : <Pencil size={12} />}
            </button>
          )
          : <Icon size={13} className="text-black/80" />}
      </div>
      <div className="px-3 py-3">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number" autoFocus value={val} onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className="w-full rounded border border-stone-700 bg-black px-2 py-1 font-arcade text-2xl text-white outline-none focus:border-amber-500"
            />
            <button onClick={save} disabled={busy} title="Salvar"
              className="mega-btn grid h-8 w-9 shrink-0 place-items-center rounded bg-emerald-500 text-black disabled:opacity-40">
              <Check size={16} />
            </button>
          </div>
        ) : (
          <p className="font-arcade text-3xl leading-none text-white mega-glow tabular-nums" style={{ color }}>
            {formatBRL(value)}
          </p>
        )}
        {hint && <p className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-500">{hint}</p>}
      </div>
    </div>
  );
}

export default function SummaryCards({ summary, accumulated, onSetAccumulated }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={TrendingUp} color="#3bd16f" label="Receitas" value={summary.income} hint="Entradas do mês" />
      <Stat icon={TrendingDown} color="#ff4d6d" label="Despesas Fixas" value={summary.expenseFixed}
        hint={summary.expenseVar ? `+ ${formatBRL(summary.expenseVar)} variáveis` : 'Custos recorrentes'} />
      <Stat icon={Wallet} color="#f5b301" label="Saldo Livre" value={summary.free} hint="Pronto p/ provisionar" />
      <Stat icon={PiggyBank} color="#49b6ff" label="Saldo Acumulado" value={accumulated}
        hint="Editável · vale deste mês" onEdit={onSetAccumulated} />
    </div>
  );
}

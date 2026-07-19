import React, { useState } from 'react';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, X, Check, Repeat } from 'lucide-react';
import { formatBRL } from '../../lib/finance/format';
import { CATEGORIES } from '../../lib/finance/config';
import { createTransaction, deleteTransaction } from '../../lib/finance/actions';

function NewTxForm({ monthKey, onDone, onCancel }) {
  const [kind, setKind] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [day, setDay] = useState('10');
  const [isFixed, setIsFixed] = useState(false);
  const [busy, setBusy] = useState(false);

  const switchKind = (k) => {
    setKind(k);
    setCategory(CATEGORIES[k][0]);
  };

  const submit = async () => {
    if (!description.trim() || !Number(amount)) return;
    setBusy(true);
    try {
      const d = String(Math.min(28, Math.max(1, Number(day) || 1))).padStart(2, '0');
      await createTransaction({
        occurred_on: `${monthKey}-${d}`,
        description: description.trim(),
        category,
        kind,
        amount: Number(amount),
        is_fixed: isFixed,
        is_projected: true,
      });
      await onDone();
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-dashed border-amber-700/50 bg-stone-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-amber-300">Novo lançamento</p>
        <button onClick={onCancel} className="text-stone-500 hover:text-white"><X size={16} /></button>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button onClick={() => switchKind('income')}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${kind === 'income' ? 'bg-emerald-600/25 text-emerald-300 ring-1 ring-emerald-600/40' : 'bg-stone-800 text-stone-400'}`}>
          <ArrowUpCircle size={15} /> Receita
        </button>
        <button onClick={() => switchKind('expense')}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${kind === 'expense' ? 'bg-rose-600/25 text-rose-300 ring-1 ring-rose-600/40' : 'bg-stone-800 text-stone-400'}`}>
          <ArrowDownCircle size={15} /> Despesa
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição"
          className="sm:col-span-2 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-600" />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-600" />
        <input type="number" min="1" max="28" value={day} onChange={(e) => setDay(e.target.value)} placeholder="Dia"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-600" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="sm:col-span-2 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-600">
          {CATEGORIES[kind].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-stone-400">
        <input type="checkbox" checked={isFixed} onChange={(e) => setIsFixed(e.target.checked)} className="accent-amber-600" />
        Lançamento fixo (recorrente)
      </label>
      <button onClick={submit} disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40">
        <Check size={15} /> Adicionar
      </button>
    </div>
  );
}

export default function TransactionsPanel({ monthKey, transactions, onChange }) {
  const [adding, setAdding] = useState(false);

  const remove = async (id) => {
    if (!confirm('Excluir este lançamento?')) return;
    await deleteTransaction(id);
    await onChange();
  };

  const handleDone = async () => { setAdding(false); await onChange(); };

  const sorted = [...transactions].sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-amber-300">Lançamentos do mês</h3>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-stone-700">
            <Plus size={14} /> Adicionar
          </button>
        )}
      </div>

      {adding && <div className="mb-4"><NewTxForm monthKey={monthKey} onDone={handleDone} onCancel={() => setAdding(false)} /></div>}

      <div className="divide-y divide-stone-800/70">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-2.5">
            {t.kind === 'income'
              ? <ArrowUpCircle size={18} className="shrink-0 text-emerald-400" />
              : <ArrowDownCircle size={18} className="shrink-0 text-rose-400" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-200">
                {t.description}
                {t.is_fixed && <Repeat size={11} className="ml-1.5 inline text-stone-500" title="Fixo" />}
              </p>
              <p className="text-xs text-stone-500">
                {t.category} · dia {String(t.occurred_on).slice(-2)}
              </p>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${t.kind === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {t.kind === 'income' ? '+' : '−'} {formatBRL(t.amount)}
            </span>
            <button onClick={() => remove(t.id)} className="p-1 text-stone-600 transition hover:text-rose-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {!sorted.length && !adding && (
          <p className="py-8 text-center text-sm text-stone-600">Nenhum lançamento neste mês.</p>
        )}
      </div>
    </div>
  );
}

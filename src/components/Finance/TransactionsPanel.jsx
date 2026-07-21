import React, { useState } from 'react';
import {
  Plus, Trash2, ArrowUpCircle, ArrowDownCircle, X, Check, Repeat, Pencil, PiggyBank,
} from 'lucide-react';
import { formatBRL } from '../../lib/finance/format';
import { CATEGORIES } from '../../lib/finance/config';
import { createTransaction, editTransaction, removeTransaction } from '../../lib/finance/actions';

// Formulário reutilizável (novo lançamento e edição).
function TxForm({ monthKey, boxes, initial, submitLabel, onSubmit, onCancel }) {
  const editing = !!initial;
  const [kind, setKind] = useState(initial?.kind || 'expense');
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category || CATEGORIES.expense[0]);
  const [day, setDay] = useState(initial ? String(initial.occurred_on).slice(-2) : '10');
  const [isFixed, setIsFixed] = useState(initial?.is_fixed || false);
  const [boxId, setBoxId] = useState(initial?.box_id || '');
  const [syncBox, setSyncBox] = useState(true);
  const [busy, setBusy] = useState(false);

  const switchKind = (k) => {
    setKind(k);
    setCategory(CATEGORIES[k][0]);
    if (k === 'income') setBoxId(''); // só despesa vincula a caixinha
  };

  // Mostra o toggle de conciliação se há (ou havia) uma caixinha envolvida.
  const boxInvolved = !!boxId || (editing && !!initial.box_id);

  const submit = async () => {
    if (!description.trim() || !Number(amount)) return;
    setBusy(true);
    try {
      const d = String(Math.min(28, Math.max(1, Number(day) || 1))).padStart(2, '0');
      const values = {
        occurred_on: `${monthKey}-${d}`,
        description: description.trim(),
        category,
        kind,
        amount: Number(amount),
        is_fixed: isFixed,
        is_projected: true,
        box_id: kind === 'expense' ? (boxId || null) : null,
      };
      await onSubmit(values, { syncBox });
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-dashed border-amber-700/50 bg-stone-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-amber-300">{editing ? 'Editar lançamento' : 'Novo lançamento'}</p>
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
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-600">
          {CATEGORIES[kind].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Destino / Caixinha — só para despesas */}
        {kind === 'expense' && (
          <select value={boxId} onChange={(e) => setBoxId(e.target.value)}
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-600">
            <option value="">Destino/Caixinha (nenhuma)</option>
            {boxes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-stone-400">
        <input type="checkbox" checked={isFixed} onChange={(e) => setIsFixed(e.target.checked)} className="accent-amber-600" />
        Lançamento fixo (recorrente)
      </label>

      {boxInvolved && (
        <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg bg-amber-950/30 px-2.5 py-2 text-xs text-amber-200/90">
          <input type="checkbox" checked={syncBox} onChange={(e) => setSyncBox(e.target.checked)} className="accent-amber-600" />
          <PiggyBank size={13} />
          {editing
            ? 'Conciliar o saldo da caixinha com esta alteração'
            : 'Somar este valor automaticamente na caixinha'}
        </label>
      )}

      <button onClick={submit} disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40">
        <Check size={15} /> {submitLabel}
      </button>
    </div>
  );
}

export default function TransactionsPanel({ monthKey, transactions, boxes, onChange }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const boxName = (id) => boxes.find((b) => b.id === id)?.name;

  const handleCreate = async (values, opts) => {
    await createTransaction(values, opts);
    setAdding(false);
    await onChange();
  };

  const handleEdit = async (original, values, opts) => {
    await editTransaction(original, values, opts);
    setEditingId(null);
    await onChange();
  };

  const remove = async (t) => {
    const linked = t.kind === 'expense' && t.box_id;
    const msg = linked
      ? `Excluir "${t.description}"? Isso também devolve ${formatBRL(t.amount)} à caixinha "${boxName(t.box_id) || ''}".`
      : 'Excluir este lançamento?';
    if (!confirm(msg)) return;
    await removeTransaction(t, { syncBox: true });
    await onChange();
  };

  const sorted = [...transactions].sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));

  return (
    <div className="mega-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-pixel text-[11px] text-amber-300 mega-glow">LANÇAMENTOS</h3>
        {!adding && (
          <button onClick={() => { setAdding(true); setEditingId(null); }}
            className="mega-btn flex items-center gap-1.5 rounded bg-stone-700 px-3 py-2 text-[9px] text-amber-200">
            <Plus size={12} /> ADICIONAR
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <TxForm monthKey={monthKey} boxes={boxes} submitLabel="Adicionar"
            onSubmit={handleCreate} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="divide-y divide-stone-800/70">
        {sorted.map((t) => (
          editingId === t.id ? (
            <div key={t.id} className="py-3">
              <TxForm monthKey={monthKey} boxes={boxes} initial={t} submitLabel="Salvar"
                onSubmit={(values, opts) => handleEdit(t, values, opts)}
                onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={t.id} className="flex items-center gap-3 py-2.5">
              {t.kind === 'income'
                ? <ArrowUpCircle size={18} className="shrink-0 text-emerald-400" />
                : <ArrowDownCircle size={18} className="shrink-0 text-rose-400" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-200">
                  {t.description}
                  {t.is_fixed && <Repeat size={11} className="ml-1.5 inline text-stone-500" title="Fixo" />}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-stone-500">
                  {t.category} · dia {String(t.occurred_on).slice(-2)}
                  {t.box_id && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-950/40 px-1.5 py-0.5 text-amber-300/90">
                      <PiggyBank size={10} /> {boxName(t.box_id) || 'caixinha'}
                    </span>
                  )}
                </p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${t.kind === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.kind === 'income' ? '+' : '−'} {formatBRL(t.amount)}
              </span>
              <button onClick={() => { setEditingId(t.id); setAdding(false); }}
                className="p-1 text-stone-600 transition hover:text-amber-400" title="Editar">
                <Pencil size={14} />
              </button>
              <button onClick={() => remove(t)} className="p-1 text-stone-600 transition hover:text-rose-400" title="Excluir">
                <Trash2 size={14} />
              </button>
            </div>
          )
        ))}
        {!sorted.length && !adding && (
          <p className="py-8 text-center text-sm text-stone-600">Nenhum lançamento neste mês.</p>
        )}
      </div>
    </div>
  );
}

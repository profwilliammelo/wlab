import React, { useState } from 'react';
import {
  PiggyBank, Plus, Minus, Trash2, Target, Landmark, Shield, Plane, X, Check,
} from 'lucide-react';
import { formatBRL, percent } from '../../lib/finance/format';
import { createBox, deleteBox, allocateToBox } from '../../lib/finance/actions';

const ICONS = { 'piggy-bank': PiggyBank, landmark: Landmark, shield: Shield, plane: Plane, target: Target };
const COLORS = ['#b45309', '#047857', '#be123c', '#7c3aed', '#0369a1', '#c2410c'];

function BoxIcon({ name, ...props }) {
  const Icon = ICONS[name] || PiggyBank;
  return <Icon {...props} />;
}

function BoxCard({ box, onChange }) {
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState('');
  const pct = percent(box.current_amount, box.goal_amount);
  const done = box.goal_amount > 0 && box.current_amount >= box.goal_amount;

  const allocate = async (sign) => {
    const delta = sign * Number(amount);
    if (!delta) return;
    setBusy(true);
    try {
      await allocateToBox(box, delta);
      setAmount('');
      await onChange();
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`Excluir a caixinha "${box.name}"?`)) return;
    setBusy(true);
    try { await deleteBox(box.id); await onChange(); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${box.color}22`, color: box.color }}>
            <BoxIcon name={box.icon} size={18} />
          </span>
          <div>
            <p className="font-semibold text-white leading-tight">{box.name}</p>
            <p className="text-xs text-stone-500">Meta {formatBRL(box.goal_amount)}</p>
          </div>
        </div>
        <button onClick={remove} disabled={busy} className="text-stone-600 hover:text-rose-400 transition p-1" title="Excluir">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-stone-300 tabular-nums">{formatBRL(box.current_amount)}</span>
          <span className={done ? 'text-emerald-400 font-semibold' : 'text-stone-500'}>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-800">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: done ? '#10b981' : box.color }} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="R$"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-1.5 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-600"
        />
        <button onClick={() => allocate(1)} disabled={busy} title="Alocar" className="grid h-8 w-9 place-items-center rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-40">
          <Plus size={16} />
        </button>
        <button onClick={() => allocate(-1)} disabled={busy} title="Retirar" className="grid h-8 w-9 place-items-center rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 disabled:opacity-40">
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
}

function NewBoxForm({ onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createBox({ name: name.trim(), goal_amount: Number(goal) || 0, color, icon: 'piggy-bank' });
      await onCreated();
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-dashed border-amber-700/50 bg-stone-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-amber-300">Nova caixinha</p>
        <button onClick={onCancel} className="text-stone-500 hover:text-white"><X size={16} /></button>
      </div>
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex.: Reserva)"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-600" />
        <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Meta (R$)"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-600" />
        <div className="flex items-center gap-2 pt-1">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }}
              className={`h-6 w-6 rounded-full transition ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-900' : ''}`} />
          ))}
        </div>
      </div>
      <button onClick={submit} disabled={busy || !name.trim()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40">
        <Check size={15} /> Criar caixinha
      </button>
    </div>
  );
}

export default function BoxesPanel({ boxes, onChange }) {
  const [adding, setAdding] = useState(false);
  const totalProvisioned = boxes.reduce((s, b) => s + Number(b.current_amount), 0);

  const handleCreated = async () => { setAdding(false); await onChange(); };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-amber-300">
            <PiggyBank size={18} /> Caixinhas
          </h3>
          <p className="text-xs text-stone-500">Provisionado: {formatBRL(totalProvisioned)}</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-stone-700">
            <Plus size={14} /> Nova
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {boxes.map((box) => <BoxCard key={box.id} box={box} onChange={onChange} />)}
        {adding && <NewBoxForm onCreated={handleCreated} onCancel={() => setAdding(false)} />}
      </div>

      {!boxes.length && !adding && (
        <p className="py-8 text-center text-sm text-stone-600">Nenhuma caixinha ainda. Crie a primeira.</p>
      )}
    </div>
  );
}

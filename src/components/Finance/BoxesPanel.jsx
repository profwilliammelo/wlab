import React, { useState } from 'react';
import {
  PiggyBank, Plus, Minus, Trash2, Target, Landmark, Shield, Plane, X, Check,
} from 'lucide-react';
import { formatBRL, percent } from '../../lib/finance/format';
import { createBox, deleteBox, allocateToBox } from '../../lib/finance/actions';

const ICONS = { 'piggy-bank': PiggyBank, landmark: Landmark, shield: Shield, plane: Plane, target: Target };
const COLORS = ['#f5b301', '#3bd16f', '#ff4d6d', '#7c5cff', '#49b6ff', '#ff8a3d'];
const SEGMENTS = 12;

function BoxIcon({ name, ...props }) {
  const Icon = ICONS[name] || PiggyBank;
  return <Icon {...props} />;
}

// Barra de XP segmentada (estilo energia/vida de jogo 16-bit).
function XPBar({ pct, color, done }) {
  const filled = Math.round((pct / 100) * SEGMENTS);
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <div
          key={i}
          className="h-4 flex-1 border border-black"
          style={{
            backgroundColor: i < filled ? (done ? '#3bd16f' : color) : '#0d0a14',
            boxShadow: i < filled ? 'inset 1px 1px 0 rgba(255,255,255,0.35)' : 'inset 1px 1px 0 rgba(0,0,0,0.6)',
          }}
        />
      ))}
    </div>
  );
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
    <div className="mega-panel mega-scanlines overflow-hidden">
      <div className="mega-strip flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: box.color }}>
        <span className="flex items-center gap-1.5 font-pixel text-[8px] uppercase tracking-wider text-black/80">
          <BoxIcon name={box.icon} size={11} /> {box.name}
        </span>
        <button onClick={remove} disabled={busy} className="text-black/60 hover:text-black" title="Excluir">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-3">
        <div className="mb-1.5 flex items-end justify-between">
          <span className="font-arcade text-2xl leading-none text-white tabular-nums">{formatBRL(box.current_amount)}</span>
          {done
            ? <span className="mega-blink font-pixel text-[9px] text-emerald-400">CLEAR!</span>
            : <span className="font-pixel text-[9px]" style={{ color: box.color }}>{pct.toFixed(0)}%</span>}
        </div>

        <XPBar pct={pct} color={box.color} done={done} />

        <p className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-500">
          Meta <span className="text-stone-300">{formatBRL(box.goal_amount)}</span>
        </p>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="R$"
            className="w-full rounded border border-stone-700 bg-black px-2 py-1.5 font-arcade text-lg text-white placeholder-stone-600 outline-none focus:border-amber-500"
          />
          <button onClick={() => allocate(1)} disabled={busy} title="Alocar"
            className="mega-btn grid h-9 w-10 place-items-center rounded bg-emerald-500 text-black disabled:opacity-40">
            <Plus size={16} />
          </button>
          <button onClick={() => allocate(-1)} disabled={busy} title="Retirar"
            className="mega-btn grid h-9 w-10 place-items-center rounded bg-rose-500 text-black disabled:opacity-40">
            <Minus size={16} />
          </button>
        </div>
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
    <div className="mega-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-pixel text-[9px] text-amber-300">NOVA MISSÃO</p>
        <button onClick={onCancel} className="text-stone-500 hover:text-white"><X size={16} /></button>
      </div>
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex.: Reserva)"
          className="w-full rounded border border-stone-700 bg-black px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500" />
        <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Meta (R$)"
          className="w-full rounded border border-stone-700 bg-black px-3 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500" />
        <div className="flex items-center gap-2 pt-1">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }}
              className={`h-6 w-6 border-2 border-black transition ${color === c ? 'ring-2 ring-white' : ''}`} />
          ))}
        </div>
      </div>
      <button onClick={submit} disabled={busy || !name.trim()}
        className="mega-btn mt-3 flex w-full items-center justify-center gap-2 rounded bg-amber-500 py-2 text-[10px] text-black disabled:opacity-40">
        <Check size={14} /> CRIAR
      </button>
    </div>
  );
}

export default function BoxesPanel({ boxes, onChange }) {
  const [adding, setAdding] = useState(false);
  const totalProvisioned = boxes.reduce((s, b) => s + Number(b.current_amount), 0);

  const handleCreated = async () => { setAdding(false); await onChange(); };

  return (
    <div className="mega-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-pixel text-[11px] text-amber-300 mega-glow">
            <PiggyBank size={15} /> CAIXINHAS
          </h3>
          <p className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            Provisionado <span className="font-arcade text-sm text-emerald-400">{formatBRL(totalProvisioned)}</span>
          </p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="mega-btn flex items-center gap-1.5 rounded bg-stone-700 px-3 py-2 text-[9px] text-amber-200">
            <Plus size={12} /> NOVA
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {boxes.map((box) => <BoxCard key={box.id} box={box} onChange={onChange} />)}
        {adding && <NewBoxForm onCreated={handleCreated} onCancel={() => setAdding(false)} />}
      </div>

      {!boxes.length && !adding && (
        <p className="py-8 text-center text-sm text-stone-600">Nenhuma missão ativa. Crie a primeira.</p>
      )}
    </div>
  );
}

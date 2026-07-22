import React from 'react';
import { History, Undo2, PiggyBank, Wallet } from 'lucide-react';
import { formatBRL, monthKeyLabel } from '../../lib/finance/format';
import { deleteBoxMovement } from '../../lib/finance/actions';

// Histórico de AJUSTES MANUAIS (aportes/retiradas de caixinha e ajustes do
// Saldo Acumulado). Movimentos ligados a despesas (transaction_id) não
// entram aqui — eles se gerenciam pela própria despesa.
export default function HistoryPanel({ movements = [], boxes = [], onChange }) {
  const manual = movements
    .filter((m) => !m.transaction_id)
    .sort((a, b) => String(b.occurred_on).localeCompare(String(a.occurred_on))
      || String(b.created_at || '').localeCompare(String(a.created_at || '')));

  const boxName = (id) => boxes.find((b) => b.id === id)?.name;

  const estornar = async (m) => {
    const alvo = m.box_id ? `caixinha "${boxName(m.box_id) || ''}"` : 'Saldo Acumulado';
    if (!confirm(`Estornar este ajuste de ${formatBRL(m.amount)} no ${alvo}?`)) return;
    await deleteBoxMovement(m.id);
    await onChange();
  };

  return (
    <div className="mega-panel p-5">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 font-pixel text-[11px] text-amber-300 mega-glow">
          <History size={15} /> HISTÓRICO DE AJUSTES
        </h3>
        <p className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-500">
          Aportes manuais e ajustes de saldo · dá pra estornar
        </p>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-stone-800/70 pr-1">
        {manual.map((m) => {
          const positive = Number(m.amount) >= 0;
          const global = !m.box_id;
          return (
            <div key={m.id} className="flex items-center gap-3 py-2.5">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded ${global ? 'bg-sky-500/15 text-sky-300' : 'bg-amber-500/15 text-amber-300'}`}>
                {global ? <Wallet size={15} /> : <PiggyBank size={15} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-200">
                  {global ? 'Saldo Acumulado' : (boxName(m.box_id) || 'Caixinha')}
                </p>
                <p className="text-xs text-stone-500">
                  {monthKeyLabel(String(m.occurred_on).slice(0, 7))} · {m.note || 'Ajuste'}
                </p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {positive ? '+' : '−'} {formatBRL(Math.abs(Number(m.amount)))}
              </span>
              <button onClick={() => estornar(m)} className="p-1 text-stone-600 transition hover:text-rose-400" title="Estornar">
                <Undo2 size={15} />
              </button>
            </div>
          );
        })}
        {!manual.length && (
          <p className="py-8 text-center text-sm text-stone-600">Nenhum ajuste manual ainda.</p>
        )}
      </div>
    </div>
  );
}

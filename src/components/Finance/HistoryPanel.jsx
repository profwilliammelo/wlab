import React from 'react';
import { History, Undo2, PiggyBank, Wallet, Link2 } from 'lucide-react';
import { formatBRL, monthKeyLabel } from '../../lib/finance/format';
import { deleteBoxMovement } from '../../lib/finance/actions';

// Histórico completo do extrato das caixinhas + ajustes do Saldo Acumulado.
//  • Manuais (aportes/retiradas, ajustes de saldo): podem ser estornados.
//  • Automáticos (vindos de despesa vinculada): marcados "AUTO", sem
//    estorno — gerenciados pela própria despesa.
export default function HistoryPanel({ movements = [], boxes = [], onChange }) {
  const rows = [...movements].sort((a, b) =>
    String(b.occurred_on).localeCompare(String(a.occurred_on))
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
          Aportes, ajustes de saldo e vínculos de despesa · manuais dá pra estornar
        </p>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-stone-800/70 pr-1">
        {rows.map((m) => {
          const positive = Number(m.amount) >= 0;
          const global = !m.box_id;
          const auto = !!m.transaction_id;
          return (
            <div key={m.id} className="flex items-center gap-3 py-2.5">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded ${global ? 'bg-sky-500/15 text-sky-300' : 'bg-amber-500/15 text-amber-300'}`}>
                {global ? <Wallet size={15} /> : <PiggyBank size={15} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-stone-200">
                  {global ? 'Saldo Acumulado' : (boxName(m.box_id) || 'Caixinha')}
                  {auto && (
                    <span className="inline-flex items-center gap-1 rounded bg-stone-700/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-stone-300">
                      <Link2 size={9} /> auto
                    </span>
                  )}
                </p>
                <p className="text-xs text-stone-500">
                  {monthKeyLabel(String(m.occurred_on).slice(0, 7))} · {m.note || 'Ajuste'}
                </p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {positive ? '+' : '−'} {formatBRL(Math.abs(Number(m.amount)))}
              </span>
              {auto ? (
                <span className="w-[23px] shrink-0" title="Vinculado a uma despesa — edite a despesa">
                  <Link2 size={14} className="mx-auto text-stone-700" />
                </span>
              ) : (
                <button onClick={() => estornar(m)} className="p-1 text-stone-600 transition hover:text-rose-400" title="Estornar">
                  <Undo2 size={15} />
                </button>
              )}
            </div>
          );
        })}
        {!rows.length && (
          <p className="py-8 text-center text-sm text-stone-600">Nenhum movimento ainda.</p>
        )}
      </div>
    </div>
  );
}

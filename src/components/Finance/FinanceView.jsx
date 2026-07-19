import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { loadFinanceData } from '../../lib/finance/actions';
import { currentMonthKey, monthKeyLong } from '../../lib/finance/format';
import { monthSummary, cashFlowSeries, accumulatedBalance, allMonthKeys } from '../../lib/finance/derive';
import SummaryCards from './SummaryCards';
import CashFlowChart from './CashFlowChart';
import BoxesPanel from './BoxesPanel';
import TransactionsPanel from './TransactionsPanel';

// Painel de finanças embutido no Modo Exu (sem topbar própria — o Exu já provê).
export default function FinanceView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(currentMonthKey());

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await loadFinanceData();
      setData(d);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    const d = await loadFinanceData();
    setData(d);
  }, []);

  const months = useMemo(() => (data ? allMonthKeys(data.transactions) : []), [data]);
  const summary = useMemo(
    () => (data ? monthSummary(data.transactions, activeMonth) : null),
    [data, activeMonth],
  );
  const series = useMemo(
    () => (data ? cashFlowSeries(data.transactions, data.monthlyGoal) : []),
    [data],
  );
  const accumulated = useMemo(
    () => (data ? accumulatedBalance(data.transactions, activeMonth) : 0),
    [data, activeMonth],
  );

  const stepMonth = (dir) => {
    const idx = months.indexOf(activeMonth);
    const next = months[idx + dir];
    if (next) setActiveMonth(next);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-800/50 bg-rose-950/30 p-6">
        <div className="mb-2 flex items-center gap-2 text-rose-300">
          <AlertTriangle size={18} />
          <h2 className="font-semibold">Não foi possível carregar as finanças</h2>
        </div>
        <p className="text-sm text-rose-200/80">{error}</p>
        <p className="mt-3 text-xs text-stone-400">
          Verifique se as tabelas <code className="text-amber-400">fin_transactions</code>,{' '}
          <code className="text-amber-400">fin_boxes</code> e{' '}
          <code className="text-amber-400">fin_settings</code> já foram criadas no Supabase
          (rode <code className="text-amber-400">finance_schema.sql</code>).
        </p>
        <button onClick={() => { setLoading(true); load(); }}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500">
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month switcher */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">Mês em foco</p>
          <h2 className="font-serif text-2xl font-bold capitalize text-white">{monthKeyLong(activeMonth)}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => stepMonth(-1)} disabled={months.indexOf(activeMonth) <= 0}
            className="rounded-lg border border-stone-800 p-2 text-stone-400 transition hover:bg-stone-800 hover:text-white disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => stepMonth(1)} disabled={months.indexOf(activeMonth) >= months.length - 1}
            className="rounded-lg border border-stone-800 p-2 text-stone-400 transition hover:bg-stone-800 hover:text-white disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <SummaryCards summary={summary} accumulated={accumulated} />
      <CashFlowChart data={series} activeMonthKey={activeMonth} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BoxesPanel boxes={data.boxes} onChange={refresh} />
        <TransactionsPanel monthKey={activeMonth} transactions={summary.transactions} onChange={refresh} />
      </div>
    </div>
  );
}

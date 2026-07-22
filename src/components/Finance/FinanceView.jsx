import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Loader2, RotateCcw, Gamepad2 } from 'lucide-react';
import { loadFinanceData, regenerateScenario, addGlobalAdjustment } from '../../lib/finance/actions';
import { currentMonthKey, monthKeyLong, monthKeyLabel, formatBRL } from '../../lib/finance/format';
import { monthSummary, cashFlowSeries, accumulatedBalance, allMonthKeys } from '../../lib/finance/derive';
import SummaryCards from './SummaryCards';
import CashFlowChart from './CashFlowChart';
import BoxesPanel from './BoxesPanel';
import TransactionsPanel from './TransactionsPanel';
import HistoryPanel from './HistoryPanel';

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
    () => (data ? accumulatedBalance(data.transactions, data.movements, activeMonth) : 0),
    [data, activeMonth],
  );

  const handleSetAccumulated = async (target) => {
    const delta = Number(target) - accumulated;
    if (!delta) return;
    await addGlobalAdjustment(activeMonth, delta);
    await refresh();
  };

  const stepMonth = (dir) => {
    const idx = months.indexOf(activeMonth);
    const next = months[idx + dir];
    if (next) setActiveMonth(next);
  };

  const [regenerating, setRegenerating] = useState(false);
  const handleRegenerate = async () => {
    if (!confirm(
      'REGENERAR CENÁRIO?\n\nIsto apaga TODOS os lançamentos e caixinhas atuais e ' +
      'recria a projeção fixa (salário, GERER, 13º, férias e despesas fixas) a partir ' +
      'de Ago/2026. Edições manuais serão perdidas. Continuar?'
    )) return;
    setRegenerating(true);
    try {
      await regenerateScenario();
      await refresh();
    } catch (e) {
      alert('Falha ao regenerar: ' + (e.message || e));
    } finally {
      setRegenerating(false);
    }
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

  const idx = months.indexOf(activeMonth);

  return (
    <div className="space-y-6">
      {/* HUD — barra de status estilo Mega Drive */}
      <div className="mega-panel mega-scanlines overflow-hidden">
        <div className="mega-strip flex flex-wrap items-center justify-between gap-2 bg-amber-500 px-4 py-2">
          <span className="flex items-center gap-2 font-pixel text-[10px] text-black">
            <Gamepad2 size={14} /> STAGE SELECT
          </span>
          <button onClick={handleRegenerate} disabled={regenerating}
            className="mega-btn flex items-center gap-1.5 rounded bg-black px-3 py-1.5 text-[8px] text-amber-300 disabled:opacity-50">
            <RotateCcw size={11} className={regenerating ? 'animate-spin' : ''} /> REGENERAR
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          {/* Level selector */}
          <div className="flex items-center gap-3">
            <button onClick={() => stepMonth(-1)} disabled={idx <= 0}
              className="mega-btn grid h-10 w-10 place-items-center rounded bg-stone-700 text-amber-200 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-[8.5rem]">
              <p className="font-pixel text-[8px] uppercase tracking-wider text-stone-500">LEVEL {idx + 1}/{months.length}</p>
              <h2 className="mt-1 font-pixel text-[13px] uppercase text-white mega-glow">{monthKeyLabel(activeMonth)}</h2>
              <p className="mt-1 text-[10px] capitalize text-stone-500">{monthKeyLong(activeMonth)}</p>
            </div>
            <button onClick={() => stepMonth(1)} disabled={idx >= months.length - 1}
              className="mega-btn grid h-10 w-10 place-items-center rounded bg-stone-700 text-amber-200 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Score / saldo do mês */}
          <div className="text-right">
            <p className="font-pixel text-[8px] uppercase tracking-wider text-stone-500">SALDO LIVRE · SCORE</p>
            <p className={`font-arcade text-4xl leading-none mega-glow ${summary.free >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatBRL(summary.free)}
            </p>
          </div>
        </div>
      </div>

      <SummaryCards summary={summary} accumulated={accumulated} onSetAccumulated={handleSetAccumulated} />
      <CashFlowChart data={series} activeMonthKey={activeMonth} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BoxesPanel boxes={data.boxes} movements={data.movements} monthKey={activeMonth} onChange={refresh} />
        <TransactionsPanel monthKey={activeMonth} transactions={summary.transactions} boxes={data.boxes} onChange={refresh} />
      </div>

      <HistoryPanel movements={data.movements} boxes={data.boxes} onChange={refresh} />
    </div>
  );
}

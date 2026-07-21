import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { formatBRL, monthKeyLabel } from '../../lib/finance/format';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-stone-700 bg-stone-900/95 p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-stone-200">{monthKeyLabel(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center justify-between gap-4" style={{ color: p.color }}>
          <span className="capitalize">{p.name}</span>
          <span className="font-medium tabular-nums">{formatBRL(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function CashFlowChart({ data, activeMonthKey }) {
  return (
    <div className="mega-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-pixel text-[11px] text-amber-300 mega-glow">FLUXO DE CAIXA</h3>
          <p className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-500">Receitas x Despesas x Meta</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
            <XAxis
              dataKey="monthKey"
              tickFormatter={monthKeyLabel}
              tick={{ fill: '#a8a29e', fontSize: 11 }}
              axisLine={{ stroke: '#44403c' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#a8a29e', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(v) => <span className="capitalize text-stone-400">{v}</span>}
            />
            <Bar dataKey="receitas" name="Receitas" fill="#3bd16f" radius={[2, 2, 0, 0]} maxBarSize={24} stroke="#000" strokeWidth={1}>
              {data.map((d) => (
                <Cell key={d.monthKey} fillOpacity={d.monthKey === activeMonthKey ? 1 : 0.5} />
              ))}
            </Bar>
            <Bar dataKey="despesas" name="Despesas" fill="#ff4d6d" radius={[2, 2, 0, 0]} maxBarSize={24} stroke="#000" strokeWidth={1}>
              {data.map((d) => (
                <Cell key={d.monthKey} fillOpacity={d.monthKey === activeMonthKey ? 1 : 0.5} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="saldo" name="Saldo Livre" stroke="#f5b301" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="meta" name="Meta" stroke="#49b6ff" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { GlassCard } from '../index';
import { TrendingUp, Sparkles, Layers, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isHistorical = data.historical_actual !== null && data.historical_actual !== undefined;
    const isForecast = data.predicted_demand !== null && data.predicted_demand !== undefined;

    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="font-bold text-slate-900">{label}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              isHistorical ? 'bg-slate-100 text-slate-700' : 'bg-sky-100 text-sky-800'
            }`}
          >
            {isHistorical ? 'Historical Observed' : 'AI Predicted'}
          </span>
        </div>

        {isHistorical && (
          <div className="flex justify-between items-center text-slate-600">
            <span>Observed Flow:</span>
            <strong className="font-mono text-slate-900">{data.historical_actual} m³/h</strong>
          </div>
        )}

        {isForecast && (
          <>
            <div className="flex justify-between items-center text-sky-700">
              <span className="font-semibold">Predicted Demand:</span>
              <strong className="font-mono font-bold text-sky-900">{data.predicted_demand} m³/h</strong>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>95% CI Range:</span>
              <span className="font-mono">
                {data.confidence_lower} – {data.confidence_upper} m³/h
              </span>
            </div>

            <div className="flex justify-between items-center text-cyan-600">
              <span>Planned Supply:</span>
              <span className="font-mono font-semibold">{data.planned_supply} m³/h</span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-xs">
              <span>Supply Gap:</span>
              <strong
                className={`font-mono ${
                  data.supply_gap < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'
                }`}
              >
                {data.supply_gap > 0 ? '+' : ''}{data.supply_gap} m³/h
              </strong>
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
};

export default function DemandForecastChart({
  forecastData,
  horizon,
  zoneName,
}) {
  const recentActuals = forecastData?.recent_actuals || [];
  const forecastPoints = forecastData?.forecast_trajectory || [];

  // Combine historical recent observations and future forecast points
  const combinedData = [...recentActuals, ...forecastPoints];

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-sky-100 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
              Continuous Time-Series Trajectory
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              {horizon.toUpperCase()} Projection
            </span>
          </div>
          <h3 className="font-bold text-base text-slate-900">
            Historical Actuals vs AI Predicted Demand ({zoneName})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-slate-400 rounded-full" />
            <span>Observed Past</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full" />
            <span className="font-semibold text-sky-800">Predicted Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 bg-sky-200/60 rounded" />
            <span>95% Conf. Interval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-500 border-dashed border-t border-emerald-500" />
            <span>Planned Supply</span>
          </div>
        </div>
      </div>

      <div className="h-[380px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              {/* Soft gradient fill for prediction interval cloud */}
              <linearGradient id="confidenceIntervalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" opacity={0.7} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit=" m³"
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 95% Confidence Interval Upper Bound Area */}
            <Area
              type="monotone"
              dataKey="confidence_upper"
              stroke="transparent"
              fill="url(#confidenceIntervalGrad)"
              name="95% Upper CI"
            />

            {/* Planned Supply Allocation Line */}
            <Line
              type="monotone"
              dataKey="planned_supply"
              stroke="#10b981"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
              name="Planned Supply"
            />

            {/* Historical Actual Demand Line */}
            <Line
              type="monotone"
              dataKey="historical_actual"
              stroke="#64748b"
              strokeWidth={2.2}
              dot={{ r: 2.5, fill: '#64748b' }}
              activeDot={{ r: 5 }}
              name="Observed Actual"
            />

            {/* Predicted Water Demand Line */}
            <Line
              type="monotone"
              dataKey="predicted_demand"
              stroke="#0284c7"
              strokeWidth={3}
              dot={{ r: 3, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#0369a1' }}
              name="AI Prediction"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 pt-3 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>
            {forecastData?.summary?.high_demand_periods ||
              'Model automatically forecasts diurnal peak schedules with hourly autoregressive updates.'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          Autoregressive XGBoost (160 estimators)
        </span>
      </div>
    </GlassCard>
  );
}

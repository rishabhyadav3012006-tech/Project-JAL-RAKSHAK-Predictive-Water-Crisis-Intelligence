import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard, StatusBadge, PrimaryButton, SecondaryButton } from '../index';
import { Table, Droplets, Gauge, AlertCircle, ArrowUpDown, Search } from 'lucide-react';

/**
 * ZoneAvailabilityTable
 * Comprehensive zone-wise water availability, pressure, and risk telemetry table.
 */
export default function ZoneAvailabilityTable() {
  const { zones } = useTelemetry();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('inflow');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredZones = zones
    .filter(
      (z) =>
        z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        z.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-sky-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Table className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Zone-Wise Water Availability & Grid Status
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time hydrostatic telemetry, distribution flow, and leak risk per municipal sector
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter zones or type..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Sector & Type</th>
              <th
                onClick={() => handleSort('inflow')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  Inflow (MLD)
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('demand')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  Demand (MLD)
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('pressure')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  Pressure (Bar)
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('reservoirLevel')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  Storage Level
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Loss (NRW)</th>
              <th className="py-3 px-3">Leak Risk</th>
              <th className="py-3 px-3">Water Quality</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredZones.map((zone) => {
              const isLowPressure = zone.pressure < zone.pressureMin;

              return (
                <tr
                  key={zone.id}
                  className="hover:bg-sky-50/40 transition-colors"
                >
                  {/* Zone Name & Type */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900 block">{zone.name}</span>
                    <span className="text-[11px] text-slate-400">{zone.type}</span>
                  </td>

                  {/* Inflow */}
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                    {zone.inflow} MLD
                  </td>

                  {/* Demand */}
                  <td className="py-3.5 px-3 font-mono text-slate-600">
                    {zone.demand} MLD
                  </td>

                  {/* Pressure */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold ${
                        isLowPressure ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      <Gauge className={`w-3.5 h-3.5 ${isLowPressure ? 'text-amber-500' : 'text-sky-500'}`} />
                      {zone.pressure} Bar
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Target: {zone.pressureMin}-{zone.pressureMax}
                    </span>
                  </td>

                  {/* Storage */}
                  <td className="py-3.5 px-3">
                    <div className="w-24">
                      <div className="flex justify-between text-[11px] font-mono text-slate-700 mb-1">
                        <span>{zone.reservoirLevel}%</span>
                        <span className="text-slate-400">{zone.reservoirCurrentML} ML</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            zone.reservoirLevel < 70
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          }`}
                          style={{ width: `${zone.reservoirLevel}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Loss */}
                  <td className="py-3.5 px-3 font-mono">
                    <span
                      className={`font-semibold ${
                        zone.waterLossPercent > 15
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {zone.waterLossPercent}%
                    </span>
                  </td>

                  {/* Leak Risk */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        zone.leakRisk === 'High' || zone.leakRisk === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : zone.leakRisk === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {zone.leakRisk}
                    </span>
                  </td>

                  {/* Water Quality */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-semibold text-slate-800">
                      {zone.qualityIndex}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      pH: {zone.phLevel}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <StatusBadge
                      status={zone.status}
                      label={zone.status.toUpperCase()}
                      size="sm"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

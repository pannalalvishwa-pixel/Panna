import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronRight,
  Train,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutList,
} from 'lucide-react';
import { Spell, EmployeeProfile, TrainDutyEntry } from '../types/railway';
import {
  get14DatesForSpell,
  formatDateDisplay,
  formatDateShort,
  getWeekdayName,
} from '../utils/spellCalculations';
import {
  formatMinutesToHHMM,
  formatSpellTotalHHMM,
  formatDurationHuman,
} from '../utils/timeCalculations';
import { exportSpellToExcel } from '../utils/excelExport';

interface SpellDetailViewProps {
  spell: Spell;
  employee: EmployeeProfile;
  dutyEntries: Record<string, TrainDutyEntry[]>;
  onBackToDashboard: () => void;
  onOpenDateAdjustment: () => void;
  onAddEntry: (date: string) => void;
  onEditEntry: (entry: TrainDutyEntry) => void;
  onDeleteEntry: (date: string, entryId: string) => void;
  onOpenPdfPreview: () => void;
}

export const SpellDetailView: React.FC<SpellDetailViewProps> = ({
  spell,
  employee,
  dutyEntries,
  onBackToDashboard,
  onOpenDateAdjustment,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onOpenPdfPreview,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterActiveDaysOnly, setFilterActiveDaysOnly] = useState(false);

  const dates = get14DatesForSpell(spell);

  // SECTION 8: Spell-Wise Total Calculation
  // 1. Calculate total duty hours independently for every 14-day Spell
  // 2. Starts from zero
  // 3. No carry forward from previous spells
  // 4. Cumulative HH:MM (supports > 24h e.g. 125:30)
  let totalSpellMinutes = 0;
  let totalTripsCount = 0;

  dates.forEach((dateStr) => {
    const entries = dutyEntries[dateStr] || [];
    entries.forEach((e) => {
      totalSpellMinutes += e.dutyMinutes;
      totalTripsCount++;
    });
  });

  const handleExportExcel = () => {
    exportSpellToExcel(spell, employee, dutyEntries);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation & Spell Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#0B3C68] text-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Spells
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDateAdjustment}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-amber-200 hover:text-amber-100 border border-amber-300/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
                <span>Adjust Dates</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                title="Export as Excel .xlsx"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excel (.xlsx)</span>
              </button>

              <button
                onClick={onOpenPdfPreview}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                title="Print or View PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Statement</span>
              </button>
            </div>
          </div>

          {/* Spell Title & Period */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="bg-amber-400 text-blue-950 font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {spell.spellCode}
                </span>
                <span className="text-xs text-blue-200">
                  Total 14 Calendar Days (Consecutive)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                {formatDateDisplay(spell.startDate)} — {formatDateDisplay(spell.endDate)}
              </h2>
            </div>

            {/* Prominent Live Spell Total */}
            <div className="bg-[#072c4e] border border-blue-400/30 rounded-xl p-3 sm:px-5 sm:py-3 shrink-0 text-left sm:text-right">
              <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
                Total Spell Duty Hours
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-wider">
                {formatSpellTotalHHMM(totalSpellMinutes)}
              </span>
              <span className="text-xs text-blue-200 block mt-0.5 font-medium">
                {formatDurationHuman(totalSpellMinutes)} · {totalTripsCount} Trips
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher & Filter Toolbar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Layout:</span>
            <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#0B3C68] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Mobile Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-[#0B3C68] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Full Table
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={filterActiveDaysOnly}
                onChange={(e) => setFilterActiveDaysOnly(e.target.checked)}
                className="w-4 h-4 text-[#0B3C68] rounded border-slate-300 focus:ring-[#0B3C68]"
              />
              <span>Show Duty Days Only ({dates.filter((d) => (dutyEntries[d] || []).length > 0).length}/14)</span>
            </label>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: MOBILE TOUCH CARDS (Designed for Android phones & touch) */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {dates.map((dateStr, index) => {
            const dayNumber = index + 1;
            const entries = dutyEntries[dateStr] || [];
            const dayMinutes = entries.reduce((acc, curr) => acc + curr.dutyMinutes, 0);
            const isDutyDay = entries.length > 0;

            if (filterActiveDaysOnly && !isDutyDay) {
              return null;
            }

            return (
              <div
                key={dateStr}
                className={`bg-white rounded-xl shadow-xs border transition-all overflow-hidden ${
                  isDutyDay ? 'border-blue-200' : 'border-slate-200/80 bg-slate-50/40'
                }`}
              >
                {/* Day Header Row */}
                <div className="p-3.5 sm:px-5 flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isDutyDay
                          ? 'bg-[#0B3C68] text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      D{dayNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatDateDisplay(dateStr)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {getWeekdayName(dateStr)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {isDutyDay
                          ? `${entries.length} train ${entries.length === 1 ? 'duty' : 'duties'} logged`
                          : 'Rest / Periodic Rest (PR)'}
                      </span>
                    </div>
                  </div>

                  {/* Daily Total Display */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Daily Total
                      </span>
                      <span
                        className={`font-mono font-bold text-base ${
                          dayMinutes > 0 ? 'text-[#0B3C68]' : 'text-slate-400'
                        }`}
                      >
                        {formatMinutesToHHMM(dayMinutes)}
                      </span>
                    </div>

                    <button
                      onClick={() => onAddEntry(dateStr)}
                      className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-[#0B3C68] hover:text-white bg-blue-50 hover:bg-[#0B3C68] border border-blue-200 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                      title="Add train duty for this day"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Duty</span>
                    </button>
                  </div>
                </div>

                {/* Day Entries List */}
                <div className="p-3.5 sm:px-5 space-y-2.5">
                  {entries.length === 0 ? (
                    <div className="py-2 text-center text-xs text-slate-400 italic flex items-center justify-center gap-1.5">
                      <span>No train duties recorded for this date.</span>
                      <button
                        onClick={() => onAddEntry(dateStr)}
                        className="text-[#0B3C68] font-semibold underline not-italic ml-1"
                      >
                        + Log Train
                      </button>
                    </div>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-[180px]">
                          <Train className="w-4 h-4 text-[#0B3C68] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {entry.trainNumber}
                            </span>
                            {entry.routeOrSection && (
                              <span className="text-xs text-slate-600 block">
                                {entry.routeOrSection}
                              </span>
                            )}
                            {entry.remarks && (
                              <span className="text-[11px] text-slate-500 italic block mt-0.5">
                                Note: {entry.remarks}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Times & Duty Duration */}
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 uppercase block font-sans">
                              Start (24h)
                            </span>
                            <span className="font-bold text-slate-800">{entry.startTime}</span>
                          </div>
                          <span className="text-slate-300 font-sans">→</span>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 uppercase block font-sans">
                              End (24h)
                            </span>
                            <span className="font-bold text-slate-800">{entry.endTime}</span>
                          </div>
                          <div className="text-center bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] text-blue-800 uppercase block font-sans font-semibold">
                              Duty Hours
                            </span>
                            <span className="font-bold text-sm text-[#0B3C68]">
                              {entry.dutyHoursFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Edit & Delete Controls */}
                        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                          <button
                            onClick={() => onEditEntry(entry)}
                            className="p-1.5 text-slate-500 hover:text-[#0B3C68] hover:bg-white rounded-lg transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(dateStr, entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: CLASSIC 14-DAY SPELL DUTY ENTRY TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B3C68] text-white uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3 text-center w-12">Day</th>
                  <th className="py-3 px-4">Date & Weekday</th>
                  <th className="py-3 px-4">Train Number / Duty</th>
                  <th className="py-3 px-3 text-center">Starting Time (24h)</th>
                  <th className="py-3 px-3 text-center">Ending Time (24h)</th>
                  <th className="py-3 px-3 text-center">Duty Hours (HH:MM)</th>
                  <th className="py-3 px-4 text-right">Daily Total</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dates.map((dateStr, idx) => {
                  const dayNum = idx + 1;
                  const entries = dutyEntries[dateStr] || [];
                  const dayTotalMins = entries.reduce((acc, curr) => acc + curr.dutyMinutes, 0);

                  if (entries.length === 0) {
                    return (
                      <tr key={dateStr} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                          {dayNum}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {formatDateDisplay(dateStr)}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-1.5">
                            ({getWeekdayName(dateStr)})
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 italic" colSpan={3}>
                          Rest / No Duty
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">00:00</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-400">00:00</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onAddEntry(dateStr)}
                            className="p-1 px-2 text-[11px] font-semibold text-[#0B3C68] hover:bg-blue-50 rounded border border-blue-200"
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return entries.map((entry, entryIdx) => (
                    <tr
                      key={entry.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                    >
                      {entryIdx === 0 ? (
                        <>
                          <td
                            rowSpan={entries.length}
                            className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-200 align-top"
                          >
                            {dayNum}
                          </td>
                          <td
                            rowSpan={entries.length}
                            className="py-2.5 px-4 whitespace-nowrap border-r border-slate-200 align-top"
                          >
                            <span className="font-bold text-slate-900">
                              {formatDateDisplay(dateStr)}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {getWeekdayName(dateStr)}
                            </span>
                          </td>
                        </>
                      ) : null}

                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {entry.trainNumber}
                        {entry.routeOrSection && (
                          <span className="text-[11px] text-slate-500 block font-normal">
                            {entry.routeOrSection}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                        {entry.startTime}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                        {entry.endTime}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">
                        {entry.dutyHoursFormatted}
                      </td>

                      {entryIdx === 0 ? (
                        <td
                          rowSpan={entries.length}
                          className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 bg-blue-50/40 border-l border-slate-200 align-middle"
                        >
                          {formatMinutesToHHMM(dayTotalMins)}
                        </td>
                      ) : null}

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditEntry(entry)}
                            className="p-1 text-slate-500 hover:text-[#0B3C68]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(dateStr, entry.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {entryIdx === entries.length - 1 && (
                            <button
                              onClick={() => onAddEntry(dateStr)}
                              className="p-1 text-[#0B3C68] hover:bg-blue-100 rounded"
                              title="Add another train"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 9: SPELL SUMMARY CARD (Always prominent at the bottom of every Spell) */}
      <div className="bg-[#0B3C68] text-white rounded-2xl shadow-lg p-5 sm:p-6 border border-blue-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Spell Summary (Section 9)
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-blue-100">
              <span className="font-bold text-white text-base">
                {spell.spellCode}
              </span>
              <span>·</span>
              <span>
                Start: <strong className="text-white">{formatDateDisplay(spell.startDate)}</strong>
              </span>
              <span>·</span>
              <span>
                End: <strong className="text-white">{formatDateDisplay(spell.endDate)}</strong>
              </span>
              <span>·</span>
              <span>Total Days: <strong className="text-white">14 Days</strong></span>
              <span>·</span>
              <span>Total Train Entries: <strong className="text-white">{totalTripsCount}</strong></span>
            </div>
          </div>

          {/* LARGE PROMINENT SPELL TOTAL DUTY HOURS */}
          <div className="bg-[#072c4e] border-2 border-amber-400/40 rounded-xl px-6 py-4 flex items-center justify-between lg:justify-end gap-6 shrink-0">
            <div>
              <span className="text-xs text-amber-200 uppercase font-bold tracking-wider block">
                Total Duty Hours
              </span>
              <span className="text-[11px] text-blue-200">
                (Cumulative HH:MM)
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-wider">
                {formatSpellTotalHHMM(totalSpellMinutes)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

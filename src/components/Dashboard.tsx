import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Train,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  CalendarCheck,
  CalendarRange,
  FileSpreadsheet,
  FileText,
  Search,
} from 'lucide-react';
import { Spell, EmployeeProfile, TrainDutyEntry, ScheduleConfig } from '../types/railway';
import { formatDateDisplay, get14DatesForSpell } from '../utils/spellCalculations';
import { formatSpellTotalHHMM, formatDurationHuman } from '../utils/timeCalculations';

interface DashboardProps {
  spells: Spell[];
  selectedYear: number;
  scheduleConfig: ScheduleConfig;
  employee: EmployeeProfile;
  dutyEntries: Record<string, TrainDutyEntry[]>;
  onSelectYear: (year: number) => void;
  onSelectSpell: (spell: Spell) => void;
  onEditSpellDates: (spell: Spell) => void;
  onChangeScheduleStartDate: (newStartDate: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  spells,
  selectedYear,
  scheduleConfig,
  employee,
  dutyEntries,
  onSelectYear,
  onSelectSpell,
  onEditSpellDates,
  onChangeScheduleStartDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-duty' | 'active'>('all');
  const [isEditingScheduleStart, setIsEditingScheduleStart] = useState(false);
  const [newScheduleStart, setNewScheduleStart] = useState(scheduleConfig.scheduleStartDate);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute stats for each spell
  const spellStats = spells.map((spell) => {
    const dates = get14DatesForSpell(spell);
    let totalMinutes = 0;
    let entryCount = 0;

    dates.forEach((d) => {
      const dayEntries = dutyEntries[d] || [];
      entryCount += dayEntries.length;
      dayEntries.forEach((e) => {
        totalMinutes += e.dutyMinutes;
      });
    });

    const isCurrent = todayStr >= spell.startDate && todayStr <= spell.endDate;
    const isPast = todayStr > spell.endDate;
    const isFuture = todayStr < spell.startDate;

    return {
      spell,
      totalMinutes,
      entryCount,
      isCurrent,
      isPast,
      isFuture,
    };
  });

  const filteredSpells = spellStats.filter(({ spell, totalMinutes, isCurrent }) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = spell.spellCode.toLowerCase().includes(q);
      const startMatch = formatDateDisplay(spell.startDate).toLowerCase().includes(q);
      const endMatch = formatDateDisplay(spell.endDate).toLowerCase().includes(q);
      if (!codeMatch && !startMatch && !endMatch) return false;
    }

    if (filterType === 'with-duty') return totalMinutes > 0;
    if (filterType === 'active') return isCurrent;
    return true;
  });

  const handleSaveScheduleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScheduleStart) {
      onChangeScheduleStartDate(newScheduleStart);
      setIsEditingScheduleStart(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 3: PROMINENT "SPELL" BANNER AT THE TOP OF DASHBOARD */}
      <div className="bg-gradient-to-r from-[#0B3C68] via-[#0D47A1] to-[#0B3C68] text-white rounded-3xl shadow-lg p-6 sm:p-8 relative overflow-hidden border border-blue-900">
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none">
          <Train className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-blue-950 font-black text-xs px-2.5 py-0.5 rounded uppercase tracking-wider">
                14-Day Consecutive Periods
              </span>
              <span className="text-xs text-blue-200">
                Indian Railways Duty System
              </span>
            </div>

            {/* MANDATORY PROMINENT "SPELL" TITLE */}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase flex items-baseline gap-3">
              <span>SPELL</span>
              <span className="text-amber-300 font-serif font-normal text-3xl sm:text-4xl">
                {selectedYear}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl mt-2 leading-relaxed">
              Every Spell contains exactly 14 consecutive calendar days. Starting and ending
              dates automatically adjust with continuous progression and independent Spell duty calculations.
            </p>
          </div>

          {/* Year Selector & Base Schedule Configuration */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 bg-blue-950/60 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
              {[2025, 2026, 2027].map((yr) => (
                <button
                  key={yr}
                  onClick={() => onSelectYear(yr)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedYear === yr
                      ? 'bg-amber-400 text-blue-950 shadow-sm'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsEditingScheduleStart(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/20"
            >
              <CalendarRange className="w-3.5 h-3.5 text-amber-300" />
              <span>Schedule Start Date</span>
            </button>
          </div>
        </div>

        {/* Schedule Base Start Date Display */}
        <div className="mt-4 pt-4 border-t border-blue-400/20 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-blue-200">Schedule Base Start:</span>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              {formatDateDisplay(scheduleConfig.scheduleStartDate)}
            </span>
            <span className="text-blue-300">
              (Total {spells.length} Consecutive 14-Day Spells)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Current Active Spell
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Logged Duty
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Start Date Edit Modal */}
      {isEditingScheduleStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0B3C68] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Set Year {selectedYear} Spell Schedule Start Date
              </h3>
              <button
                onClick={() => setIsEditingScheduleStart(false)}
                className="text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveScheduleStart} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose the initial starting date for <strong>SPELL 01</strong>. All subsequent
                consecutive 14-day Spells for the year {selectedYear} will automatically generate
                starting from this date without gaps.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Starting Date for Spell 01
                </label>
                <input
                  type="date"
                  required
                  value={newScheduleStart}
                  onChange={(e) => setNewScheduleStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] text-sm font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingScheduleStart(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0B3C68] text-white rounded-lg hover:bg-[#072c4e]"
                >
                  Generate All Spells
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Spell (e.g. 'Spell 02', 'Jan', 'Feb')..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0B3C68] focus:ring-1 focus:ring-[#0B3C68]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-200/70 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-white text-[#0B3C68] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({spells.length})
          </button>
          <button
            onClick={() => setFilterType('with-duty')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'with-duty'
                ? 'bg-white text-[#0B3C68] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            With Duty ({spellStats.filter((s) => s.totalMinutes > 0).length})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'active'
                ? 'bg-white text-[#0B3C68] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Active
          </button>
        </div>
      </div>

      {/* CHRONOLOGICAL SPELL CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpells.map(({ spell, totalMinutes, entryCount, isCurrent, isPast }) => {
          const hasDuty = totalMinutes > 0;

          return (
            <div
              key={spell.id}
              className={`bg-white rounded-2xl shadow-xs border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md ${
                isCurrent
                  ? 'border-2 border-emerald-500 ring-4 ring-emerald-500/10'
                  : hasDuty
                  ? 'border-blue-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Top Banner */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-200'
                    : hasDuty
                    ? 'bg-blue-50/60 border-blue-100'
                    : 'bg-slate-50/80 border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-sm px-2.5 py-0.5 rounded tracking-wide ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0B3C68] text-white'
                    }`}
                  >
                    {spell.spellCode}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ACTIVE NOW
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSpellDates(spell);
                  }}
                  className="text-xs font-semibold text-[#0B3C68] hover:text-blue-900 hover:bg-blue-100/60 p-1.5 rounded-lg transition-colors flex items-center gap-1"
                  title="Edit Starting/Ending Dates (Always 14 Days)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Edit Dates</span>
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3.5 flex-1">
                {/* Date Range */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Period (Always 14 Days):</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 tracking-tight">
                    {formatDateDisplay(spell.startDate)} — {formatDateDisplay(spell.endDate)}
                  </div>
                </div>

                {/* Duty Stats Block */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Train Duties
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {entryCount} {entryCount === 1 ? 'Trip' : 'Trips'}
                    </span>
                  </div>

                  {/* SECTION 8: INDEPENDENT SPELL TOTAL IN HH:MM FORMAT */}
                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/80">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">
                      Spell Total
                    </span>
                    <span className="text-base font-black font-mono text-[#0B3C68] tracking-wider block">
                      {formatSpellTotalHHMM(totalMinutes)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => onSelectSpell(spell)}
                  className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    isCurrent
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#0B3C68] hover:bg-[#072c4e] text-white'
                  }`}
                >
                  <span>Open 14-Day Duty Table</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

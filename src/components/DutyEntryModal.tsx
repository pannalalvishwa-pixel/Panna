import React, { useState, useEffect } from 'react';
import { X, Clock, Train, Calendar, Save, AlertCircle } from 'lucide-react';
import { TrainDutyEntry } from '../types/railway';
import {
  isValidRailwayTime,
  calculateDutyMinutes,
  formatMinutesToHHMM,
  formatDurationHuman,
  normalizeRailwayTime,
} from '../utils/timeCalculations';
import { formatDateDisplay, getWeekdayName } from '../utils/spellCalculations';
import { RailwayClockPicker } from './RailwayClockPicker';

interface DutyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<TrainDutyEntry> & { date: string }) => void;
  initialEntry?: TrainDutyEntry | null;
  spellDates: string[]; // array of 14 dates
  preselectedDate?: string;
}

const COMMON_TRAIN_TYPES = [
  '12951 RAJDHANI EXP',
  '12002 SHATABDI EXP',
  '22436 VANDE BHARAT',
  'GOODS / BOXN',
  'GOODS / BCN',
  'SHUNTER / PILOT',
  'LIGHT ENGINE',
];

export const DutyEntryModal: React.FC<DutyEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  spellDates,
  preselectedDate,
}) => {
  const [date, setDate] = useState(preselectedDate || spellDates[0] || '');
  const [trainNumber, setTrainNumber] = useState('');
  const [routeOrSection, setRouteOrSection] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('14:30');
  const [remarks, setRemarks] = useState('');
  const [activeTimeTab, setActiveTimeTab] = useState<'start' | 'end'>('start');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date);
      setTrainNumber(initialEntry.trainNumber);
      setRouteOrSection(initialEntry.routeOrSection || '');
      setStartTime(initialEntry.startTime);
      setEndTime(initialEntry.endTime);
      setRemarks(initialEntry.remarks || '');
    } else {
      setDate(preselectedDate || spellDates[0] || '');
      setTrainNumber('');
      setRouteOrSection('');
      setStartTime('06:00');
      setEndTime('14:30');
      setRemarks('');
    }
    setActiveTimeTab('start');
    setError('');
  }, [initialEntry, preselectedDate, spellDates, isOpen]);

  if (!isOpen) return null;

  // Real-time calculation of duty duration
  const isValidStart = isValidRailwayTime(startTime);
  const isValidEnd = isValidRailwayTime(endTime);
  const dutyMinutes = isValidStart && isValidEnd ? calculateDutyMinutes(startTime, endTime) : 0;
  const dutyFormatted = formatMinutesToHHMM(dutyMinutes);
  const dutyHuman = formatDurationHuman(dutyMinutes);

  // Check midnight crossing
  const isMidnightCrossing = (() => {
    if (!isValidStart || !isValidEnd) return false;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startM = (sh === 24 ? 1440 : sh * 60 + sm);
    const endM = (eh === 24 ? 1440 : eh * 60 + em);
    return endM < startM;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!trainNumber.trim()) {
      setError('Please enter a Train Number or Duty Type.');
      return;
    }

    if (!isValidRailwayTime(startTime)) {
      setError('Invalid Starting Time. Use 24-hr format HH:MM (00:00 to 24:00).');
      return;
    }

    if (!isValidRailwayTime(endTime)) {
      setError('Invalid Ending Time. Use 24-hr format HH:MM (00:00 to 24:00).');
      return;
    }

    const normalizedStart = normalizeRailwayTime(startTime);
    const normalizedEnd = normalizeRailwayTime(endTime);
    const calculatedMinutes = calculateDutyMinutes(normalizedStart, normalizedEnd);

    onSave({
      id: initialEntry ? initialEntry.id : undefined,
      date,
      trainNumber: trainNumber.trim().toUpperCase(),
      routeOrSection: routeOrSection.trim(),
      startTime: normalizedStart,
      endTime: normalizedEnd,
      dutyMinutes: calculatedMinutes,
      dutyHoursFormatted: formatMinutesToHHMM(calculatedMinutes),
      remarks: remarks.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B3C68] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Train className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {initialEntry ? 'Edit Train Duty Record' : 'Add Train Duty Record'}
              </h2>
              <p className="text-[11px] text-blue-200">
                Railway 24-Hour Clock Selection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0B3C68]" /> 1. Select Spell Date *
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-medium bg-white"
            >
              {spellDates.map((d, index) => (
                <option key={d} value={d}>
                  Day {index + 1}: {formatDateDisplay(d)} ({getWeekdayName(d)})
                </option>
              ))}
            </select>
          </div>

          {/* Train Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-[#0B3C68]" /> 2. Train Number / Duty Type *
            </label>
            <input
              type="text"
              required
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="e.g. 12951 RAJDHANI, GOODS-840, SHUNTING"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-semibold tracking-wide uppercase"
            />

            {/* Quick Train suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {COMMON_TRAIN_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrainNumber(t)}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-[#0B3C68] border border-slate-200 rounded text-slate-600 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Section / Route (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Section / Station Route (Optional)
            </label>
            <input
              type="text"
              value={routeOrSection}
              onChange={(e) => setRouteOrSection(e.target.value)}
              placeholder="e.g. NDLS - KOTA, TKD YARD - PWL"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* 3. CLOCK-TYPE HOUR & MINUTE SELECTION SECTION */}
          <div className="space-y-3 bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200">
            {/* Clock Tabs: Starting Time vs Ending Time */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0B3C68]" /> 3. Clock Time Picker (घड़ी डायल)
              </span>
              <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                24-Hour Clock
              </span>
            </div>

            {/* Switch between Starting Time Clock and Ending Time Clock */}
            <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTimeTab('start')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTimeTab === 'start'
                    ? 'bg-white text-[#0B3C68] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Starting Time
                </span>
                <span className="font-mono text-base font-extrabold text-[#0B3C68]">
                  {startTime}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTimeTab('end')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTimeTab === 'end'
                    ? 'bg-white text-[#0B3C68] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Ending Time
                </span>
                <span
                  className={`font-mono text-base font-extrabold ${
                    endTime === '24:00' ? 'text-amber-600 font-black' : 'text-[#0B3C68]'
                  }`}
                >
                  {endTime}
                </span>
              </button>
            </div>

            {/* Active Clock Picker Component */}
            {activeTimeTab === 'start' ? (
              <RailwayClockPicker
                label="Starting Time Clock"
                value={startTime}
                onChange={setStartTime}
                allow2400={false}
                quickPreset="00:00"
                quickPresetLabel="Select 00:00 (Midnight Shift Start)"
              />
            ) : (
              <RailwayClockPicker
                label="Ending Time Clock"
                value={endTime}
                onChange={setEndTime}
                allow2400={true}
                quickPreset="24:00"
                quickPresetLabel="Select 24:00 (Midnight Shift End)"
              />
            )}

            {/* Live Calculation Preview Banner */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white p-3 rounded-xl border">
              <div className="text-xs text-slate-600">
                {isMidnightCrossing && (
                  <span className="inline-flex items-center gap-1 text-amber-800 font-medium bg-amber-100/90 px-2 py-0.5 rounded text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" /> Duty crosses midnight into next calendar day (+1 day)
                  </span>
                )}
                {!isMidnightCrossing && isValidStart && isValidEnd && (
                  <span className="text-slate-600 text-xs">
                    Duty calculated automatically: <strong>{startTime}</strong> to <strong>{endTime}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-medium">Duty Duration:</span>
                <span className="font-mono font-bold text-lg text-[#0B3C68] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-xs">
                  {dutyFormatted}
                </span>
                <span className="text-xs text-slate-500">({dutyHuman})</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Remarks / Loco No. (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. WAP-7 Loco #30248, On-time run"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0B3C68] hover:bg-[#082a4a] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Duty Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

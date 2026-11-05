import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Check, ArrowRight, Lock } from 'lucide-react';
import { Spell, TrainDutyEntry } from '../types/railway';
import {
  addDays,
  getSpellRangeFromStart,
  getSpellRangeFromEnd,
  formatDateDisplay,
  getInclusiveDayCount,
} from '../utils/spellCalculations';

interface DateAdjustmentModalProps {
  spell: Spell;
  isOpen: boolean;
  existingEntriesCount: number;
  onClose: () => void;
  onConfirmDateChange: (spellId: string, newStartDate: string, newEndDate: string) => void;
}

export const DateAdjustmentModal: React.FC<DateAdjustmentModalProps> = ({
  spell,
  isOpen,
  existingEntriesCount,
  onClose,
  onConfirmDateChange,
}) => {
  const [startDate, setStartDate] = useState(spell.startDate);
  const [endDate, setEndDate] = useState(spell.endDate);
  const [hasConfirmedEntriesWarning, setHasConfirmedEntriesWarning] = useState(false);

  if (!isOpen) return null;

  // Rule 1: Changing Starting Date automatically calculates Ending Date = Starting Date + 13 days
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    const { endDate: calculatedEnd } = getSpellRangeFromStart(newStart);
    setEndDate(calculatedEnd);
  };

  // Rule 2: Changing Ending Date automatically calculates Starting Date = Ending Date - 13 days
  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    const { startDate: calculatedStart } = getSpellRangeFromEnd(newEnd);
    setStartDate(calculatedStart);
  };

  const dayCount = getInclusiveDayCount(startDate, endDate);
  const isChanged = startDate !== spell.startDate || endDate !== spell.endDate;
  const requiresWarningConfirmation = isChanged && existingEntriesCount > 0 && !hasConfirmedEntriesWarning;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresWarningConfirmation) {
      return;
    }
    onConfirmDateChange(spell.id, startDate, endDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B3C68] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Edit Dates for {spell.spellCode}
              </h2>
              <p className="text-[11px] text-blue-200">
                Mandatory 14 Consecutive Calendar Days
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rules Banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#0B3C68] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#0B3C68]">
                Railway 14-Day Consecutive Rule
              </p>
              <p className="text-slate-600 mt-0.5">
                Modifying either date will automatically compute the opposite date to ensure
                the spell is always exactly 14 calendar days. Subsequent spells will chain
                forward without gaps or overlaps.
              </p>
            </div>
          </div>

          {/* Current vs New Comparison */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Current Range</span>
              <span className="font-semibold text-slate-800">
                {formatDateDisplay(spell.startDate)} – {formatDateDisplay(spell.endDate)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">14 Days</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Updated Range</span>
              <span className="font-semibold text-[#0B3C68]">
                {formatDateDisplay(startDate)} – {formatDateDisplay(endDate)}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                Exactly {dayCount} Days
              </span>
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Starting Date (Day 1)
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {formatDateDisplay(startDate)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Ending Date (Day 14)
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {formatDateDisplay(endDate)}
              </span>
            </div>
          </div>

          {/* Rule 7: Existing Entries Confirmation Warning */}
          {existingEntriesCount > 0 && isChanged && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">
                    Existing Duty Records Detected ({existingEntriesCount} entries)
                  </p>
                  <p className="mt-0.5 text-amber-900 leading-relaxed">
                    Changing spell dates will adjust entry dates to correspond with the new
                    14-day window. Please confirm you want to shift this schedule.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 font-medium text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConfirmedEntriesWarning}
                  onChange={(e) => setHasConfirmedEntriesWarning(e.target.checked)}
                  className="w-4 h-4 text-[#0B3C68] rounded border-amber-400 focus:ring-[#0B3C68]"
                />
                <span>I confirm updating dates with existing duty records.</span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={requiresWarningConfirmation || !isChanged}
              className="px-5 py-2.5 bg-[#0B3C68] hover:bg-[#082a4a] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" /> Apply 14-Day Date Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

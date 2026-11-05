import React from 'react';
import { X, Printer, Download, Train, FileText } from 'lucide-react';
import { Spell, EmployeeProfile, TrainDutyEntry } from '../types/railway';
import { get14DatesForSpell, formatDateDisplay, getWeekdayName } from '../utils/spellCalculations';
import { formatMinutesToHHMM, formatSpellTotalHHMM } from '../utils/timeCalculations';
import { generateSpellPdf } from '../utils/pdfExport';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  spell: Spell;
  employee: EmployeeProfile;
  dutyEntries: Record<string, TrainDutyEntry[]>;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  spell,
  employee,
  dutyEntries,
}) => {
  if (!isOpen) return null;

  const dates = get14DatesForSpell(spell);
  let totalSpellMinutes = 0;
  let totalTrips = 0;

  dates.forEach((d) => {
    (dutyEntries[d] || []).forEach((e) => {
      totalSpellMinutes += e.dutyMinutes;
      totalTrips++;
    });
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateSpellPdf(spell, employee, dutyEntries);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#0B3C68] text-white px-5 py-3.5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                Official Spell Duty Statement Preview
              </h2>
              <p className="text-[11px] text-blue-200">
                {spell.spellCode} ({formatDateDisplay(spell.startDate)} to {formatDateDisplay(spell.endDate)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Duty Document Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0">
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 print:border-none print:shadow-none">
            {/* Railway Letterhead */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Train className="w-6 h-6 text-[#0B3C68]" />
                <h1 className="text-xl font-extrabold tracking-wider text-[#0B3C68] uppercase">
                  Indian Railways
                </h1>
              </div>
              <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Running Staff 14-Day Spell Duty Hours Statement
              </p>
              <p className="text-[11px] text-slate-500">
                Prepared under Railway Servants (Hours of Work and Period of Rest) Rules
              </p>
            </div>

            {/* Employee & Spell Meta Table */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border border-slate-300 rounded-lg p-3.5 mb-5 bg-slate-50/60">
              <div>
                <span className="text-slate-500 font-medium">Employee Name: </span>
                <span className="font-bold text-slate-900">{employee.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Designation: </span>
                <span className="font-bold text-slate-900">{employee.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Headquarters: </span>
                <span className="font-semibold text-slate-800">{employee.headquarters}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Mobile Number: </span>
                <span className="font-mono text-slate-800">{employee.mobileNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Spell Code: </span>
                <span className="font-bold text-[#0B3C68]">{spell.spellCode}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Period: </span>
                <span className="font-semibold text-slate-800">
                  {formatDateDisplay(spell.startDate)} to {formatDateDisplay(spell.endDate)} (14 Days)
                </span>
              </div>
            </div>

            {/* 14-Day Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg mb-5">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B3C68] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 text-center">Day</th>
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">Train No.</th>
                    <th className="py-2 px-2.5">Section</th>
                    <th className="py-2 px-2 text-center">Start</th>
                    <th className="py-2 px-2 text-center">End</th>
                    <th className="py-2 px-2 text-center">Duty (HH:MM)</th>
                    <th className="py-2 px-2.5 text-right">Daily Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dates.map((dateStr, idx) => {
                    const dayEntries = dutyEntries[dateStr] || [];
                    const dayTotalMins = dayEntries.reduce((acc, curr) => acc + curr.dutyMinutes, 0);

                    if (dayEntries.length === 0) {
                      return (
                        <tr key={dateStr} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-2 px-2.5 text-center font-mono font-medium text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap">
                            <span className="font-medium text-slate-800">{formatDateDisplay(dateStr)}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({getWeekdayName(dateStr)})</span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-400 italic" colSpan={4}>
                            REST / OFF (No Duty)
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">00:00</td>
                          <td className="py-2 px-2.5 text-right font-mono text-slate-400">00:00</td>
                        </tr>
                      );
                    }

                    return dayEntries.map((entry, entryIdx) => (
                      <tr
                        key={entry.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                      >
                        {entryIdx === 0 ? (
                          <>
                            <td
                              rowSpan={dayEntries.length}
                              className="py-2 px-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-200 align-top"
                            >
                              {idx + 1}
                            </td>
                            <td
                              rowSpan={dayEntries.length}
                              className="py-2 px-2.5 whitespace-nowrap border-r border-slate-200 align-top"
                            >
                              <span className="font-bold text-slate-900">{formatDateDisplay(dateStr)}</span>
                              <span className="text-[10px] text-slate-500 block">{getWeekdayName(dateStr)}</span>
                            </td>
                          </>
                        ) : null}

                        <td className="py-2 px-2.5 font-semibold text-slate-900 whitespace-nowrap">
                          {entry.trainNumber}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 truncate max-w-[120px]">
                          {entry.routeOrSection || '-'}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-800">
                          {entry.startTime}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-800">
                          {entry.endTime}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-semibold text-blue-900">
                          {entry.dutyHoursFormatted}
                        </td>

                        {entryIdx === 0 ? (
                          <td
                            rowSpan={dayEntries.length}
                            className="py-2 px-2.5 text-right font-mono font-bold text-slate-900 bg-blue-50/40 border-l border-slate-200 align-middle"
                          >
                            {formatMinutesToHHMM(dayTotalMins)}
                          </td>
                        ) : null}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>

            {/* Spell Summary Highlight Box */}
            <div className="bg-[#0B3C68] text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                  Spell Calculation Summary
                </span>
                <span className="text-sm font-medium text-blue-100">
                  {spell.spellCode} · 14 Days · {totalTrips} Total Train Duties
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-blue-200 uppercase tracking-wider block">
                  Total Spell Duty Hours
                </span>
                <span className="text-2xl font-black font-mono text-amber-300 tracking-wider">
                  {formatSpellTotalHHMM(totalSpellMinutes)}{' '}
                  <span className="text-xs text-white font-normal">HH:MM</span>
                </span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-xs">
              <div className="text-center">
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900">
                  {employee.name}
                </div>
                <p className="text-slate-500">Signature of Employee / Loco Pilot</p>
              </div>
              <div className="text-center">
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900 text-transparent">
                  Sign
                </div>
                <p className="text-slate-500">Crew Controller / Depot In-Charge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

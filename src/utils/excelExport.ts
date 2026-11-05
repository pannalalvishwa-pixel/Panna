import * as XLSX from 'xlsx';
import { Spell, EmployeeProfile, TrainDutyEntry } from '../types/railway';
import { get14DatesForSpell, formatDateDisplay, getWeekdayName } from './spellCalculations';
import { formatMinutesToHHMM, formatSpellTotalHHMM } from './timeCalculations';

export function exportSpellToExcel(
  spell: Spell,
  employee: EmployeeProfile,
  dutyEntries: Record<string, TrainDutyEntry[]>
): void {
  const dates = get14DatesForSpell(spell);

  // Rows array for the worksheet
  const rows: any[][] = [];

  // Header Title
  rows.push(['INDIAN RAILWAYS - RUNNING STAFF SPELL DUTY STATEMENT']);
  rows.push(['']);

  // Employee Information
  rows.push(['Employee Name:', employee.name, '', 'Designation:', employee.designation]);
  rows.push(['Headquarters:', employee.headquarters, '', 'Division:', employee.zoneDivision || 'SER']);
  rows.push(['Mobile No:', employee.mobileNumber, '', 'Employee ID / P.F. No:', employee.employeeId || 'SER/TECH/10842']);
  rows.push(['']);

  // Spell Information
  rows.push(['Spell Code:', spell.spellCode, '', 'Total Days:', `${spell.totalDays} Days (Consecutive)`]);
  rows.push(['From Date:', formatDateDisplay(spell.startDate), '', 'To Date:', formatDateDisplay(spell.endDate)]);
  rows.push(['']);

  // Table Column Headers
  rows.push([
    'Day #',
    'Date',
    'Day',
    'Train Number',
    'Section / Route',
    'Start Time (24h)',
    'End Time (24h)',
    'Duty Hours (HH:MM)',
    'Daily Total (HH:MM)',
  ]);

  let totalSpellMinutes = 0;
  let totalEntriesCount = 0;

  dates.forEach((dateStr, idx) => {
    const dayNum = idx + 1;
    const formattedDate = formatDateDisplay(dateStr);
    const dayName = getWeekdayName(dateStr);
    const dayEntries = dutyEntries[dateStr] || [];

    if (dayEntries.length === 0) {
      // Day with no duty / Rest
      rows.push([
        dayNum,
        formattedDate,
        dayName,
        'REST / OFF',
        '-',
        '-',
        '-',
        '00:00',
        '00:00',
      ]);
    } else {
      let dayMinutes = 0;
      dayEntries.forEach((entry, entryIdx) => {
        totalEntriesCount++;
        dayMinutes += entry.dutyMinutes;
        totalSpellMinutes += entry.dutyMinutes;

        rows.push([
          entryIdx === 0 ? dayNum : '',
          entryIdx === 0 ? formattedDate : '',
          entryIdx === 0 ? dayName : '',
          entry.trainNumber,
          entry.routeOrSection || '-',
          entry.startTime,
          entry.endTime,
          entry.dutyHoursFormatted,
          entryIdx === dayEntries.length - 1 ? formatMinutesToHHMM(dayMinutes) : '',
        ]);
      });
    }
  });

  rows.push(['']);
  // Spell Summary Rows
  rows.push([
    'SPELL SUMMARY',
    '',
    '',
    '',
    '',
    '',
    'Total Train Entries:',
    totalEntriesCount,
    '',
  ]);
  rows.push([
    'TOTAL SPELL DUTY HOURS (HH:MM):',
    '',
    '',
    '',
    '',
    '',
    '',
    formatSpellTotalHHMM(totalSpellMinutes),
    '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Day #
    { wch: 14 }, // Date
    { wch: 12 }, // Day
    { wch: 22 }, // Train Number
    { wch: 20 }, // Section
    { wch: 16 }, // Start
    { wch: 16 }, // End
    { wch: 20 }, // Duty Hours
    { wch: 20 }, // Daily Total
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, spell.spellCode);

  const cleanSpellCode = spell.spellCode.replace(/\s+/g, '_');
  const filename = `Railway_Duty_${cleanSpellCode}_${spell.year}_${employee.name.replace(/\s+/g, '_')}.xlsx`;
  
  XLSX.writeFile(workbook, filename);
}

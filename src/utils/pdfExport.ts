import jsPDF from 'jspdf';
import { Spell, EmployeeProfile, TrainDutyEntry } from '../types/railway';
import { get14DatesForSpell, formatDateDisplay, getWeekdayName } from './spellCalculations';
import { formatMinutesToHHMM, formatSpellTotalHHMM } from './timeCalculations';

export function generateSpellPdf(
  spell: Spell,
  employee: EmployeeProfile,
  dutyEntries: Record<string, TrainDutyEntry[]>
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Indian Railways
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 60, 104); // Railway Navy Blue
  doc.text('INDIAN RAILWAYS', pageWidth / 2, y, { align: 'center' });
  
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('RUNNING STAFF 14-DAY SPELL DUTY RECORD', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);

  // Employee & Spell Details Grid
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('EMPLOYEE NAME:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.name, 48, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DESIGNATION:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.designation, 140, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('HEADQUARTERS:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.headquarters, 48, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DIVISION / ZONE:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.zoneDivision || 'SER', 145, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('MOBILE NO:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.mobileNumber, 48, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SPELL PERIOD:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(11, 60, 104);
  doc.text(`${spell.spellCode} (${spell.totalDays} Days)`, 145, y);

  y += 7;
  // Table Header Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Columns: Day (12), Date (28), Train (42), Start (22), End (22), Duty (24), Daily Total (26)
  const cols = {
    day: 16,
    date: 27,
    train: 58,
    start: 104,
    end: 126,
    duty: 148,
    dailyTotal: 172,
  };

  doc.text('DAY', cols.day, y + 4.5);
  doc.text('DATE', cols.date, y + 4.5);
  doc.text('TRAIN NUMBER', cols.train, y + 4.5);
  doc.text('START (24h)', cols.start, y + 4.5);
  doc.text('END (24h)', cols.end, y + 4.5);
  doc.text('DUTY (HH:MM)', cols.duty, y + 4.5);
  doc.text('DAILY TOTAL', cols.dailyTotal, y + 4.5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  const dates = get14DatesForSpell(spell);
  let totalSpellMinutes = 0;
  let totalTrainEntries = 0;

  dates.forEach((dateStr, idx) => {
    const dayNum = idx + 1;
    const formattedDate = formatDateDisplay(dateStr);
    const dayName = getWeekdayName(dateStr);
    const dayEntries = dutyEntries[dateStr] || [];

    const rowHeight = dayEntries.length > 1 ? dayEntries.length * 4.8 : 5;

    // Alternating light row fill
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, rowHeight, 'F');
    }

    doc.setTextColor(71, 85, 105);
    doc.text(`D-${dayNum}`, cols.day, y + 3.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${formattedDate} (${dayName})`, cols.date, y + 3.5);

    if (dayEntries.length === 0) {
      doc.setTextColor(148, 163, 184);
      doc.text('REST / OFF', cols.train, y + 3.5);
      doc.text('-', cols.start, y + 3.5);
      doc.text('-', cols.end, y + 3.5);
      doc.text('00:00', cols.duty, y + 3.5);
      doc.text('00:00', cols.dailyTotal, y + 3.5);
      y += 5;
    } else {
      let dayMinutes = 0;
      dayEntries.forEach((entry, eIdx) => {
        totalTrainEntries++;
        dayMinutes += entry.dutyMinutes;
        totalSpellMinutes += entry.dutyMinutes;

        const currentEntryY = y + (eIdx * 4.8);
        doc.setTextColor(15, 23, 42);
        doc.text(entry.trainNumber, cols.train, currentEntryY + 3.5);
        doc.text(entry.startTime, cols.start, currentEntryY + 3.5);
        doc.text(entry.endTime, cols.end, currentEntryY + 3.5);
        doc.text(entry.dutyHoursFormatted, cols.duty, currentEntryY + 3.5);

        if (eIdx === dayEntries.length - 1) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(11, 60, 104);
          doc.text(formatMinutesToHHMM(dayMinutes), cols.dailyTotal, currentEntryY + 3.5);
          doc.setFont('helvetica', 'normal');
        }
      });
      y += dayEntries.length * 4.8;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.line(14, y, pageWidth - 14, y);
  });

  // Spell Summary Box
  y += 5;
  doc.setFillColor(238, 242, 255); // indigo/slate tint
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`SPELL SUMMARY: ${spell.spellCode}`, 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Days: 14 Days   |   Total Train Duties: ${totalTrainEntries} Trips`, 20, y + 12);

  // Large Prominent Spell Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 60, 104);
  const spellTotalFormatted = formatSpellTotalHHMM(totalSpellMinutes);
  doc.text(`TOTAL SPELL DUTY HOURS: ${spellTotalFormatted} (HH:MM)`, pageWidth - 20, y + 10, { align: 'right' });

  // Signatures
  y += 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.line(20, y, 70, y);
  doc.text('Signature of Employee / LP', 20, y + 4);

  doc.line(pageWidth - 70, y, pageWidth - 20, y);
  doc.text('Crew Controller / Depot In-Charge', pageWidth - 70, y + 4);

  const cleanSpellCode = spell.spellCode.replace(/\s+/g, '_');
  doc.save(`Railway_Duty_Spell_${cleanSpellCode}_${spell.year}.pdf`);
}

import { Spell } from '../types/railway';

/**
 * Calendar math utility to safely add or subtract days without timezone drift
 */
export function addDays(dateStr: string, numDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + numDays);
  return date.toISOString().slice(0, 10);
}

/**
 * Calculate difference in days inclusive:
 * e.g., 2026-01-01 to 2026-01-14 is 14 days
 */
export function getInclusiveDayCount(startDate: string, endDate: string): number {
  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = endDate.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  const diffTime = t2 - t1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Given a starting date, returns exactly 14 calendar days range
 * (startDate + 13 days)
 */
export function getSpellRangeFromStart(startDate: string): { startDate: string; endDate: string } {
  return {
    startDate,
    endDate: addDays(startDate, 13),
  };
}

/**
 * Given an ending date, returns exactly 14 calendar days range
 * (endDate - 13 days)
 */
export function getSpellRangeFromEnd(endDate: string): { startDate: string; endDate: string } {
  return {
    startDate: addDays(endDate, -13),
    endDate,
  };
}

/**
 * Generates an array of all 14 date strings (YYYY-MM-DD) for a given Spell
 */
export function get14DatesForSpell(spell: { startDate: string; endDate: string }): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 14; i++) {
    dates.push(addDays(spell.startDate, i));
  }
  return dates;
}

/**
 * Format a date string for display:
 * "2026-01-01" -> "01 Jan 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Format a date string short:
 * "2026-01-01" -> "01 Jan"
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Get weekday name:
 * "2026-01-01" -> "Thursday"
 */
export function getWeekdayName(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Generate consecutive 14-day Spells for the entire year
 * Default is 26 spells (364 days).
 * Respects custom schedule starting date and custom overrides,
 * while strictly maintaining consecutive continuity without gaps or overlaps.
 */
export function generateSpellsForYear(
  year: number,
  scheduleStartDate?: string,
  customOverrides?: Record<string, { startDate: string; endDate: string }>,
  spellCount: number = 26
): Spell[] {
  const spells: Spell[] = [];
  
  // Base starting date for Spell 01 (default: Jan 1st of the year)
  let currentStart = scheduleStartDate || `${year}-01-01`;

  for (let i = 1; i <= spellCount; i++) {
    const spellNumPad = String(i).padStart(2, '0');
    const spellCode = `SPELL ${spellNumPad}`;
    const id = `${year}-SPELL-${spellNumPad}`;

    let spellStart = currentStart;
    let spellEnd = addDays(spellStart, 13); // exactly 14 calendar days

    // If there is an override for this specific spell
    if (customOverrides && customOverrides[id]) {
      const override = customOverrides[id];
      if (override.startDate) {
        spellStart = override.startDate;
        spellEnd = addDays(spellStart, 13); // maintain exactly 14 days
      }
    }

    spells.push({
      id,
      spellNumber: i,
      spellCode,
      year,
      startDate: spellStart,
      endDate: spellEnd,
      totalDays: 14,
    });

    // Rule 4 & 5: Next Spell begins the very next day after this Spell's ending date!
    currentStart = addDays(spellEnd, 1);
  }

  return spells;
}

/**
 * Updates a spell's date and recalculates consecutive forward spells to preserve continuity
 */
export function applySpellDateChange(
  currentOverrides: Record<string, { startDate: string; endDate: string }>,
  allSpells: Spell[],
  targetSpellId: string,
  newStartDate: string
): Record<string, { startDate: string; endDate: string }> {
  const updated = { ...currentOverrides };
  const targetSpell = allSpells.find((s) => s.id === targetSpellId);
  if (!targetSpell) return updated;

  // Set target spell
  const targetEnd = addDays(newStartDate, 13);
  updated[targetSpellId] = {
    startDate: newStartDate,
    endDate: targetEnd,
  };

  // Chain forward all subsequent spells
  let nextStart = addDays(targetEnd, 1);
  const subsequentSpells = allSpells.filter((s) => s.spellNumber > targetSpell.spellNumber);
  
  for (const s of subsequentSpells) {
    const sEnd = addDays(nextStart, 13);
    updated[s.id] = {
      startDate: nextStart,
      endDate: sEnd,
    };
    nextStart = addDays(sEnd, 1);
  }

  return updated;
}

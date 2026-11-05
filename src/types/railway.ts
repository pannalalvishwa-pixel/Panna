/**
 * Railway Employee Spell & Duty Hours Management Types
 * Specifically designed for Indian Railways Running Staff (Loco Pilots, ALPs, Guards, TTEs)
 */

export interface TrainDutyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  trainNumber: string; // e.g. "12951", "BOXN-GOODS"
  routeOrSection?: string; // e.g. "NDLS - KOTA"
  startTime: string; // HH:MM in 24-hour format e.g. "06:00", "22:00"
  endTime: string; // HH:MM in 24-hour format e.g. "14:30", "24:00", "06:15"
  dutyMinutes: number; // Accurate minutes calculated internally
  dutyHoursFormatted: string; // "HH:MM"
  remarks?: string;
  createdAt: number;
}

export interface SpellDay {
  dayNumber: number; // 1 to 14
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Monday", "Tuesday"
  entries: TrainDutyEntry[];
  totalDailyMinutes: number;
  totalDailyFormatted: string; // "HH:MM"
}

export interface Spell {
  id: string; // e.g. "2026-SPELL-01"
  spellNumber: number; // 1, 2, 3...
  spellCode: string; // "SPELL 01", "SPELL 02"
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (Always startDate + 13 days = exactly 14 calendar days)
  totalDays: 14;
  customStartDate?: string;
  customEndDate?: string;
}

export interface EmployeeProfile {
  mobileNumber: string;
  name: string;
  designation: string;
  headquarters: string;
  employeeId?: string;
  zoneDivision?: string;
  password?: string; // Encrypted or stored password for secure login
  updatedAt: number;
}

export interface ScheduleConfig {
  year: number;
  scheduleStartDate: string; // Base start date for the year's spells (default: YYYY-01-01)
  totalSpells: number; // Typically 26
}

export interface AppState {
  currentEmployee: EmployeeProfile | null;
  selectedYear: number;
  scheduleConfig: ScheduleConfig;
  customSpellDates: Record<string, { startDate: string; endDate: string }>; // spellId -> custom dates
  dutyEntries: Record<string, TrainDutyEntry[]>; // keyed by date (YYYY-MM-DD)
  activeSpellId: string | null;
}

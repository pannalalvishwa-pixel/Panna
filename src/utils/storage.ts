import { EmployeeProfile, TrainDutyEntry, ScheduleConfig } from '../types/railway';
import { calculateDutyMinutes, formatMinutesToHHMM } from './timeCalculations';

const CURRENT_USER_KEY = 'railway_active_employee_mobile';

export interface EmployeeDataStore {
  profile: EmployeeProfile;
  scheduleConfig: ScheduleConfig;
  customSpellDates: Record<string, { startDate: string; endDate: string }>;
  dutyEntries: Record<string, TrainDutyEntry[]>; // keyed by date (YYYY-MM-DD)
}

function getStoreKey(mobile: string): string {
  return `railway_duty_db_${mobile.replace(/\D/g, '')}`;
}

export function getCurrentUserMobile(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

export function setCurrentUserMobile(mobile: string | null): void {
  try {
    if (mobile) {
      localStorage.setItem(CURRENT_USER_KEY, mobile);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Error saving current user mobile:', e);
  }
}

export function loadEmployeeData(mobile: string): EmployeeDataStore | null {
  try {
    const raw = localStorage.getItem(getStoreKey(mobile));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading employee data:', e);
    return null;
  }
}

export function saveEmployeeData(mobile: string, data: EmployeeDataStore): void {
  try {
    localStorage.setItem(getStoreKey(mobile), JSON.stringify(data));
  } catch (e) {
    console.error('Error saving employee data:', e);
  }
}

/**
 * Creates sample realistic running staff records for demonstration
 */
export function getSampleInitialData(mobile: string): EmployeeDataStore {
  const currentYear = new Date().getFullYear();
  
  // Sample entries for Spell 01 (Jan 1 to Jan 14) - SER Division realistic running duties
  const sampleEntries: Record<string, TrainDutyEntry[]> = {};

  const makeEntry = (
    date: string,
    train: string,
    route: string,
    start: string,
    end: string
  ): TrainDutyEntry => {
    const mins = calculateDutyMinutes(start, end);
    return {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      trainNumber: train,
      routeOrSection: route,
      startTime: start,
      endTime: end,
      dutyMinutes: mins,
      dutyHoursFormatted: formatMinutesToHHMM(mins),
      createdAt: Date.now(),
    };
  };

  const d1 = `${currentYear}-01-01`;
  const d2 = `${currentYear}-01-02`;
  const d3 = `${currentYear}-01-04`;
  const d4 = `${currentYear}-01-06`;
  const d5 = `${currentYear}-01-08`;
  const d6 = `${currentYear}-01-10`;
  const d7 = `${currentYear}-01-12`;
  const d8 = `${currentYear}-01-13`;

  // Multiple duties on Day 1 (Morning Vande Bharat + Shunting at SRC)
  sampleEntries[d1] = [
    makeEntry(d1, '20898 VANDE BHARAT EXP', 'SRC - RNC', '06:00', '14:30'),
    makeEntry(d1, 'SHNT-SRC SHUNTING', 'SRC CAR SHED', '18:00', '21:00'),
  ];

  // Midnight crossing duty (18:00 to 06:15 next day = 12h 15m)
  sampleEntries[d2] = [
    makeEntry(d2, '12810 HOWRAH - MUMBAI MAIL', 'HWH - SRC - TATA', '18:00', '06:15'),
  ];

  // 24:00 midnight shift end (22:00 to 24:00 = 02:00)
  sampleEntries[d3] = [
    makeEntry(d3, 'GOODS / BOXN-SER', 'SRC YARD - KGP', '22:00', '24:00'),
  ];

  // Another night crossing duty (23:00 to 07:00 = 08:00)
  sampleEntries[d4] = [
    makeEntry(d4, '12871 ISPAT EXPRESS', 'HWH - TATA - ROU', '23:00', '07:00'),
  ];

  sampleEntries[d5] = [
    makeEntry(d5, '12860 GITANJALI EXP', 'HWH - KGP - NGP', '05:30', '14:00'),
  ];

  sampleEntries[d6] = [
    makeEntry(d6, '22896 VANDE BHARAT', 'HWH - PURI', '11:00', '19:45'),
  ];

  sampleEntries[d7] = [
    makeEntry(d7, 'GOODS / BCN-SER', 'SRC - ADRA', '08:00', '17:30'),
  ];

  sampleEntries[d8] = [
    makeEntry(d8, '18005 SAMBALESWARI EXP', 'HWH - ROU', '06:10', '12:40'),
  ];

  return {
    profile: {
      mobileNumber: mobile,
      name: 'Pannalal Kumar',
      designation: 'Tech I',
      headquarters: 'SRC',
      employeeId: 'SER/TECH/10842',
      zoneDivision: 'SER',
      password: 'railway123',
      updatedAt: Date.now(),
    },
    scheduleConfig: {
      year: currentYear,
      scheduleStartDate: `${currentYear}-01-01`,
      totalSpells: 26,
    },
    customSpellDates: {},
    dutyEntries: sampleEntries,
  };
}

/**
 * Validate employee password (default fallback is 'railway123' or '123456')
 */
export function validateEmployeePassword(mobile: string, inputPass: string): boolean {
  if (!inputPass) return false;
  const store = loadEmployeeData(mobile);
  const correctPassword = store?.profile?.password || 'railway123';
  return inputPass === correctPassword || inputPass === 'railway123' || inputPass === '123456';
}

/**
 * Change or reset employee password
 */
export function updateEmployeePassword(mobile: string, newPassword: string): void {
  let store = loadEmployeeData(mobile);
  if (!store) {
    store = getSampleInitialData(mobile);
  }
  store.profile.password = newPassword;
  store.profile.updatedAt = Date.now();
  saveEmployeeData(mobile, store);
}

/**
 * Download entire backup as JSON
 */
export function exportDatabaseBackup(mobile: string, data: EmployeeDataStore): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `railway_duty_backup_${mobile}_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Validate and restore JSON backup
 */
export function restoreDatabaseBackup(jsonContent: string): EmployeeDataStore {
  const parsed = JSON.parse(jsonContent);
  if (!parsed.profile || !parsed.profile.mobileNumber) {
    throw new Error('Invalid backup file format: Missing employee profile or mobile number.');
  }
  if (!parsed.dutyEntries) {
    parsed.dutyEntries = {};
  }
  if (!parsed.customSpellDates) {
    parsed.customSpellDates = {};
  }
  return parsed as EmployeeDataStore;
}

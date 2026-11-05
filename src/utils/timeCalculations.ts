/**
 * Railway 24-Hour Time Calculation Utilities
 * 
 * Complies with Indian Railways Running Staff rules:
 * - 24-hour time format: 00:00 to 24:00
 * - 24:00 represents midnight at the end of the calendar day
 * - Crossing midnight: if End Time < Start Time, End Time is on the next calendar day
 * - Internal precision in total minutes
 * - Display format: HH:MM (supports > 24h e.g. 125:30, 098:45)
 */

/**
 * Validates a 24-hour time string (00:00 to 24:00)
 */
export function isValidRailwayTime(timeStr: string): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])$/);
  if (!match) return false;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  // If hours is 24, minutes must be 00
  if (hours === 24 && minutes !== 0) {
    return false;
  }

  return true;
}

/**
 * Standardizes time input to 2-digit HH:MM format
 * e.g. "6:00" -> "06:00", "24:0" -> "24:00"
 */
export function normalizeRailwayTime(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed === '24:00' || trimmed === '24:0') return '24:00';
  
  const parts = trimmed.split(':');
  if (parts.length !== 2) return trimmed;
  
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return trimmed;

  if (h === 24 && m === 0) return '24:00';
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Converts railway time string to total minutes from 00:00 of the day
 * 00:00 -> 0
 * 12:30 -> 750
 * 24:00 -> 1440
 */
export function railwayTimeToMinutes(timeStr: string): number {
  if (!isValidRailwayTime(timeStr)) return 0;
  
  const normalized = normalizeRailwayTime(timeStr);
  if (normalized === '24:00') return 1440;

  const [hoursStr, minutesStr] = normalized.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  return hours * 60 + minutes;
}

/**
 * Calculates duty duration in minutes between start time and end time
 * - Supports 24:00 midnight end
 * - Supports midnight crossing (end time < start time)
 * - Returns 0 if start and end are identical (or empty)
 */
export function calculateDutyMinutes(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  if (!isValidRailwayTime(startTime) || !isValidRailwayTime(endTime)) return 0;

  const startMinutes = railwayTimeToMinutes(startTime);
  const endMinutes = railwayTimeToMinutes(endTime);

  // If equal, 0 minutes
  if (startMinutes === endMinutes) return 0;

  // Case 1: End is on the same calendar day (or up to 24:00)
  if (endMinutes > startMinutes) {
    return endMinutes - startMinutes;
  }

  // Case 2: End time is earlier than start time -> Crosses midnight to next day!
  // Example: Start 18:00 (1080m), End 06:15 (375m)
  // Duration = (1440 - 1080) + 375 = 360 + 375 = 735 minutes (12:15)
  return (1440 - startMinutes) + endMinutes;
}

/**
 * Formats total minutes into standard "HH:MM"
 * e.g. 510 -> "08:30"
 * e.g. 735 -> "12:15"
 */
export function formatMinutesToHHMM(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '00:00';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formats cumulative Spell Total in cumulative "HH:MM" or "HHH:MM" format
 * Never resets after 24 hours!
 * e.g. 5925 minutes -> 98 hrs 45 min -> "098:45"
 * e.g. 7530 minutes -> 125 hrs 30 min -> "125:30"
 * As requested in Section 8:
 * "SPELL 01 Total: 125:30"
 * "SPELL 02 Total: 098:45"
 * "SPELL 03 Total: 112:15"
 */
export function formatSpellTotalHHMM(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '000:00';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const paddedHours = hours < 100 ? String(hours).padStart(3, '0') : String(hours);
  return `${paddedHours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formats human-friendly description e.g. "8 hrs 30 mins"
 */
export function formatDurationHuman(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 mins';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

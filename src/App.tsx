/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Train,
  SlidersHorizontal,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  Spell,
  EmployeeProfile,
  TrainDutyEntry,
  ScheduleConfig,
} from './types/railway';
import {
  getCurrentUserMobile,
  setCurrentUserMobile,
  loadEmployeeData,
  saveEmployeeData,
  getSampleInitialData,
  EmployeeDataStore,
} from './utils/storage';
import {
  generateSpellsForYear,
  applySpellDateChange,
  get14DatesForSpell,
  addDays,
} from './utils/spellCalculations';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { ProfileModal } from './components/ProfileModal';
import { Dashboard } from './components/Dashboard';
import { SpellDetailView } from './components/SpellDetailView';
import { DutyEntryModal } from './components/DutyEntryModal';
import { DateAdjustmentModal } from './components/DateAdjustmentModal';
import { BackupModal } from './components/BackupModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';

export default function App() {
  const [currentUserMobile, setCurrentUserMobileState] = useState<string | null>(null);
  const [dataStore, setDataStore] = useState<EmployeeDataStore | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeSpellId, setActiveSpellId] = useState<string | null>(null);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDateAdjustmentModalOpen, setIsDateAdjustmentModalOpen] = useState(false);
  const [targetAdjustmentSpell, setTargetAdjustmentSpell] = useState<Spell | null>(null);

  const [isDutyModalOpen, setIsDutyModalOpen] = useState(false);
  const [editingDutyEntry, setEditingDutyEntry] = useState<TrainDutyEntry | null>(null);
  const [selectedDayForNewDuty, setSelectedDayForNewDuty] = useState<string>('');

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // 1. Initial Load: Check active session
  useEffect(() => {
    const mobile = getCurrentUserMobile();
    if (mobile) {
      setCurrentUserMobileState(mobile);
      let store = loadEmployeeData(mobile);
      if (!store) {
        store = getSampleInitialData(mobile);
        saveEmployeeData(mobile, store);
      }
      setDataStore(store);
      setSelectedYear(store.scheduleConfig.year || new Date().getFullYear());
    }
  }, []);

  // 2. Persist data store automatically whenever it changes
  useEffect(() => {
    if (currentUserMobile && dataStore) {
      saveEmployeeData(currentUserMobile, dataStore);
    }
  }, [currentUserMobile, dataStore]);

  // Handle Login
  const handleLoginSuccess = (mobile: string) => {
    setCurrentUserMobile(mobile);
    setCurrentUserMobileState(mobile);

    let store = loadEmployeeData(mobile);
    if (!store) {
      store = getSampleInitialData(mobile);
      saveEmployeeData(mobile, store);
    }
    setDataStore(store);
    setSelectedYear(store.scheduleConfig.year || new Date().getFullYear());
  };

  // Handle Logout
  const handleLogout = () => {
    if (window.confirm('Log out of this railway employee session?')) {
      setCurrentUserMobile(null);
      setCurrentUserMobileState(null);
      setDataStore(null);
      setActiveSpellId(null);
    }
  };

  // Generate Spells for the selected year
  const spells = useMemo(() => {
    if (!dataStore) return [];
    const baseStart =
      dataStore.scheduleConfig.year === selectedYear
        ? dataStore.scheduleConfig.scheduleStartDate
        : `${selectedYear}-01-01`;

    return generateSpellsForYear(
      selectedYear,
      baseStart,
      dataStore.customSpellDates
    );
  }, [selectedYear, dataStore]);

  // Active Spell Object
  const activeSpell = useMemo(() => {
    if (!activeSpellId) return null;
    return spells.find((s) => s.id === activeSpellId) || null;
  }, [activeSpellId, spells]);

  // Handle Profile Update
  const handleSaveProfile = (updatedProfile: EmployeeProfile) => {
    if (!dataStore) return;
    setDataStore({
      ...dataStore,
      profile: updatedProfile,
    });
  };

  // Handle Schedule Start Date Change
  const handleChangeScheduleStartDate = (newStartDate: string) => {
    if (!dataStore) return;
    setDataStore({
      ...dataStore,
      scheduleConfig: {
        ...dataStore.scheduleConfig,
        year: selectedYear,
        scheduleStartDate: newStartDate,
      },
      // Reset custom overrides for this year so they flow cleanly from new start
      customSpellDates: {},
    });
  };

  // Handle Spell Date Adjustment (Section 4 Mandatory Rules)
  const handleConfirmSpellDateChange = (
    spellId: string,
    newStartDate: string,
    newEndDate: string
  ) => {
    if (!dataStore) return;

    const currentSpell = spells.find((s) => s.id === spellId);
    if (!currentSpell) return;

    // Shift entry dates if needed to correspond to new window
    const oldDates = get14DatesForSpell(currentSpell);
    const updatedEntries = { ...dataStore.dutyEntries };

    // Calculate day offset
    const [y1, m1, d1] = currentSpell.startDate.split('-').map(Number);
    const [y2, m2, d2] = newStartDate.split('-').map(Number);
    const dayOffset = Math.round(
      (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (1000 * 60 * 60 * 24)
    );

    if (dayOffset !== 0) {
      // Collect entries for this spell's 14 days
      const entriesToMove: { oldDate: string; newDate: string; entry: TrainDutyEntry }[] = [];
      oldDates.forEach((oldD, i) => {
        const newD = addDays(newStartDate, i);
        const dayList = updatedEntries[oldD] || [];
        dayList.forEach((e) => {
          entriesToMove.push({ oldDate: oldD, newDate: newD, entry: e });
        });
      });

      // Clear old dates entries for this spell
      oldDates.forEach((d) => {
        delete updatedEntries[d];
      });

      // Place in new dates
      entriesToMove.forEach(({ newDate, entry }) => {
        if (!updatedEntries[newDate]) updatedEntries[newDate] = [];
        updatedEntries[newDate].push({
          ...entry,
          date: newDate,
        });
      });
    }

    // Apply cascading dates to current spell and subsequent spells
    const updatedCustomDates = applySpellDateChange(
      dataStore.customSpellDates,
      spells,
      spellId,
      newStartDate
    );

    setDataStore({
      ...dataStore,
      customSpellDates: updatedCustomDates,
      dutyEntries: updatedEntries,
    });
  };

  // Handle Add/Edit Train Duty Entry
  const handleSaveDutyEntry = (entryData: Partial<TrainDutyEntry> & { date: string }) => {
    if (!dataStore) return;

    const targetDate = entryData.date;
    const currentList = dataStore.dutyEntries[targetDate] || [];

    let updatedList: TrainDutyEntry[];

    if (entryData.id) {
      // Edit existing entry
      updatedList = currentList.map((e) =>
        e.id === entryData.id ? ({ ...e, ...entryData } as TrainDutyEntry) : e
      );
    } else {
      // Add new entry
      const newEntry: TrainDutyEntry = {
        id: `duty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: targetDate,
        trainNumber: entryData.trainNumber || 'TRAIN',
        routeOrSection: entryData.routeOrSection || '',
        startTime: entryData.startTime || '06:00',
        endTime: entryData.endTime || '14:30',
        dutyMinutes: entryData.dutyMinutes || 0,
        dutyHoursFormatted: entryData.dutyHoursFormatted || '00:00',
        remarks: entryData.remarks || '',
        createdAt: Date.now(),
      };
      updatedList = [...currentList, newEntry];
    }

    setDataStore({
      ...dataStore,
      dutyEntries: {
        ...dataStore.dutyEntries,
        [targetDate]: updatedList,
      },
    });
  };

  // Handle Delete Train Duty Entry
  const handleDeleteDutyEntry = (date: string, entryId: string) => {
    if (!dataStore) return;
    if (window.confirm('Delete this train duty entry?')) {
      const currentList = dataStore.dutyEntries[date] || [];
      const updatedList = currentList.filter((e) => e.id !== entryId);

      const newEntries = { ...dataStore.dutyEntries };
      if (updatedList.length > 0) {
        newEntries[date] = updatedList;
      } else {
        delete newEntries[date];
      }

      setDataStore({
        ...dataStore,
        dutyEntries: newEntries,
      });
    }
  };

  // Open New Duty Modal
  const handleOpenAddDuty = (date: string) => {
    setEditingDutyEntry(null);
    setSelectedDayForNewDuty(date);
    setIsDutyModalOpen(true);
  };

  // Open Edit Duty Modal
  const handleOpenEditDuty = (entry: TrainDutyEntry) => {
    setEditingDutyEntry(entry);
    setSelectedDayForNewDuty(entry.date);
    setIsDutyModalOpen(true);
  };

  // Open Date Adjustment Modal
  const handleOpenDateAdjustment = (spell: Spell) => {
    setTargetAdjustmentSpell(spell);
    setIsDateAdjustmentModalOpen(true);
  };

  // Count existing entries for a spell
  const getExistingEntriesCountForSpell = (spell: Spell | null): number => {
    if (!spell || !dataStore) return 0;
    const dates = get14DatesForSpell(spell);
    let count = 0;
    dates.forEach((d) => {
      count += (dataStore.dutyEntries[d] || []).length;
    });
    return count;
  };

  // If user is not logged in, show Mobile Number Login Screen
  if (!currentUserMobile || !dataStore) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* 1. Header with Employee Profile Banner */}
      <Header
        employee={dataStore.profile}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        {!activeSpell ? (
          /* 3. Main Dashboard: SPELL View */
          <Dashboard
            spells={spells}
            selectedYear={selectedYear}
            scheduleConfig={dataStore.scheduleConfig}
            employee={dataStore.profile}
            dutyEntries={dataStore.dutyEntries}
            onSelectYear={setSelectedYear}
            onSelectSpell={(spell) => setActiveSpellId(spell.id)}
            onEditSpellDates={handleOpenDateAdjustment}
            onChangeScheduleStartDate={handleChangeScheduleStartDate}
          />
        ) : (
          /* 5. Spell Duty Entry Table View */
          <SpellDetailView
            spell={activeSpell}
            employee={dataStore.profile}
            dutyEntries={dataStore.dutyEntries}
            onBackToDashboard={() => setActiveSpellId(null)}
            onOpenDateAdjustment={() => handleOpenDateAdjustment(activeSpell)}
            onAddEntry={handleOpenAddDuty}
            onEditEntry={handleOpenEditDuty}
            onDeleteEntry={handleDeleteDutyEntry}
            onOpenPdfPreview={() => setIsPdfModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print">
        <p>
          Indian Railways Running Staff Duty Records · 14-Day Consecutive Spells ·
          24-Hour Time Format
        </p>
      </footer>

      {/* Modals */}
      {/* Edit Employee Profile Modal */}
      <ProfileModal
        profile={dataStore.profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Add / Edit Train Duty Modal */}
      {activeSpell && (
        <DutyEntryModal
          isOpen={isDutyModalOpen}
          onClose={() => setIsDutyModalOpen(false)}
          onSave={handleSaveDutyEntry}
          initialEntry={editingDutyEntry}
          spellDates={get14DatesForSpell(activeSpell)}
          preselectedDate={selectedDayForNewDuty}
        />
      )}

      {/* Edit Spell Dates Modal (Always 14 Consecutive Days) */}
      {targetAdjustmentSpell && (
        <DateAdjustmentModal
          spell={targetAdjustmentSpell}
          isOpen={isDateAdjustmentModalOpen}
          existingEntriesCount={getExistingEntriesCountForSpell(targetAdjustmentSpell)}
          onClose={() => {
            setIsDateAdjustmentModalOpen(false);
            setTargetAdjustmentSpell(null);
          }}
          onConfirmDateChange={handleConfirmSpellDateChange}
        />
      )}

      {/* Official PDF Preview & Print Modal */}
      {activeSpell && (
        <PdfPreviewModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          spell={activeSpell}
          employee={dataStore.profile}
          dutyEntries={dataStore.dutyEntries}
        />
      )}

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        dataStore={dataStore}
        onDataRestored={(restored) => setDataStore(restored)}
        onResetSample={() => {
          const sample = getSampleInitialData(currentUserMobile);
          setDataStore(sample);
          saveEmployeeData(currentUserMobile, sample);
        }}
      />
    </div>
  );
}

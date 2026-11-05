import React, { useState, useRef } from 'react';
import { X, Download, Upload, RotateCcw, Database, Check, AlertCircle } from 'lucide-react';
import { EmployeeDataStore, exportDatabaseBackup, restoreDatabaseBackup } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataStore: EmployeeDataStore;
  onDataRestored: (newData: EmployeeDataStore) => void;
  onResetSample: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  dataStore,
  onDataRestored,
  onResetSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      exportDatabaseBackup(dataStore.profile.mobileNumber, dataStore);
      setSuccessMessage('Backup downloaded successfully as JSON file!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Export failed.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restored = restoreDatabaseBackup(content);
        onDataRestored(restored);
        setSuccessMessage('Data successfully restored from backup file!');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to restore backup file. Invalid structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset all duty records and restore initial railway sample data?')) {
      onResetSample();
      setSuccessMessage('Sample running staff data loaded!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B3C68] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold tracking-tight">
              Data Backup & Storage Management
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            All duty records and employee settings are saved locally on this device for mobile{' '}
            <span className="font-mono font-bold text-slate-900">
              +91 {dataStore.profile.mobileNumber}
            </span>
            . You can export a full backup or transfer records to another device.
          </p>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2">
            {/* Download Backup */}
            <button
              onClick={handleExport}
              className="w-full p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all flex items-center gap-3.5 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#0B3C68] group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Export & Download Backup (.JSON)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save all spell dates, train duties, and profile to a safe file.
                </p>
              </div>
            </button>

            {/* Restore Backup */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center gap-3.5 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Restore Backup from File
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload an existing JSON backup to restore previous spells.
                </p>
              </div>
            </button>

            {/* Reset to Sample Data */}
            <button
              onClick={handleReset}
              className="w-full p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-xl transition-all flex items-center gap-3.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-800">
                  Reload Sample Running Staff Data
                </h3>
                <p className="text-[11px] text-slate-500">
                  Populate realistic Rajdhani, Shatabdi, midnight duties, and 24:00 examples.
                </p>
              </div>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

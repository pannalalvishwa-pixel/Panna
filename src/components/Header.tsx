import React from 'react';
import { Train, UserCheck, Edit3, Database, LogOut, KeyRound } from 'lucide-react';
import { EmployeeProfile } from '../types/railway';

interface HeaderProps {
  employee: EmployeeProfile;
  onEditProfile: () => void;
  onOpenBackup: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  employee,
  onEditProfile,
  onOpenBackup,
  onOpenChangePassword,
  onLogout,
}) => {
  return (
    <header className="bg-[#0B3C68] text-white shadow-md border-b border-blue-950 sticky top-0 z-30">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand / Emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <Train className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-amber-300 uppercase">
                Indian Railways
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="hidden sm:inline-block text-[11px] text-blue-200">
                Running Staff Duty Portal
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Spell & Duty Hours Management
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenBackup}
            title="Backup & Restore Data"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Database className="w-4 h-4 text-blue-200" />
            <span className="hidden md:inline">Data Backup</span>
          </button>

          <button
            onClick={onOpenChangePassword}
            title="Change Login Password"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-emerald-200 hover:text-emerald-100 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">Password</span>
          </button>

          <button
            onClick={onEditProfile}
            title="Edit Employee Profile"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-amber-200 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>

          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-600/40 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-rose-300" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Prominent Employee Profile Strip as requested in Section 2 & 11 */}
      <div className="bg-[#072c4e] border-t border-blue-900/60 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400/30">
              <UserCheck className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wide mr-2">
                {employee.name}
              </span>
              <span className="text-amber-300 font-semibold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded text-[11px]">
                {employee.designation}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-blue-200">
            <div className="bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15 flex items-center gap-1">
              <span className="text-amber-300 font-bold text-[11px]">HQ:</span>
              <span className="text-white font-bold text-xs">{employee.headquarters || 'SRC'}</span>
            </div>
            <div className="bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15 flex items-center gap-1">
              <span className="text-amber-300 font-bold text-[11px]">Division:</span>
              <span className="text-white font-bold text-xs">{employee.zoneDivision || 'SER'}</span>
            </div>
            <div className="hidden md:block text-slate-300 text-xs">
              <span className="text-blue-300 mr-1">Mobile:</span>
              <span className="text-white font-mono">{employee.mobileNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

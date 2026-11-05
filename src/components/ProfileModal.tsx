import React, { useState } from 'react';
import { X, User, Briefcase, MapPin, Save, Phone, Hash } from 'lucide-react';
import { EmployeeProfile } from '../types/railway';

interface ProfileModalProps {
  profile: EmployeeProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: EmployeeProfile) => void;
}

const COMMON_DESIGNATIONS = [
  'Tech I',
  'Tech II',
  'Tech III',
  'Sr. Technician (Sr. Tech)',
  'Junior Engineer (JE)',
  'Senior Section Engineer (SSE)',
  'Loco Pilot (Mail / Express)',
  'Loco Pilot (Passenger)',
  'Loco Pilot (Goods)',
  'Sr. Assistant Loco Pilot (Sr. ALP)',
  'Assistant Loco Pilot (ALP)',
  'Train Manager / Guard',
  'Station Master',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [designation, setDesignation] = useState(profile.designation);
  const [headquarters, setHeadquarters] = useState(profile.headquarters);
  const [employeeId, setEmployeeId] = useState(profile.employeeId || '');
  const [zoneDivision, setZoneDivision] = useState(profile.zoneDivision || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      name: name.trim() || 'Railway Employee',
      designation: designation.trim() || 'Loco Pilot',
      headquarters: headquarters.trim() || 'Central',
      employeeId: employeeId.trim(),
      zoneDivision: zoneDivision.trim(),
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B3C68] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold tracking-tight">
              Edit Employee Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mobile (Read-only ID) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Mobile Number (Registered)
            </label>
            <input
              type="text"
              readOnly
              value={profile.mobileNumber}
              className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-sm font-mono cursor-not-allowed"
            />
          </div>

          {/* 1. Employee Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0B3C68]" /> 1. Employee Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pannalal Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-medium"
            />
          </div>

          {/* 2. Designation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#0B3C68]" /> 2. Designation *
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Tech I"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-medium mb-2"
            />

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_DESIGNATIONS.slice(0, 6).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDesignation(d)}
                  className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0B3C68] border border-slate-200 rounded-lg text-slate-600 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Headquarters */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0B3C68]" /> 3. Headquarters (HQ) *
            </label>
            <input
              type="text"
              required
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              placeholder="e.g. SRC (Santragachi)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0B3C68] focus:ring-2 focus:ring-[#0B3C68]/20 text-sm font-medium"
            />
          </div>

          {/* Optional Railway ID & Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> P.F. / Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. SER/TECH/10842"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Zone / Division
              </label>
              <input
                type="text"
                value={zoneDivision}
                onChange={(e) => setZoneDivision(e.target.value)}
                placeholder="e.g. SER (South Eastern Railway)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0B3C68] hover:bg-[#082a4a] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

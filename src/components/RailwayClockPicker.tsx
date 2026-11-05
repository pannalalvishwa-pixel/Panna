import React, { useState, useEffect } from 'react';
import { Clock, Check, ChevronRight } from 'lucide-react';

interface RailwayClockPickerProps {
  label: string;
  value: string; // HH:MM
  onChange: (val: string) => void;
  allow2400?: boolean; // true for ending time
  quickPreset?: string; // e.g. "00:00" for start or "24:00" for end
  quickPresetLabel?: string;
}

export const RailwayClockPicker: React.FC<RailwayClockPickerProps> = ({
  label,
  value,
  onChange,
  allow2400 = false,
  quickPreset,
  quickPresetLabel,
}) => {
  const [activeUnit, setActiveUnit] = useState<'hour' | 'minute'>('hour');

  // Parse current value
  const parseCurrent = () => {
    if (value === '24:00') return { h: 24, m: 0 };
    const parts = value.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return { h: Math.min(allow2400 ? 24 : 23, Math.max(0, h)), m: Math.min(59, Math.max(0, m)) };
  };

  const { h: currentH, m: currentM } = parseCurrent();

  const handleSelectHour = (hour: number) => {
    if (hour === 24 && allow2400) {
      onChange('24:00');
      return;
    }
    const formattedH = String(hour).padStart(2, '0');
    const formattedM = String(currentH === 24 ? 0 : currentM).padStart(2, '0');
    onChange(`${formattedH}:${formattedM}`);
    // Auto-advance to minute selection like native Android clock
    setActiveUnit('minute');
  };

  const handleSelectMinute = (minute: number) => {
    if (currentH === 24) {
      // 24:00 can only have 00 minutes
      onChange('24:00');
      return;
    }
    const formattedH = String(currentH).padStart(2, '0');
    const formattedM = String(minute).padStart(2, '0');
    onChange(`${formattedH}:${formattedM}`);
  };

  // 12-hour positions for circular rendering
  // Angle for 1 to 12 is (i * 30 - 90) deg
  const getClockCoordinates = (index: number, total: number, radiusPercent: number) => {
    // 0 is top (12 o'clock)
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = 50 + radiusPercent * Math.cos(angle);
    const y = 50 + radiusPercent * Math.sin(angle);
    return { x, y, angleDeg: (angle * 180) / Math.PI + 90 };
  };

  // Clock hand angle
  const getHandAngle = () => {
    if (activeUnit === 'hour') {
      const h12 = currentH % 12;
      return h12 * 30; // 360 / 12 = 30 deg per hour
    } else {
      return currentM * 6; // 360 / 60 = 6 deg per minute
    }
  };

  const handAngle = getHandAngle();
  const isOuterHour = currentH >= 12 && currentH < 24;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
      {/* Header & Digital Clock Display */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#0B3C68]" /> {label}
        </label>

        {/* Digital Time Display (Interactive: Tap HH or MM to switch mode) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveUnit('hour')}
            className={`px-2.5 py-1 rounded-lg font-mono text-base font-extrabold transition-all ${
              activeUnit === 'hour'
                ? 'bg-[#0B3C68] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {currentH === 24 ? '24' : String(currentH).padStart(2, '0')}
          </button>
          <span className="font-mono text-base font-bold text-slate-400">:</span>
          <button
            type="button"
            onClick={() => {
              if (currentH === 24) return;
              setActiveUnit('minute');
            }}
            disabled={currentH === 24}
            className={`px-2.5 py-1 rounded-lg font-mono text-base font-extrabold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              activeUnit === 'minute'
                ? 'bg-[#0B3C68] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {currentH === 24 ? '00' : String(currentM).padStart(2, '0')}
          </button>
        </div>
      </div>

      {/* Prominent Quick Shortcut Button (e.g. 00:00 or 24:00) */}
      {quickPreset && (
        <button
          type="button"
          onClick={() => {
            onChange(quickPreset);
            if (quickPreset === '24:00') {
              setActiveUnit('hour');
            }
          }}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs border active:scale-98 ${
            value === quickPreset
              ? quickPreset === '24:00'
                ? 'bg-amber-500 text-blue-950 border-amber-600 ring-2 ring-amber-400/30'
                : 'bg-[#0B3C68] text-white border-[#0B3C68] ring-2 ring-blue-400/30'
              : quickPreset === '24:00'
              ? 'bg-amber-100/80 hover:bg-amber-200 text-amber-950 border-amber-300'
              : 'bg-blue-50/80 hover:bg-blue-100 text-[#0B3C68] border-blue-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{quickPresetLabel || `Select ${quickPreset}`}</span>
          {value === quickPreset && <Check className="w-3.5 h-3.5 ml-auto" />}
        </button>
      )}

      {/* Mode Selector Pill (Hour vs Minute) */}
      <div className="flex items-center justify-between text-xs bg-slate-50 p-1 rounded-xl border border-slate-200">
        <span className="text-[11px] font-semibold text-slate-500 pl-2">
          Select on clock:
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveUnit('hour')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
              activeUnit === 'hour'
                ? 'bg-white text-[#0B3C68] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hour (00–{allow2400 ? '24' : '23'})
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentH === 24) return;
              setActiveUnit('minute');
            }}
            disabled={currentH === 24}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              activeUnit === 'minute'
                ? 'bg-white text-[#0B3C68] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minute (00–59)
          </button>
        </div>
      </div>

      {/* INTERACTIVE CIRCULAR ANALOG CLOCK FACE */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-full bg-slate-100/90 border-4 border-slate-200 shadow-inner p-2 select-none">
        {/* Center Pivot Point */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0B3C68] z-20 shadow-xs border-2 border-white" />

        {/* Animated Clock Pointer Hand */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom z-10 transition-transform duration-200 ease-out pointer-events-none"
          style={{
            transform: `translate(-50%, -100%) rotate(${handAngle}deg)`,
            height:
              activeUnit === 'hour'
                ? isOuterHour
                  ? '38%'
                  : '26%'
                : '38%',
            width: '2px',
          }}
        >
          <div className="w-full h-full bg-[#0B3C68] relative">
            {/* Hand End Circle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0B3C68]/20 border border-[#0B3C68]/40" />
          </div>
        </div>

        {/* ================= CLOCK FACE: HOUR VIEW ================= */}
        {activeUnit === 'hour' && (
          <div className="relative w-full h-full">
            {/* Outer Ring: 12 PM - 23 PM (and 24/00) */}
            {[
              { val: 12, label: '12' },
              { val: 13, label: '13' },
              { val: 14, label: '14' },
              { val: 15, label: '15' },
              { val: 16, label: '16' },
              { val: 17, label: '17' },
              { val: 18, label: '18' },
              { val: 19, label: '19' },
              { val: 20, label: '20' },
              { val: 21, label: '21' },
              { val: 22, label: '22' },
              { val: 23, label: '23' },
            ].map(({ val, label }, idx) => {
              const { x, y } = getClockCoordinates(idx, 12, 40);
              const isSelected = currentH === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectHour(val)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full font-mono font-bold text-xs transition-transform active:scale-90 flex items-center justify-center z-15 ${
                    isSelected
                      ? 'bg-[#0B3C68] text-white shadow-md ring-2 ring-blue-300'
                      : 'text-slate-800 hover:bg-blue-100 hover:text-[#0B3C68]'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {/* Inner Ring: 00 AM - 11 AM */}
            {[
              { val: 0, label: '00' },
              { val: 1, label: '01' },
              { val: 2, label: '02' },
              { val: 3, label: '03' },
              { val: 4, label: '04' },
              { val: 5, label: '05' },
              { val: 6, label: '06' },
              { val: 7, label: '07' },
              { val: 8, label: '08' },
              { val: 9, label: '09' },
              { val: 10, label: '10' },
              { val: 11, label: '11' },
            ].map(({ val, label }, idx) => {
              const { x, y } = getClockCoordinates(idx, 12, 24);
              const isSelected = currentH === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectHour(val)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full font-mono font-semibold text-[11px] transition-transform active:scale-90 flex items-center justify-center z-15 ${
                    isSelected
                      ? 'bg-[#0B3C68] text-white shadow-md ring-2 ring-blue-300'
                      : 'text-slate-600 hover:bg-blue-100 hover:text-[#0B3C68]'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {/* Special 24:00 badge on top if allowed */}
            {allow2400 && (
              <button
                type="button"
                onClick={() => handleSelectHour(24)}
                className={`absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-mono text-[10px] font-black z-30 shadow-xs border transition-transform active:scale-95 ${
                  currentH === 24
                    ? 'bg-amber-500 text-blue-950 border-amber-600 ring-2 ring-amber-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                }`}
              >
                24:00
              </button>
            )}
          </div>
        )}

        {/* ================= CLOCK FACE: MINUTE VIEW ================= */}
        {activeUnit === 'minute' && (
          <div className="relative w-full h-full">
            {/* 12 Minute Positions: 00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55 */}
            {[
              0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
            ].map((minVal, idx) => {
              const { x, y } = getClockCoordinates(idx, 12, 38);
              const isSelected = currentM === minVal;
              return (
                <button
                  key={minVal}
                  type="button"
                  onClick={() => handleSelectMinute(minVal)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full font-mono font-bold text-xs transition-transform active:scale-90 flex items-center justify-center z-15 ${
                    isSelected
                      ? 'bg-[#0B3C68] text-white shadow-md ring-2 ring-blue-300'
                      : 'text-slate-800 hover:bg-blue-100 hover:text-[#0B3C68]'
                  }`}
                >
                  {String(minVal).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Minute Quick Steppers & Common Railway Intervals */}
      {activeUnit === 'minute' && currentH !== 24 && (
        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Fine Tune:</span>
          <div className="flex gap-1">
            {[-5, -1, +1, +5].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => {
                  const newMin = (currentM + delta + 60) % 60;
                  handleSelectMinute(newMin);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-mono font-medium text-[11px]"
              >
                {delta > 0 ? `+${delta}m` : `${delta}m`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Common Quick Railway Shift Presets */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
          Quick Railway Duty Shifts:
        </span>
        <div className="flex flex-wrap gap-1">
          {(allow2400
            ? ['24:00', '06:00', '06:15', '07:00', '14:30', '18:00', '22:00']
            : ['00:00', '06:00', '08:00', '14:00', '18:00', '22:00', '23:00']
          ).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset);
                if (preset === '24:00') {
                  setActiveUnit('hour');
                }
              }}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono transition-colors ${
                value === preset
                  ? preset === '24:00'
                    ? 'bg-amber-500 text-blue-950 border-amber-600 font-black'
                    : 'bg-[#0B3C68] text-white border-[#0B3C68] font-bold'
                  : preset === '24:00'
                  ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#0B3C68]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

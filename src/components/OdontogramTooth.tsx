import React from 'react';
import { ToothCondition, ToothStatus, ToothSurface } from '../types/dental';
import { getToothStatusDetails } from '../utils/formatters';

interface OdontogramToothProps {
  toothNumber: number;
  condition?: ToothCondition;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick: (toothNumber: number) => void;
  isMaxillary?: boolean; // upper jaw vs lower jaw
}

export const OdontogramTooth: React.FC<OdontogramToothProps> = ({
  toothNumber,
  condition,
  isSelected = false,
  isLocked = false,
  onClick,
  isMaxillary = true,
}) => {
  const status: ToothStatus = condition?.status || 'healthy';
  const surfaces: ToothSurface[] = condition?.surfaces || [];
  const statusDetails = getToothStatusDetails(status);

  const isSurfaceActive = (surf: ToothSurface) => surfaces.includes(surf);

  // Surface fill logic: if tooth is caries or restored and specific surfaces selected
  const getSurfaceFill = (surf: ToothSurface) => {
    if (status === 'caries') {
      return isSurfaceActive(surf) || surfaces.length === 0 ? '#f43f5e' : '#1e293b';
    }
    if (status === 'restored') {
      return isSurfaceActive(surf) || surfaces.length === 0 ? '#38bdf8' : '#1e293b';
    }
    if (status === 'endo') return '#f59e0b';
    if (status === 'crown') return '#eab308';
    if (status === 'implant') return '#06b6d4';
    if (status === 'to_extract') return '#ef4444';
    if (status === 'missing') return '#334155';
    return '#1e293b'; // healthy
  };

  return (
    <div
      onClick={() => !isLocked && onClick(toothNumber)}
      title={`Dent ${toothNumber}: ${statusDetails.label} ${condition?.notes ? `(${condition.notes})` : ''}`}
      className={`relative group flex flex-col items-center transition-all duration-150 ${
        isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-105'
      }`}
    >
      {/* Upper tooth number indicator */}
      {isMaxillary && (
        <span
          className={`text-[11px] font-bold tracking-tight mb-1 transition-colors ${
            isSelected
              ? 'text-emerald-400 font-extrabold'
              : status !== 'healthy'
              ? statusDetails.color
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          {toothNumber}
        </span>
      )}

      {/* Anatomical 5-surfaces SVG Graphic */}
      <div
        className={`relative w-8 h-8 rounded-md p-0.5 border transition-all ${
          isSelected
            ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/20'
            : status !== 'healthy'
            ? 'border-slate-600 bg-slate-900/60'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500'
        }`}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm">
          {/* Top polygon (Vestibular or Palatal/Lingual) */}
          <polygon
            points="0,0 40,0 30,10 10,10"
            fill={getSurfaceFill('V')}
            stroke="#475569"
            strokeWidth="0.8"
            className="transition-colors"
          />

          {/* Right polygon (Distal / Mesial) */}
          <polygon
            points="40,0 40,40 30,30 30,10"
            fill={getSurfaceFill('D')}
            stroke="#475569"
            strokeWidth="0.8"
            className="transition-colors"
          />

          {/* Bottom polygon */}
          <polygon
            points="40,40 0,40 10,30 30,30"
            fill={getSurfaceFill('L')}
            stroke="#475569"
            strokeWidth="0.8"
            className="transition-colors"
          />

          {/* Left polygon */}
          <polygon
            points="0,0 10,10 10,30 0,40"
            fill={getSurfaceFill('M')}
            stroke="#475569"
            strokeWidth="0.8"
            className="transition-colors"
          />

          {/* Center (Occlusal / Incisal) */}
          <rect
            x="10"
            y="10"
            width="20"
            height="20"
            fill={getSurfaceFill('O')}
            stroke="#475569"
            strokeWidth="0.8"
            className="transition-colors"
          />

          {/* Special overlay indicators */}
          {status === 'missing' && (
            <g stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="34" y2="34" />
              <line x1="34" y1="6" x2="6" y2="34" />
            </g>
          )}

          {status === 'to_extract' && (
            <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
              <line x1="6" y1="6" x2="34" y2="34" />
            </g>
          )}

          {status === 'crown' && (
            <circle cx="20" cy="20" r="5" fill="#facc15" stroke="#854d0e" strokeWidth="1" />
          )}

          {status === 'endo' && (
            <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
              <line x1="20" y1="7" x2="20" y2="33" />
            </g>
          )}

          {status === 'implant' && (
            <g stroke="#06b6d4" strokeWidth="2" strokeLinecap="round">
              <line x1="14" y1="20" x2="26" y2="20" />
              <line x1="20" y1="12" x2="20" y2="28" />
            </g>
          )}
        </svg>

        {/* Small badge icon if notes exist */}
        {condition?.notes && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
        )}
      </div>

      {/* Lower tooth number indicator */}
      {!isMaxillary && (
        <span
          className={`text-[11px] font-bold tracking-tight mt-1 transition-colors ${
            isSelected
              ? 'text-emerald-400 font-extrabold'
              : status !== 'healthy'
              ? statusDetails.color
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          {toothNumber}
        </span>
      )}
    </div>
  );
};

import React from "react";

export const PHASE_COLORS: Record<
  number,
  { bg: string; text: string; border: string; accent: string }
> = {
  1: { bg: "bg-blue-50",    text: "text-blue-600",   border: "border-blue-200",   accent: "border-blue-500"   },
  2: { bg: "bg-violet-50",  text: "text-violet-600", border: "border-violet-200", accent: "border-violet-500" },
  3: { bg: "bg-teal-50",    text: "text-teal-600",   border: "border-teal-200",   accent: "border-teal-500"   },
};

export const getPhaseColor = (phase?: number) =>
  phase ? (PHASE_COLORS[phase] ?? PHASE_COLORS[1]) : null;

interface PhaseBadgeProps {
  phase?: number;
}

export const PhaseBadge = ({ phase }: PhaseBadgeProps) => {
  if (!phase) return null;
  const c = getPhaseColor(phase)!;
  return (
    <span
      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${c.bg} ${c.text} ${c.border}`}
    >
      Phase {phase}
    </span>
  );
};
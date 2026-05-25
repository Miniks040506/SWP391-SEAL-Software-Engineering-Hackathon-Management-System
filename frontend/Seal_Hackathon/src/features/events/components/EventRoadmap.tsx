import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { roadmapStyles as s } from './EventRoadmap.styles';

const BASE_STEPS = [
  { phase: 'Phase 1', title: 'Technical Proposal' },
  { phase: 'Phase 2', title: 'Agile Coding Marathon' },
  { phase: 'Phase 3', title: 'Grand Finale Pitch' },
];

const TOTAL = BASE_STEPS.length;

interface EventRoadmapProps {
  /* 1-based index of the active phase (1 = Phase 1 in progress). */
  currentPhase: number;
  isEnded: boolean;
}

export const EventRoadmap = ({ currentPhase, isEnded }: EventRoadmapProps) => {
  const steps = BASE_STEPS.map((step, i) => ({ ...step, active: i < currentPhase }));

  /**
   * Blue track height as a ratio of the full track.
   * Phase 1 → 0 (only the first dot is lit, no connecting line yet).
   * Phase 2 → 0.5 (line reaches the second dot).
   */
  const blueRatio = Math.max(0, (currentPhase - 1) / (TOTAL - 1));

  return (
    <section className={s.section}>
      <h2 className={s.heading}>
        <AccessTimeIcon style={{ fontSize: 16 }} className="text-blue-500" />
        Event Roadmap
      </h2>

      <div className={s.timelineWrapper}>
        <div className={s.trackGray} />

        {blueRatio > 0 && (
          <div className={s.trackBlue} style={{ height: `calc(${blueRatio} * (100% - 8px))` }} />
        )}

        <div className={s.stepList}>
          {steps.map((step, i) => {
            const isCurrent = i === currentPhase - 1 && !isEnded;
            return (
              <div key={step.phase} className={s.stepRow}>
                <div className={s.dot(step.active, isCurrent)} />
                <div>
                  <span className={s.phaseLabel(step.active)}>
                    {step.phase}
                    {isCurrent && <span className={s.inProgressBadge}>IN PROGRESS</span>}
                  </span>
                  <h4 className={s.stepTitle(step.active)}>{step.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

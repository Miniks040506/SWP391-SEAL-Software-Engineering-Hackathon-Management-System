import React from "react";
import { timelineStyles as s } from "./ProgressTimeline.styles";

export interface TimelineStep {
  label: string;
  title: string;
  duration?: string;
}

interface ProgressTimelineProps {
  title?: string;
  icon?: React.ReactNode;
  steps: TimelineStep[];
  currentPhase: number;
  isEnded: boolean;
  showCardWrapper?: boolean;
}

export const ProgressTimeline = ({
  title,
  icon,
  steps,
  currentPhase,
  isEnded,
  showCardWrapper = true,
}: ProgressTimelineProps) => {
  const totalSteps = steps.length;

  const renderContent = () => (
    <>
      {title && (
        <h2 className={s.heading}>
          {icon}
          {title}
        </h2>
      )}

      <div className={s.timelineWrapper}>
        <div className={s.stepList}>
          {steps.map((step, i) => {
            const stepNumber = i + 1;
            const isCompleted = isEnded || stepNumber < currentPhase;
            const isCurrent = !isEnded && stepNumber === currentPhase;
            const active = isCompleted || isCurrent;
            const isLast = i === totalSteps - 1;
            const isSegmentBlue = isEnded || stepNumber < currentPhase;

            return (
              <div key={i} className={s.stepRow}>
                {!isLast && (
                  <div className={s.trackContainer}>
                    {isSegmentBlue && <div className={s.trackBlueInner} />}
                  </div>
                )}

                <div className={s.dot(active, isCurrent)} />

                <div className={s.contentRow}>
                  <div>
                    <span className={s.phaseLabel(active)}>
                      {step.label}
                      {isCurrent && (
                        <span className={s.inProgressBadge}>LIVE NOW</span>
                      )}
                    </span>
                    <h4 className={s.stepTitle(active)}>{step.title}</h4>
                  </div>

                  {step.duration && (
                    <div className={s.durationBadge}>{step.duration}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return showCardWrapper ? (
    <section className={s.section}>{renderContent()}</section>
  ) : (
    <div className="p-2">{renderContent()}</div>
  );
};

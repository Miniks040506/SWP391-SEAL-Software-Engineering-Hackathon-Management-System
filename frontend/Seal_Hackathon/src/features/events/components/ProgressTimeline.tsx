import type { ReactNode } from "react";
import { timelineStyles as s } from "@/features/events/components/ProgressTimeline.styles";

export type TimelineStep = {
  label: string;
  title: string;
  duration?: string;
};

type ProgressTimelineProps = {
  title?: string;
  icon?: ReactNode;
  steps: TimelineStep[];
  currentPhase: number;
  isEnded: boolean;
  showCardWrapper?: boolean;
};

export function ProgressTimeline({
  title,
  icon,
  steps,
  currentPhase,
  isEnded,
  showCardWrapper = true,
}: ProgressTimelineProps) {
  const totalSteps = steps.length;

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 text-sm font-semibold text-gray-400">
        No rounds have been published yet.
      </div>
    );
  }

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
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = isEnded || stepNumber < currentPhase;
            const isCurrent = !isEnded && stepNumber === currentPhase;
            const active = isCompleted || isCurrent;
            const isLast = index === totalSteps - 1;
            const isSegmentBlue = isEnded || stepNumber < currentPhase;

            return (
              <div key={`${step.label}-${step.title}`} className={s.stepRow}>
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
}
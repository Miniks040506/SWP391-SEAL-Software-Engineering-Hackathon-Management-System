import CheckIcon from "@mui/icons-material/Check";

type StepItem = {
  label: string;
};

type Props = {
  title?: string;
  currentStep: number;
  steps: StepItem[];
};

export function StepProgress({
  title = "Registration Progress",
  currentStep,
  steps,
}: Props) {
  const safeStep = Math.min(Math.max(currentStep, 1), steps.length);

  const isLineActive = (lineIndex: number) => {
    // 0 = line before step 1
    // 1 = line step 1 -> step 2
    // 2 = line step 2 -> step 3
    // 3 = line after step 3
    if (lineIndex === 0) return safeStep >= 1;
    if (lineIndex === 1) return safeStep >= 2;
    if (lineIndex === 2) return safeStep >= 3;
    return safeStep >= 3;
  };

  const renderCircle = (stepNumber: number) => {
    const isDone = stepNumber < safeStep;
    const isActive = stepNumber === safeStep;
    const isBlue = isDone || isActive;

    return (
      <div
        className={[
          "mx-auto flex h-9 w-9 items-center justify-center rounded-full",
          "text-sm font-extrabold transition-all",
          isBlue
            ? "bg-blue-500 text-white shadow-[0_0_0_6px_rgba(59,130,246,0.12)]"
            : "bg-slate-900 text-white",
          isActive ? "scale-105" : "",
        ].join(" ")}
      >
        {isDone ? <CheckIcon sx={{ fontSize: 18 }} /> : stepNumber}
      </div>
    );
  };

  return (
    <section className="mx-auto mb-10 w-full max-w-155">
      <h2 className="mb-8 text-sm font-extrabold uppercase tracking-[0.35em] text-slate-700">
        {title}
      </h2>

      <div className="grid grid-cols-[24px_36px_1fr_36px_1fr_36px_24px] items-center">
        <div
          className={[
            "h-0.75",
            isLineActive(0) ? "bg-blue-500" : "bg-slate-800",
          ].join(" ")}
        />

        {renderCircle(1)}

        <div
          className={[
            "h-0.75",
            isLineActive(1) ? "bg-blue-500" : "bg-slate-800",
          ].join(" ")}
        />

        {renderCircle(2)}

        <div
          className={[
            "h-0.75",
            isLineActive(2) ? "bg-blue-500" : "bg-slate-800",
          ].join(" ")}
        />

        {renderCircle(3)}

        <div
          className={[
            "h-0.75",
            isLineActive(3) ? "bg-blue-500" : "bg-slate-800",
          ].join(" ")}
        />
      </div>

      <div className="mt-4 grid grid-cols-3">
        {steps.slice(0, 3).map((step, index) => {
          const stepNumber = index + 1;
          const isBlue = stepNumber <= safeStep;

          return (
            <div
              key={step.label}
              className={[
                "text-xs font-extrabold uppercase tracking-[0.2em]",
                index === 0
                  ? "text-left"
                  : index === 1
                    ? "text-center"
                    : "text-right",
                isBlue ? "text-blue-500" : "text-slate-700",
              ].join(" ")}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
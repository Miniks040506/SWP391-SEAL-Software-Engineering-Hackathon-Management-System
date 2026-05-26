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
  title = "Progress",
  currentStep,
  steps,
}: Props) {
  const safeStep = Math.min(Math.max(currentStep, 1), steps.length);

  const gridTemplateColumns = [
    "24px",
    ...steps.flatMap((_, index) =>
      index < steps.length - 1 ? ["36px", "1fr"] : ["36px"],
    ),
    "24px",
  ].join(" ");

  const isLineActive = (lineIndex: number) => {
    if (lineIndex === 0) return safeStep >= 1;
    if (lineIndex >= steps.length) return safeStep >= steps.length;
    return safeStep >= lineIndex + 1;
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

      <div className="grid items-center" style={{ gridTemplateColumns }}>
        <div
          className={[
            "h-0.75",
            isLineActive(0) ? "bg-blue-500" : "bg-slate-800",
          ].join(" ")}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;

          return (
            <div key={step.label} className="contents">
              {renderCircle(stepNumber)}

              {index < steps.length - 1 && (
                <div
                  className={[
                    "h-0.75",
                    isLineActive(index + 1) ? "bg-blue-500" : "bg-slate-800",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}

        <div
          className={[
            "h-0.75",
            isLineActive(steps.length) ? "bg-blue-500" : "bg-slate-800",
          ].join(" ")}
        />
      </div>

      <div
        className="mt-4 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isBlue = stepNumber <= safeStep;

          return (
            <div
              key={step.label}
              className={[
                "text-xs font-extrabold uppercase tracking-[0.16em]",
                index === 0
                  ? "text-left"
                  : index === steps.length - 1
                    ? "text-right"
                    : "text-center",
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

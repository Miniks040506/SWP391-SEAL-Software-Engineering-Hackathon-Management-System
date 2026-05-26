import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AuthCard({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
}: Props) {
  return (
    <section
      className={[
        "w-full max-w-155",
        "rounded-2xl border border-slate-200 bg-white",
        "border-l-[5px] border-l-blue-500",
        "px-10 py-10 shadow-[0_8px_26px_rgba(15,23,42,0.08)]",
        className,
      ].join(" ")}
    >
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h1>

      {description && (
        <p className="mt-4 max-w-130 text-base leading-7 text-slate-600">
          {description}
        </p>
      )}

      <div className={["mt-8", contentClassName].join(" ")}>{children}</div>
    </section>
  );
}

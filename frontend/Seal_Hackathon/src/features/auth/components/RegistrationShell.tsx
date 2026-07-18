import CheckIcon from "@mui/icons-material/Check";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useThemeStore } from "@/stores/themeStore";

const STEPS = [
  {
    number: 1,
    label: "Registration",
    description: "Tell us about you and your studies.",
    icon: <PersonAddAltOutlinedIcon sx={{ fontSize: 20 }} />,
  },
  {
    number: 2,
    label: "Verification",
    description: "Enter the 6-digit code we email you.",
    icon: <MarkEmailReadOutlinedIcon sx={{ fontSize: 20 }} />,
  },
  {
    number: 3,
    label: "Success",
    description: "Sign in and start competing.",
    icon: <VerifiedOutlinedIcon sx={{ fontSize: 20 }} />,
  },
];

type Props = {
  currentStep: 1 | 2 | 3;
  children: ReactNode;
};

export function RegistrationShell({ currentStep, children }: Props) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <div className="relative min-h-dvh bg-white font-sans text-slate-900 lg:grid lg:grid-cols-[52%_48%] dark:bg-[#020617] dark:text-slate-100">
      {/* ── Left — diagonal brand panel with the flow stepper ─────────── */}
      <aside className="sticky top-0 hidden h-dvh overflow-hidden lg:block">
        {/* Echo stripe behind the main panel for a layered slanted edge */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-blue-500/25 [clip-path:polygon(0_0,100%_0,84%_100%,0_100%)] dark:bg-blue-500/15"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 [clip-path:polygon(0_0,96%_0,80%_100%,0_100%)] dark:from-blue-900 dark:via-indigo-950 dark:to-slate-950"
        >
          {/* Subtle blueprint grid */}
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]" />

          {/* Glow blobs */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-1/3 h-105 w-105 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/15" />

          {/* Slanted accent stripes echoing the diagonal edge */}
          <div className="absolute inset-y-[-10%] right-[16%] w-24 -skew-x-12 bg-white/5" />
          <div className="absolute inset-y-[-10%] right-[6%] w-10 -skew-x-12 bg-white/10" />
        </div>

        <div className="relative flex h-full flex-col justify-between px-14 py-12 pr-28 text-white xl:px-16">
          <Link to="/" className="group flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl font-bold text-white shadow-lg ring-1 ring-white/25 backdrop-blur-sm transition-transform group-hover:rotate-3">
              S
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-bold italic tracking-tighter">SEAL</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-100/80">
                Hackathon System
              </span>
            </div>
          </Link>

          <div className="max-w-110">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              FPT University HCM · PDP
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-5xl">
              Join the
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                SEAL league.
              </span>
            </h1>

            <p className="mt-4 max-w-95 text-base leading-7 text-blue-100/90">
              Three quick steps and your team is ready for the next hackathon
              season.
            </p>

            {/* Vertical flow stepper */}
            <ol className="mt-10 space-y-0">
              {STEPS.map((step, index) => {
                const isDone = step.number < currentStep;
                const isActive = step.number === currentStep;

                return (
                  <li key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={[
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                          isDone
                            ? "bg-emerald-400/90 text-slate-950 shadow-lg shadow-emerald-500/25"
                            : isActive
                              ? "bg-white text-blue-700 shadow-lg shadow-black/20 ring-4 ring-white/25"
                              : "bg-white/10 text-blue-100/70 ring-1 ring-white/20",
                        ].join(" ")}
                      >
                        {isDone ? <CheckIcon sx={{ fontSize: 20 }} /> : step.icon}
                      </span>
                      {index < STEPS.length - 1 && (
                        <span
                          className={[
                            "my-1.5 w-0.5 flex-1 rounded-full",
                            isDone ? "bg-emerald-400/70" : "bg-white/15",
                          ].join(" ")}
                        />
                      )}
                    </div>

                    <div className={index < STEPS.length - 1 ? "pb-8" : ""}>
                      <p
                        className={[
                          "pt-0.5 text-xs font-bold uppercase tracking-widest",
                          isActive ? "text-cyan-200" : "text-blue-100/60",
                        ].join(" ")}
                      >
                        Step {step.number}
                      </p>
                      <p
                        className={[
                          "mt-0.5 font-bold",
                          isActive || isDone ? "text-white" : "text-blue-100/70",
                        ].join(" ")}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-blue-100/70">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-100/70">
            <GroupsOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Spring · Summer · Fall — every year</span>
          </div>
        </div>
      </aside>

      {/* ── Right — step content ──────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-col px-6 py-6 sm:px-12 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 lg:invisible">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
              S
            </div>
            <span className="text-lg font-bold italic tracking-tighter">SEAL</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mx-auto my-auto w-full max-w-130 py-8">{children}</div>
        </div>

        <div className="flex items-center justify-center pb-2 text-xs text-slate-400 dark:text-slate-500">
          <span>© 2026 SEAL League Portal · FPT University HCM</span>
        </div>
      </div>
    </div>
  );
}

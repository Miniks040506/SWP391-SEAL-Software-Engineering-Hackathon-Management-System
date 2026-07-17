import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TextField from "@mui/material/TextField";

import {
  createTeamSchema,
  type CreateTeamFormValues,
} from "../schemas/myTeams.schema";
import { useCreateTeamMutation } from "../hooks/useParticipantTeams";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-sky-600",
];

function getTeamInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getAvatarGradient(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const STEPS = [
  {
    title: "Create your team",
    detail: "Pick a name — you automatically become the Team Leader.",
    Icon: Groups2OutlinedIcon,
    chip: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Invite 3–5 members",
    detail: "Send email invitations or share your team join code.",
    Icon: GroupAddOutlinedIcon,
    chip: "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    title: "Register for an event",
    detail: "Choose a track in an open season and compete for prizes.",
    Icon: RocketLaunchOutlinedIcon,
    chip: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
];

export const CreateTeamPage = () => {
  const navigate = useNavigate();

  const createTeamMutation = useCreateTeamMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      projectTitle: "",
      description: "",
    },
  });

  const nameValue = watch("name") ?? "";
  const projectTitleValue = watch("projectTitle") ?? "";
  const descriptionValue = watch("description") ?? "";

  const onSubmit = async (values: CreateTeamFormValues) => {
    const createdTeam = await createTeamMutation.mutateAsync({
      name: values.name,
      projectTitle: values.projectTitle || undefined,
      description: values.description || undefined,
    });

    navigate(`/participant/teams/${createdTeam.id}`);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate("/participant/teams")}
        className="flex cursor-pointer items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
      >
        <ArrowBackOutlinedIcon style={{ fontSize: 16 }} />
        Back to My Teams
      </button>

      {/* ---------------------------------------------------------------- */}
      {/* Page heading                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          New squad
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
          Create your team
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Set up your squad for the SEAL league. You can change these details
          any time before registering for an event.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* -------------------------------------------------------------- */}
        {/* Form card                                                       */}
        {/* -------------------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          <form className="space-y-7 p-8 md:p-10" onSubmit={handleSubmit(onSubmit)}>
            {/* Live identity preview */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-base font-black text-white shadow-md transition-all ${getAvatarGradient(nameValue || "?")}`}
              >
                {getTeamInitials(nameValue)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {nameValue.trim() || "Your team name"}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {projectTitleValue.trim() || "Project title appears here"}
                </p>
              </div>

              <span className="ml-auto shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                Preview
              </span>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label
                  htmlFor="team-name"
                  className="text-sm font-bold text-slate-900 dark:text-slate-100"
                >
                  Team Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
                  {nameValue.length}/50
                </span>
              </div>

              <TextField
                id="team-name"
                placeholder="e.g. Alpha Coders"
                required
                fullWidth
                error={Boolean(errors.name)}
                helperText={
                  errors.name?.message ??
                  "3–50 characters. Shown on leaderboards and to judges after publishing."
                }
                slotProps={{ htmlInput: { maxLength: 50 } }}
                {...register("name")}
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label
                  htmlFor="project-title"
                  className="text-sm font-bold text-slate-900 dark:text-slate-100"
                >
                  Project Title{" "}
                  <span className="font-medium text-slate-400 dark:text-slate-500">
                    (optional)
                  </span>
                </label>
                <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
                  {projectTitleValue.length}/200
                </span>
              </div>

              <TextField
                id="project-title"
                placeholder="e.g. Smart queue management platform"
                fullWidth
                error={Boolean(errors.projectTitle)}
                helperText={errors.projectTitle?.message}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                {...register("projectTitle")}
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label
                  htmlFor="project-description"
                  className="text-sm font-bold text-slate-900 dark:text-slate-100"
                >
                  Project Description{" "}
                  <span className="font-medium text-slate-400 dark:text-slate-500">
                    (optional)
                  </span>
                </label>
                <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
                  {descriptionValue.length}/2000
                </span>
              </div>

              <TextField
                id="project-description"
                placeholder="What are you planning to build? A short pitch helps teammates and mentors understand your idea."
                fullWidth
                multiline
                minRows={5}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
                {...register("description")}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate("/participant/teams")}
                disabled={createTeamMutation.isPending}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-blue-300 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:text-blue-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createTeamMutation.isPending}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Groups2OutlinedIcon style={{ fontSize: 17 }} />
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </button>
            </div>
          </form>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Sidebar: how it works + rules                                   */}
        {/* -------------------------------------------------------------- */}
        <aside className="flex flex-col gap-6 lg:col-span-5">
          <section className="rounded-3xl border border-slate-200 bg-linear-to-br from-white via-blue-50/60 to-indigo-50/50 p-7 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200">
              How it works
            </h2>

            <div className="mt-5 space-y-5">
              {STEPS.map(({ title, detail, Icon, chip }, index) => (
                <div key={title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${chip}`}
                    >
                      <Icon style={{ fontSize: 19 }} />
                    </div>

                    {index < STEPS.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>

                  <div className="pb-1">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      <span className="mr-1.5 tabular-nums text-slate-300 dark:text-slate-600">
                        {index + 1}.
                      </span>
                      {title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200">
              <ShieldOutlinedIcon style={{ fontSize: 16 }} className="text-blue-500" />
              Good to know
            </h2>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                Teams need 3–5 members before they can register for an event.
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                As Team Leader you manage invitations, the join code, and can
                transfer leadership later.
              </li>
              <li className="flex items-start gap-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                Judging is blind — judges never see your team name while
                scoring.
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <EmojiEventsOutlinedIcon
                style={{ fontSize: 18 }}
                className="shrink-0 text-amber-500"
              />
              <p className="text-xs font-semibold leading-5 text-amber-700 dark:text-amber-400">
                Winning teams earn certificates, medals, and sponsor prizes at
                the end of each season.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

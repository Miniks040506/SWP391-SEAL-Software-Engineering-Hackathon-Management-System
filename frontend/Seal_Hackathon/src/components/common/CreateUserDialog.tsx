import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { isAxiosError } from "axios";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { ZodType } from "zod";

const textFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiOutlinedInput-input": { paddingBlock: "12px" },
  ".dark & .MuiInputBase-input": { color: "#e2e8f0" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
  ".dark & .MuiIconButton-root": { color: "#94a3b8" },
  ".dark & .MuiInputAdornment-root .MuiSvgIcon-root": { color: "#64748b" },
};

export type BaseCreateUserPayload = {
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string;
};

type CreateUserDialogValues = {
  email: string;
  fullName: string;
  role: "ADMIN" | "COORDINATOR" | "JUDGE" | "MENTOR";
  phone?: string;
  judgeType: "INTERNAL" | "GUEST";
  affiliation?: string;
  expertise?: string;
  temporaryAccountExpiresAt?: string;
};

type CreatableUserRole = CreateUserDialogValues["role"];

export type CreateGuestJudgePayload = {
  email: string;
  fullName: string;
  affiliation?: string;
  expertise?: string;
  temporaryAccountExpiresAt?: string;
};

export interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  availableRoles: readonly CreatableUserRole[];
  defaultRole: CreatableUserRole;
  validationSchema: ZodType<CreateUserDialogValues, CreateUserDialogValues>;
  isPending: boolean;
  isPendingGuestJudge: boolean;
  onSubmitUser: (payload: BaseCreateUserPayload) => Promise<void>;
  onSubmitGuestJudge: (payload: CreateGuestJudgePayload) => Promise<void>;
}

/** Per-role visual identity for the role selector cards. */
const ROLE_META: Record<
  CreatableUserRole,
  { label: string; blurb: string; icon: SvgIconComponent; active: string; icColor: string }
> = {
  ADMIN: {
    label: "Admin",
    blurb: "Platform control",
    icon: AdminPanelSettingsOutlinedIcon,
    active:
      "border-rose-400 bg-rose-50 ring-rose-400/30 dark:border-rose-500/60 dark:bg-rose-500/10",
    icColor: "text-rose-500",
  },
  COORDINATOR: {
    label: "Coordinator",
    blurb: "Runs events",
    icon: WorkspacePremiumOutlinedIcon,
    active:
      "border-violet-400 bg-violet-50 ring-violet-400/30 dark:border-violet-500/60 dark:bg-violet-500/10",
    icColor: "text-violet-500",
  },
  JUDGE: {
    label: "Judge",
    blurb: "Scores teams",
    icon: GavelOutlinedIcon,
    active:
      "border-amber-400 bg-amber-50 ring-amber-400/30 dark:border-amber-500/60 dark:bg-amber-500/10",
    icColor: "text-amber-500",
  },
  MENTOR: {
    label: "Mentor",
    blurb: "Guides teams",
    icon: SupervisorAccountOutlinedIcon,
    active:
      "border-pink-400 bg-pink-50 ring-pink-400/30 dark:border-pink-500/60 dark:bg-pink-500/10",
    icColor: "text-pink-500",
  },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
      {children}
    </div>
  );
}

export function CreateUserDialog({
  open,
  onClose,
  availableRoles,
  defaultRole,
  validationSchema,
  isPending,
  isPendingGuestJudge,
  onSubmitUser,
  onSubmitGuestJudge,
}: CreateUserDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateUserDialogValues>({
    resolver: zodResolver(validationSchema) as Resolver<CreateUserDialogValues>,
    defaultValues: {
      role: defaultRole,
      judgeType: "INTERNAL",
      fullName: "",
      email: "",
      phone: "",
      affiliation: "",
      expertise: "",
      temporaryAccountExpiresAt: "",
    },
  });

  const role = watch("role");
  const judgeType = watch("judgeType");
  const isSubmitting = isPending || isPendingGuestJudge;
  const isGuestJudge = role === "JUDGE" && judgeType === "GUEST";

  const closeDialog = () => {
    reset();
    onClose();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    closeDialog();
  };

  const normalizeExpiresAt = (value?: string) => {
    if (!value) return undefined;
    return value.length === 16 ? `${value}:00` : value;
  };

  const onSubmit = async (values: CreateUserDialogValues) => {
    try {
      if (values.role === "JUDGE" && values.judgeType === "GUEST") {
        await onSubmitGuestJudge({
          email: values.email.trim().toLowerCase(),
          fullName: values.fullName.trim(),
          affiliation: values.affiliation?.trim() || undefined,
          expertise: values.expertise?.trim() || undefined,
          temporaryAccountExpiresAt: normalizeExpiresAt(
            values.temporaryAccountExpiresAt,
          ),
        });
      } else {
        await onSubmitUser({
          email: values.email.trim().toLowerCase(),
          fullName: values.fullName.trim(),
          phone: values.phone || undefined,
          role: values.role,
          status: "ACTIVE",
        });
      }
      enqueueSnackbar("User created successfully.", { variant: "success" });
      closeDialog();
    } catch (error: unknown) {
      enqueueSnackbar(
        isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || "Failed to create user."
          : "Failed to create user.",
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      classes={{ paper: "bg-white dark:bg-slate-900 dark:text-slate-200" }}
      sx={{
        "& .MuiDialog-paper": {
          backgroundImage: "none",
          borderRadius: "22px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Gradient hero header ─────────────────────────────────────── */}
      <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-300 ring-1 ring-white/15 backdrop-blur">
            <PersonAddAlt1OutlinedIcon />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-tight text-white">
              Create New User
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Add a member and send a secure setup invitation.
            </p>
          </div>
          <IconButton
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            size="small"
            sx={{
              ml: "auto",
              color: "rgba(255,255,255,0.6)",
              "&:hover": {
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <DialogContent
          className="space-y-5 !px-6 !pt-6 !pb-2"
          sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}
        >
          {/* Identity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>
                Full name <span className="text-rose-500">*</span>
              </FieldLabel>
              <TextField
                fullWidth
                size="small"
                placeholder="Nguyen Van An"
                {...register("fullName")}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message as string}
                sx={textFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            <div>
              <FieldLabel>
                Email <span className="text-rose-500">*</span>
              </FieldLabel>
              <TextField
                fullWidth
                size="small"
                placeholder="user@fpt.edu.vn"
                {...register("email")}
                error={Boolean(errors.email)}
                helperText={errors.email?.message as string}
                sx={textFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Optional"
              {...register("phone")}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message as string}
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>

          {/* Role selector */}
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div>
                <FieldLabel>
                  Role <span className="text-rose-500">*</span>
                </FieldLabel>
                <div className="grid grid-cols-2 gap-2.5">
                  {availableRoles.map((r) => {
                    const meta = ROLE_META[r];
                    const Icon = meta.icon;
                    const active = field.value === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => field.onChange(r)}
                        aria-pressed={active}
                        className={[
                          "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 motion-reduce:transition-none",
                          active
                            ? `${meta.active} ring-2`
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? `bg-white shadow-sm dark:bg-slate-900 ${meta.icColor}`
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                          ].join(" ")}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </span>
                        <span className="min-w-0">
                          <span
                            className={[
                              "block text-sm font-bold leading-tight",
                              active
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-300",
                            ].join(" ")}
                          >
                            {meta.label}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {meta.blurb}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errors.role.message as string}
                  </p>
                )}
              </div>
            )}
          />

          {/* Judge type segmented control */}
          {role === "JUDGE" && (
            <Controller
              control={control}
              name="judgeType"
              render={({ field }) => (
                <div>
                  <FieldLabel>
                    Judge type <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/60">
                    {(["INTERNAL", "GUEST"] as const).map((option) => {
                      const selected = field.value === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          aria-pressed={selected}
                          className={[
                            "rounded-lg px-3 py-2 text-sm font-bold capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 motion-reduce:transition-none",
                            selected
                              ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"
                              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                          ].join(" ")}
                        >
                          {option.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            />
          )}

          {/* Guest judge details */}
          {isGuestJudge && (
            <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-500/[0.06]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">
                <GavelOutlinedIcon sx={{ fontSize: 16 }} />
                Guest judge details
              </div>
              <div>
                <FieldLabel>Affiliation</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Organization or university (optional)"
                  {...register("affiliation")}
                  sx={textFieldSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <ApartmentOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>
              <div>
                <FieldLabel>Expertise</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Areas of expertise (optional)"
                  {...register("expertise")}
                  sx={textFieldSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PsychologyOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>
              <div>
                <FieldLabel>Access expires at</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="datetime-local"
                  {...register("temporaryAccountExpiresAt")}
                  sx={textFieldSx}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Defaults to 3 days from now if left empty.
                </p>
              </div>
            </div>
          )}

          {/* Setup-code note */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <MarkEmailReadOutlinedIcon
              sx={{ fontSize: 18 }}
              className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-300"
            />
            <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
              SEAL emails a single-use setup code. The user sets their own
              password before the code expires — no password is created here.
            </p>
          </div>
        </DialogContent>

        <DialogActions className="shrink-0 border-t border-slate-100 !px-6 !pb-5 !pt-3 dark:border-slate-800">
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              color: "#64748b",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddAlt1OutlinedIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "none",
              paddingInline: "20px",
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              "&:hover": {
                boxShadow: "0 8px 20px -6px rgba(37,99,235,0.5)",
                background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
              },
              "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
            }}
          >
            {isSubmitting ? "Creating…" : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

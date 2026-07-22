import { useMemo, useState } from "react";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Switch,
  TextField,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import type {
  SystemConfigCategory,
  SystemConfigResponse,
  SystemConfigValueType,
} from "@/types/system.types";
import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import {
  filterSelectSx,
  menuPropsAll,
  textFieldSx,
} from "@/features/admin/schemas/admin.schema";
import { useSystemConfigQuery } from "@/features/system/hooks/useSystemQueries";
import {
  useSeedSystemConfigMutation,
  useUpdateSystemConfigMutation,
} from "@/features/system/hooks/useSystemMutations";

const CATEGORY_OPTIONS: Array<"ALL" | SystemConfigCategory> = [
  "ALL",
  "FEATURE_FLAG",
  "INTEGRATION",
  "SMTP",
  "SECURITY",
  "RATE_LIMIT",
  "GENERAL",
];

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number")
    return String(value);
  return JSON.stringify(value, null, 2);
}

function parseValue(value: string, type?: string) {
  if (type === "BOOLEAN")
    return value === "true" || value === "1" || value.toLowerCase() === "yes";
  if (type === "INTEGER") return Number.parseInt(value || "0", 10);
  if (type === "JSON") {
    try {
      return JSON.parse(value || "{}");
    } catch {
      return value;
    }
  }
  return value;
}

function ConfigValueInput({
  item,
  value,
  onChange,
}: {
  item: SystemConfigResponse;
  value: string;
  onChange: (value: string) => void;
}) {
  if (item.valueType === "BOOLEAN") {
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={value === "true" || value === "1"}
          onChange={(event) => onChange(String(event.target.checked))}
        />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {value === "true" || value === "1" ? "Enabled" : "Disabled"}
        </span>
      </div>
    );
  }

  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      multiline={item.valueType === "JSON"}
      minRows={item.valueType === "JSON" ? 3 : 1}
      type={
        item.valueType === "INTEGER"
          ? "number"
          : item.encrypted
            ? "password"
            : "text"
      }
      placeholder={
        item.encrypted ? "Secret is masked by default" : "Config value"
      }
      sx={textFieldSx}
    />
  );
}

export function AdminSystemConfigPage() {
  const [category, setCategory] = useState<"ALL" | SystemConfigCategory>("ALL");
  const [includeSecrets, setIncludeSecrets] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const params = useMemo(
    () => ({
      category: category === "ALL" ? undefined : category,
      includeSecrets,
    }),
    [category, includeSecrets],
  );

  const {
    data: configs = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSystemConfigQuery(params);
  const updateMutation = useUpdateSystemConfigMutation();
  const seedMutation = useSeedSystemConfigMutation();

  const groupedConfigs = useMemo(() => {
    const result = new Map<string, SystemConfigResponse[]>();
    configs.forEach((item) => {
      const group = item.category || "GENERAL";
      result.set(group, [...(result.get(group) ?? []), item]);
    });
    return Array.from(result.entries());
  }, [configs]);

  const getDraft = (item: SystemConfigResponse) =>
    draftValues[item.configKey] ?? stringifyValue(item.configValue);

  const changedItems = configs.filter(
    (item) => getDraft(item) !== stringifyValue(item.configValue),
  );

  const saveChanges = () => {
    updateMutation.mutate({
      items: changedItems.map((item) => ({
        key: item.configKey,
        value: parseValue(getDraft(item), item.valueType),
        encrypted: item.encrypted,
        category: item.category,
        valueType: item.valueType as SystemConfigValueType | string,
        description: item.description,
        active: item.active,
      })),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminOperationsHeader
        eyebrow="Administration Workspace"
        title="System"
        accentTitle="Configuration"
        description="Manage runtime settings and feature controls. Protected values remain masked until explicitly requested."
        icon={<SettingsSuggestOutlinedIcon sx={{ fontSize: 34 }} />}
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Seed defaults
            </button>
            <button
              type="button"
              disabled={changedItems.length === 0 || updateMutation.isPending}
              onClick={saveChanges}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <SaveOutlinedIcon sx={{ fontSize: 18 }} />
              Save{changedItems.length ? ` (${changedItems.length})` : ""}
            </button>
          </>
        }
      />

      <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <TuneOutlinedIcon
                className="text-blue-500"
                sx={{ fontSize: 20 }}
              />
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              Configuration scope
            </span>
          </div>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as "ALL" | SystemConfigCategory)
              }
              sx={filterSelectSx}
              MenuProps={menuPropsAll}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === "ALL"
                    ? "All categories"
                    : option.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <label className="flex cursor-pointer items-center gap-2">
            <Switch
              checked={includeSecrets}
              onChange={(event) => setIncludeSecrets(event.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Include secrets
            </span>
            <LockOutlinedIcon fontSize="small" className="text-slate-400" />
          </label>
        </div>
        <span className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 tabular-nums md:self-auto dark:bg-slate-800 dark:text-slate-300">
          {configs.length} items
        </span>
      </section>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <Skeleton
                variant="text"
                width={160}
                height={30}
                className="dark:bg-slate-800"
              />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((__, row) => (
                  <Skeleton
                    key={row}
                    variant="rounded"
                    height={52}
                    className="dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Could not load system configuration. Refresh the page to try again.
        </div>
      ) : configs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
          <p className="font-bold text-slate-700 dark:text-slate-200">
            No configuration found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Seed defaults to initialize the platform settings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedConfigs.map(([group, items]) => (
            <section
              key={group}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                  {group.replace(/_/g, " ")}
                </h2>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 tabular-nums dark:bg-slate-800 dark:text-slate-300">
                  {items.length} items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      <th className="px-5 py-4">Key</th>
                      <th className="px-5 py-4">Value</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="align-top transition-colors hover:bg-blue-50/30 dark:hover:bg-slate-800/40"
                      >
                        <td className="w-72 px-5 py-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                          {item.configKey}
                          {item.encrypted && (
                            <Chip
                              size="small"
                              icon={<LockOutlinedIcon />}
                              label="secret"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </td>
                        <td className="min-w-75 px-5 py-4">
                          <ConfigValueInput
                            item={item}
                            value={getDraft(item)}
                            onChange={(value) =>
                              setDraftValues((current) => ({
                                ...current,
                                [item.configKey]: value,
                              }))
                            }
                          />
                        </td>
                        <td className="px-5 py-4">
                          <Chip
                            size="small"
                            label={item.valueType ?? "STRING"}
                            variant="outlined"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <Chip
                            size="small"
                            color={item.active ? "success" : "default"}
                            label={item.active ? "Active" : "Inactive"}
                          />
                        </td>
                        <td className="max-w-sm px-5 py-4 text-slate-500 dark:text-slate-400">
                          {item.description || "Not provided"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

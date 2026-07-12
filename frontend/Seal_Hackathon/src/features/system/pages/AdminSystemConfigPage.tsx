import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import type { SystemConfigCategory, SystemConfigResponse, SystemConfigValueType } from "@/types/system.types";
import { useSystemConfigQuery } from "@/features/system/hooks/useSystemQueries";
import { useSeedSystemConfigMutation, useUpdateSystemConfigMutation } from "@/features/system/hooks/useSystemMutations";

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
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return JSON.stringify(value, null, 2);
}

function parseValue(value: string, type?: string) {
  if (type === "BOOLEAN") return value === "true" || value === "1" || value.toLowerCase() === "yes";
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

function ConfigValueInput({ item, value, onChange }: { item: SystemConfigResponse; value: string; onChange: (value: string) => void }) {
  if (item.valueType === "BOOLEAN") {
    return (
      <div className="flex items-center gap-3">
        <Switch checked={value === "true" || value === "1"} onChange={(event) => onChange(String(event.target.checked))} />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value === "true" || value === "1" ? "Enabled" : "Disabled"}</span>
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
      type={item.valueType === "INTEGER" ? "number" : item.encrypted ? "password" : "text"}
      placeholder={item.encrypted ? "Secret is masked by default" : "Config value"}
    />
  );
}

export function AdminSystemConfigPage() {
  const [category, setCategory] = useState<"ALL" | SystemConfigCategory>("ALL");
  const [includeSecrets, setIncludeSecrets] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const params = useMemo(
    () => ({ category: category === "ALL" ? undefined : category, includeSecrets }),
    [category, includeSecrets],
  );

  const { data: configs = [], isLoading, isFetching, isError, refetch } = useSystemConfigQuery(params);
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

  const getDraft = (item: SystemConfigResponse) => draftValues[item.configKey] ?? stringifyValue(item.configValue);

  const changedItems = configs.filter((item) => getDraft(item) !== stringifyValue(item.configValue));

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
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-950 dark:text-white">
            <SettingsSuggestOutlinedIcon color="primary" fontSize="large" />
            System Config
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Manage feature flags and runtime settings. Secrets stay masked unless explicitly requested.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
          <Button variant="outlined" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            Seed defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            disabled={changedItems.length === 0 || updateMutation.isPending}
            onClick={saveChanges}
          >
            Save {changedItems.length ? `(${changedItems.length})` : ""}
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Category</InputLabel>
              <Select 
                label="Category" 
                value={category} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(event) => setCategory(event.target.value as any)}
            >
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option === "ALL" ? "All categories" : option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex items-center gap-2">
              <Switch checked={includeSecrets} onChange={(event) => setIncludeSecrets(event.target.checked)} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Include secrets</span>
              <LockOutlinedIcon fontSize="small" color="disabled" />
            </div>
          </div>
          <Chip label={`${configs.length} config item(s)`} />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <CircularProgress />
        </div>
      ) : isError ? (
        <Alert severity="error">Could not load system configuration.</Alert>
      ) : configs.length === 0 ? (
        <Alert severity="info">No configuration was found. Seed defaults to initialize Period 10 feature flags.</Alert>
      ) : (
        <div className="space-y-6">
          {groupedConfigs.map(([group, items]) => (
            <Card key={group}>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">{group}</h2>
                  <Chip size="small" label={`${items.length} item(s)`} />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                    <thead>
                      <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="py-3 pr-4">Key</th>
                        <th className="py-3 pr-4">Value</th>
                        <th className="py-3 pr-4">Type</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="w-72 py-4 pr-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                            {item.configKey}
                            {item.encrypted && <Chip size="small" icon={<LockOutlinedIcon />} label="secret" sx={{ ml: 1 }} />}
                          </td>
                          <td className="min-w-75 py-4 pr-4">
                            <ConfigValueInput
                              item={item}
                              value={getDraft(item)}
                              onChange={(value) => setDraftValues((current) => ({ ...current, [item.configKey]: value }))}
                            />
                          </td>
                          <td className="py-4 pr-4">
                            <Chip size="small" label={item.valueType ?? "STRING"} variant="outlined" />
                          </td>
                          <td className="py-4 pr-4">
                            <Chip size="small" color={item.active ? "success" : "default"} label={item.active ? "Active" : "Inactive"} />
                          </td>
                          <td className="max-w-sm py-4 pr-4 text-slate-500">{item.description || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

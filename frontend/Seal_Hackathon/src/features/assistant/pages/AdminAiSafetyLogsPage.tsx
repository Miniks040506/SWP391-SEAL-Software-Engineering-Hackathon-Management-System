import { useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import { useAiSafetyLogsQuery } from "@/features/assistant/hooks/useAssistantAdminQueries";

const decisionOptions = ["", "ALLOW", "WARN", "BLOCK"];

export function AdminAiSafetyLogsPage() {
  const [decision, setDecision] = useState("");
  const { data, isLoading, isError } = useAiSafetyLogsQuery({ decision: decision || undefined, page: 0, size: 30 });

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldOutlinedIcon color="warning" />
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">AI Safety Logs</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Review assistant guardrail decisions for academic integrity, private-data protection, prompt injection and out-of-scope requests.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <TextField select label="Decision" value={decision} onChange={(e) => setDecision(e.target.value)} sx={{ minWidth: 220 }}>
            {decisionOptions.map((option) => <MenuItem key={option || "ALL"} value={option}>{option || "All"}</MenuItem>)}
          </TextField>

          {isLoading && <CircularProgress size={22} />}
          {isError && <Alert severity="error">Could not load safety logs.</Alert>}
          {!isLoading && !data?.content?.length && <Alert severity="info">No safety logs match the filter.</Alert>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Decision</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Intent</th>
                  <th className="px-3 py-2">Severity</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {data?.content?.map((log) => (
                  <tr key={log.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-3">{log.userName ?? log.userId ?? "System"}</td>
                    <td className="px-3 py-3">
                      <Chip size="small" color={log.decision === "BLOCK" ? "warning" : "default"} label={log.decision} />
                    </td>
                    <td className="px-3 py-3">{log.riskType}</td>
                    <td className="px-3 py-3">{log.intent}</td>
                    <td className="px-3 py-3">{log.severity}</td>
                    <td className="px-3 py-3 max-w-md text-slate-500">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

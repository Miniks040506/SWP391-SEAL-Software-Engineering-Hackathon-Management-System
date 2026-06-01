import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import IconButton from "@mui/material/IconButton";
import { SectionCard } from "../../components/SectionCard";
import { availableScoreCriteria } from "../../mocks/coordinatorEditEvent.mock";

export const CriteriaTab = () => (
  <div className="space-y-6">
    <SectionCard className="w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <ChecklistOutlinedIcon fontSize="small" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-300">Scoring Criteria</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Manage the criteria pool used to evaluate team submissions.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-600 dark:bg-blue-500! dark:text-white! dark:hover:bg-blue-400!"
        >
          <AddOutlinedIcon fontSize="small" /> Add Criteria
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableScoreCriteria.map((c) => (
          <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md dark:border-slate-700/60 dark:bg-[#1e293b]">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.name}</h4>
                <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                  {c.maxScore} pts
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{c.description}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700/60">
              <IconButton size="small" className="text-slate-400! hover:bg-blue-50! hover:text-blue-600! dark:hover:bg-slate-800! dark:hover:text-blue-400!">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" className="text-slate-400! hover:bg-red-50! hover:text-red-500! dark:hover:bg-slate-800! dark:hover:text-rose-400!">
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  </div>
);
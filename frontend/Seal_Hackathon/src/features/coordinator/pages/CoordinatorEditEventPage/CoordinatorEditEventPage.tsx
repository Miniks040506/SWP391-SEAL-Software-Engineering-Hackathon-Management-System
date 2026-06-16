import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { Button, CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { UUID } from "@/types/common.types";

import { AssignmentsTab } from "./AssignmentsTab";
import { InfoTab } from "./InfoTab";
import { PrizesTab } from "./PrizesTab";
import { RoundsTab } from "./RoundsTab";
import { TeamsTab } from "./TeamsTab";
import { TracksTab } from "./TracksTab";
import { CriteriaTab } from "./CriteriaTab";
import { getEventEditRules, normalizeEventStatus } from "./eventEditRules";

import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventPrizesQuery,
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventTracksQuery,
  useInvalidateEditEventData,
} from "../../hooks/useCoordinatorEventQueries";

type EditTab = "INFO" | "TRACKS" | "TEAMS" | "ROUNDS" | "ASSIGNMENTS" | "CRITERIA" | "PRIZES";

const tabs: Array<{ value: EditTab; label: string; icon: typeof InfoOutlinedIcon }> = [
  { value: "INFO", label: "Info", icon: InfoOutlinedIcon },
  { value: "TRACKS", label: "Tracks", icon: RouteOutlinedIcon },
  { value: "TEAMS", label: "Teams", icon: GroupsOutlinedIcon },
  { value: "ROUNDS", label: "Rounds", icon: SchemaOutlinedIcon },
  { value: "ASSIGNMENTS", label: "Mentors & Judges", icon: GroupsOutlinedIcon },
  { value: "CRITERIA", label: "Criteria", icon: FactCheckOutlinedIcon },
  { value: "PRIZES", label: "Prizes", icon: MilitaryTechOutlinedIcon },
];

function getEventName(event: unknown) {
  const raw = event as { name?: string; eventName?: string; title?: string };
  return raw?.name ?? raw?.eventName ?? raw?.title ?? "Edit Event";
}

function getBannerUrl(event: unknown) {
  return (event as { bannerUrl?: string | null })?.bannerUrl ?? null;
}

export function CoordinatorEditEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: UUID }>();
  const [activeTab, setActiveTab] = useState<EditTab>("INFO");

  const eventQuery = useCoordinatorEventDetailQuery(eventId);
  const tracksQuery = useCoordinatorEventTracksQuery(eventId);
  const roundsQuery = useCoordinatorEventRoundsQuery(eventId);
  const prizesQuery = useCoordinatorEventPrizesQuery(eventId);
  
  const invalidateEditData = useInvalidateEditEventData(eventId);

  const eventName = useMemo(() => getEventName(eventQuery.data), [eventQuery.data]);
  const bannerUrl = useMemo(() => getBannerUrl(eventQuery.data), [eventQuery.data]);
  const eventStatus = normalizeEventStatus((eventQuery.data as any)?.status);
  const editRules = getEventEditRules(eventStatus);

  if (!eventId) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 font-bold text-rose-600">Missing event id.</div>;
  }

  if (eventQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><CircularProgress /></div>;
  }

  if (eventQuery.isError) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 font-bold text-rose-600">Failed to load event detail.</div>;
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="aspect-21/9 max-h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {bannerUrl ? (
            <img src={bannerUrl} alt={eventName} className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-blue-500 via-cyan-400 to-violet-600 font-black text-white">
              SEAL EVENT
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate("/coordinator/events")}
              sx={{ mb: 1, textTransform: "none", fontWeight: 800 }}
            >
              Back to Events
            </Button>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">{eventName}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Edit event information, tracks, rounds, mentors, judges, and prizes.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={["inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition", activeTab === tab.value ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"].join(" ")}
            >
              <Icon fontSize="small" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "INFO" && <InfoTab eventId={eventId} event={eventQuery.data!} onUpdated={invalidateEditData} canEdit={editRules.canEditInfo} readonlyReason={editRules.infoReason} />}
      {activeTab === "TRACKS" && <TracksTab eventId={eventId} tracks={tracksQuery.data ?? []} isLoading={tracksQuery.isLoading} onChanged={invalidateEditData} canEdit={editRules.canEditTracksRounds} readonlyReason={editRules.trackRoundReason} />}
      {activeTab === "TEAMS" && <TeamsTab eventId={eventId} eventName={eventName} tracks={tracksQuery.data ?? []} />}
      {activeTab === "ROUNDS" && <RoundsTab eventId={eventId} tracks={tracksQuery.data ?? []} rounds={roundsQuery.data ?? []} isLoading={roundsQuery.isLoading} onChanged={invalidateEditData} canEdit={editRules.canEditTracksRounds} readonlyReason={editRules.trackRoundReason} />}
      {activeTab === "ASSIGNMENTS" && <AssignmentsTab eventId={eventId} tracks={tracksQuery.data ?? []} rounds={roundsQuery.data ?? []} canEdit={editRules.canEditAssignments} readonlyReason={editRules.assignmentReason} />}
      {activeTab === "CRITERIA" && <CriteriaTab eventId={eventId} event={eventQuery.data} rounds={roundsQuery.data ?? []} canEdit={editRules.canEditCriteria} readonlyReason={editRules.criteriaReason} />}
      {activeTab === "PRIZES" && <PrizesTab eventId={eventId} tracks={tracksQuery.data ?? []} prizes={prizesQuery.data ?? []} isLoading={prizesQuery.isLoading} onChanged={invalidateEditData} canEdit={editRules.canEditPrizes} readonlyReason={editRules.prizeReason} />}
    </div>
  );
}

export default CoordinatorEditEventPage;

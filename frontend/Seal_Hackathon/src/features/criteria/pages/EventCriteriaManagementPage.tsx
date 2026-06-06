import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { EventCriteriaPanel } from "@/features/criteria/components/EventCriteriaPanel";
import { useEventCriteriaManagementPage } from "@/features/criteria/hooks/useEventCriteriaManagementPage";
import type { UUID } from "@/types/common.types";

export function EventCriteriaManagementPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: UUID }>();
  const { event, rounds, eventQuery, canEdit, readonlyReason } =
    useEventCriteriaManagementPage(eventId);

  if (!eventId) {
    return <Alert severity="error">Missing event id.</Alert>;
  }

  if (eventQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (eventQuery.isError || !event) {
    return <Alert severity="error">Failed to load event.</Alert>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
            sx={{ mb: 1, textTransform: "none", fontWeight: 800 }}
          >
            Back to Event Edit
          </Button>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Manage Event Criteria
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {event.name} · {event.status}
          </p>
        </div>
      </div>

      <EventCriteriaPanel
        eventId={eventId}
        event={event}
        rounds={rounds}
        canEdit={canEdit}
        readonlyReason={readonlyReason}
        title="Event Criteria"
        subtitle="Coordinator can add criteria from global templates, customize overrides, or create event-only criteria. These are the criteria Judge uses for scorecards."
      />
    </div>
  );
}

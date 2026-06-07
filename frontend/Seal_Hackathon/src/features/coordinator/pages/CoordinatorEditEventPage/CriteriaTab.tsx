import { EventCriteriaPanel } from "@/features/criteria";
import type { UUID } from "@/types/common.types";
import type { EventDetailResponse } from "@/types/event.types";
import type { RoundResponse } from "@/types/round.types";

type CriteriaTabProps = {
  eventId: UUID;
  event?: EventDetailResponse | null;
  rounds: RoundResponse[];
  canEdit: boolean;
  readonlyReason?: string;
};

export function CriteriaTab({
  eventId,
  event,
  rounds,
  canEdit,
  readonlyReason,
}: CriteriaTabProps) {
  return (
    <EventCriteriaPanel
      eventId={eventId}
      event={event}
      rounds={rounds}
      canEdit={canEdit}
      readonlyReason={readonlyReason}
      title="Scoring & Event Criteria"
      subtitle="Manage the criteria that judges will use for this event. Use global templates or custom event-only criteria."
    />
  );
}

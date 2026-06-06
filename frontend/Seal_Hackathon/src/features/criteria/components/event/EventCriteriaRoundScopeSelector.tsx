import type { RoundResponse, UUID } from "@/types";

type EventCriteriaRoundScopeSelectorProps = {
  rounds: RoundResponse[];
  selectedRoundIds: UUID[];
  onChange: (roundIds: UUID[]) => void;
};

export function EventCriteriaRoundScopeSelector({
    rounds,
    selectedRoundIds,
    onChange
}: EventCriteriaRoundScopeSelectorProps) {
    return (
        <div>
            
        </div>
    )
}
import type { UUID } from "@/types/common.types";
import type { RoundResponse } from "@/types/round.types";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";

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
    
    const toggleRound = (roundId: UUID, checked: boolean) => {
        onChange(checked 
                ? Array.from(new Set([...selectedRoundIds, roundId]))
                : selectedRoundIds.filter((id) => id !== roundId)
        );
    };
    
    return (
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-2 text-sm font-black text-slate-900 dark:text-white">
                Applies to rounds
            </p>
            <p className="mb-3 text-xs font-medium text-slate-500">
                Leave all unchecked to apply this criterion to every round.
            </p>

            {rounds.length === 0 ? (
                <Alert severity="info">
                No rounds yet. Criteria will apply to all rounds by default.
                </Alert>
            ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {rounds.map((round) => (
                    <FormControlLabel
                    key={round.id}
                    control={
                        <Checkbox
                        checked={selectedRoundIds.includes(round.id)}
                        onChange={(event) => toggleRound(round.id, event.target.checked)}
                        />
                    }
                    label={`${round.orderIndex}. ${round.name}`}
                    />
                ))}
                </div>
            )}
        </div>
    );
}

import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
import { useFormContext } from "react-hook-form";

type CreateEventCriteriaRoundScopeProps = {
    criteriaIndex: number;
    rounds: CreateEventFormValues["rounds"];
    selectedRoundIds: string[];
};

export function CreateEventCriteriaRoundScope({
    criteriaIndex,
    rounds,
    selectedRoundIds,
}: CreateEventCriteriaRoundScopeProps) {
    const { setValue } = useFormContext<CreateEventFormValues>();
    
    const toggleRound = (roundId: string, checked: boolean) => {
        setValue(
            `criteria.${criteriaIndex}.appliesToRoundLocalIds`,
            checked
                ? Array.from(new Set([...selectedRoundIds, roundId]))
                : selectedRoundIds.filter((id) => id !== roundId),
        ); 
    };
    
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-1 text-sm font-black text-slate-900 dark:text-white">
                Apply to rounds
            </p>
            <p className="mb-3 text-xs font-medium text-slate-500">
                No selection means all rounds.
            </p>
            
            {rounds.length === 0 ? (
                <Alert severity="info">Create rounds before selecting a specific round scope.</Alert>
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
                            label={`${round.orderIndex}. ${round.roundName}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
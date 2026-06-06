import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import type { ScoringCriteriaResponse } from "@/types";
import { Chip, IconButton } from "@mui/material";
import { useFormContext } from "react-hook-form";

type CreateEventCriteriaCardProps = {
    index: number;
    fieldId: string;
    item: CreateEventFormValues["criteria"][number] | undefined;
    rounds: CreateEventFormValues["rounds"];
    templateOptions: ScoringCriteriaResponse[];
    onRemove: (index: number) => void;
};

export function CreateEventCriteriaCard({
    index,
    fieldId,
    item,
    rounds,
    templateOptions,
    onRemove,
}: CreateEventCriteriaCardProps) {
    const {
        control,
        register, 
        setValue,
        formState: {errors},
    } = useFormContext<CreateEventFormValues>();

    const isCustom = item?.sourceType === "CUSTOM";
    const fieldErrors = errors.criteria?.[index];
    
    return (
        <div
            key={fieldId}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/50"
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-slate-950 dark:text-white">
                        Criteria {index + 1}
                    </p>
                    <Chip
                        size="small"
                        label={isCustom ? "Custom" : " Template"}
                        sx={{ fontWeight: 800 }}
                    />
                </div>
                
                <IconButton color="error" onClick={() => onRemove(index)}>
                    <DeleteOutlineOutlinedIcon />
                </IconButton>
            </div>
        </div>
    )
}
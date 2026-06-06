import { CRITERIA_CATEGORIES, type BooleanFilterValue, type CriteriaFilterValue } from "@/types"
import { MenuItem, TextField } from "@mui/material";
import { criteriaTextFieldSx } from "../../constants/criteriaUi";

type ScoringCriteriaFilterBarProps = {
    category: CriteriaFilterValue;
    active: BooleanFilterValue;
    technical: BooleanFilterValue;
    onCategoryChange: (value: CriteriaFilterValue) => void;
    onActiveChange: (value: BooleanFilterValue) => void;
    onTechnicalChange: (value: BooleanFilterValue) => void;
}

export function ScoringCriteriaFilterBar({
    category,
    active,
    technical,
    onCategoryChange,
    onActiveChange,
    onTechnicalChange,
}: ScoringCriteriaFilterBarProps) {
    return (
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 dark:border-slate-700 md:grid-cols-3">
            <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as CriteriaFilterValue)}
                size="small"
                sx={criteriaTextFieldSx}
            >
                <MenuItem value="ALL">All categories</MenuItem>
                {CRITERIA_CATEGORIES.map((item) => (
                    <MenuItem key={item} value={item}>
                        {item}
                    </MenuItem>
                ))}
            </TextField>
            
            <TextField
                select
                label="Active status"
                value={active}
                onChange={(e) => onActiveChange(e.target.value as BooleanFilterValue)}
                size="small"
                sx={criteriaTextFieldSx}
            >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="TRUE">Active</MenuItem>
                <MenuItem value="FALSE">Inactive</MenuItem>
            </TextField>

            <TextField
                select
                label="Technical flag"
                value={technical}
                onChange={(e) => onTechnicalChange(e.target.value as BooleanFilterValue)}
                size="small"
                sx={criteriaTextFieldSx}
            >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="TRUE">Technical</MenuItem>
                <MenuItem value="FALSE">Soft / Subjective</MenuItem>
            </TextField>
                
        </div>
    )
}
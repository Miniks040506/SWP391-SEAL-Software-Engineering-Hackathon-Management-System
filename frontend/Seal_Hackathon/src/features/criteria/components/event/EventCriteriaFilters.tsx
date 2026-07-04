import type { BooleanFilterValue } from "@/types/criteria.types";
import { MenuItem, TextField } from "@mui/material";
import { criteriaTextFieldSx } from "../../constants/criteriaUi";

type EventCriteriaFiltersProps = {
    activeFilter: BooleanFilterValue;
    technicalFilter: BooleanFilterValue;
    onActiveFilterChange: (value: BooleanFilterValue) => void;
    onTechnicalFilterChange: (value: BooleanFilterValue) => void;  
};

export function EventCriteriaFilters({
    activeFilter,
    technicalFilter,
    onActiveFilterChange,
    onTechnicalFilterChange,
}: EventCriteriaFiltersProps) {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TextField
                select
                label="Active"
                value={activeFilter}
                onChange={(event) => onActiveFilterChange(event.target.value as BooleanFilterValue)}
                size="small"
                sx={criteriaTextFieldSx}
            >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="TRUE">Active only</MenuItem>
                <MenuItem value="FALSE">Inactive only</MenuItem>
            </TextField>
            
            <TextField
                select
                label="Type"
                value={technicalFilter}
                onChange={(event) =>
                    onTechnicalFilterChange(event.target.value as BooleanFilterValue)
                }
                size="small"
                sx={criteriaTextFieldSx}
            >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="TRUE">Technical</MenuItem>
                <MenuItem value="FALSE">Soft / subjective</MenuItem>
            </TextField>
        </div>
    );
}

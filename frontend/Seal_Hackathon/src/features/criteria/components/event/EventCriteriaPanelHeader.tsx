import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Button } from "@mui/material";

import { criteriaButtonSx } from "@/features/criteria/constants/criteriaUi";

type EventCriteriaPanelHeaderProps = {
    title: string;
    subtitle: string;
    canEdit: boolean;
    onRefresh: () => void;
    onCreate: () => void;
};

export function EventCriteriaPanelHeader({
    title,
    subtitle,
    canEdit,
    onRefresh,
    onCreate,
}: EventCriteriaPanelHeaderProps) {
    return (
        <div className="border-b border-slate-100 px-7 py-5 dark:border-slate-700">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                    {title}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={onRefresh}
                    sx={criteriaButtonSx}
                >
                    Refresh
                </Button>

                {canEdit && (
                    <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={onCreate}
                    sx={criteriaButtonSx}
                    >
                    Add Criteria
                    </Button>
                )}
                </div>
            </div>
        </div>
    );
}

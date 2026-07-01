import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { activeEventApi } from "../hooks/useCoordinatorEventQueries";

const ACTIVE_STATUSES = ["ONGOING", "JUDGING", "PUBLISHED", "COMPLETED"];

export const CoordinatorAwardsRedirectPage = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["events-for-awards-redirect"],
        queryFn: () => activeEventApi.getAllEvents({ page: 0, size: 100 }),
        staleTime: 60_000,
    });

    useEffect(() => {
        if (isLoading) return;

        if (isError || !data) {
            navigate("/coordinator/events", { replace: true });
            return;
        }

        const events = data?.content ?? data ?? [];
        const eventList = Array.isArray(events) ? events : [];

        const activeEvent = eventList.find((e: any) =>
            ACTIVE_STATUSES.includes(e.status?.toUpperCase?.())
        );

        if (activeEvent) {
            navigate(`/coordinator/events/${activeEvent.id}/awards`, { replace: true });
        } else if (eventList.length > 0) {
            navigate(`/coordinator/events/${eventList[0].id}/awards`, { replace: true });
        } else {
            navigate("/coordinator/events", { replace: true });
        }
    }, [data, isLoading, isError, navigate]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <CircularProgress />
            <p className="text-sm font-semibold text-slate-500">
                Finding active event for awards...
            </p>
        </div>
    );
};

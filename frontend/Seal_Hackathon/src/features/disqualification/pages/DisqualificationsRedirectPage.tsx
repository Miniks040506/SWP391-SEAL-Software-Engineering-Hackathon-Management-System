import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/api/event.api";

const ACTIVE_STATUSES = ["ONGOING", "JUDGING"];

export const DisqualificationsRedirectPage = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["events-for-disqualifications-redirect"],
        queryFn: () => eventApi.getAllEvents({ page: 0, size: 100 }),
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

        const activeEvent = eventList.find((e: { id: string; status: string }) =>
            ACTIVE_STATUSES.includes(e.status?.toUpperCase?.())
        );

        if (activeEvent) {
            navigate(`/coordinator/events/${activeEvent.id}/disqualifications`, { replace: true });
        } else if (eventList.length > 0) {
            navigate(`/coordinator/events/${eventList[0].id}/disqualifications`, { replace: true });
        } else {
            navigate("/coordinator/events", { replace: true });
        }
    }, [data, isLoading, isError, navigate]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <CircularProgress />
            <p className="text-sm font-semibold text-slate-500">
                Finding active event...
            </p>
        </div>
    );
};

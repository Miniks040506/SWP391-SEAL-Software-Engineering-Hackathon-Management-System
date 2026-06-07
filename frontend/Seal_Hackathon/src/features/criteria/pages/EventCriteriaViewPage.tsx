import { Alert, Button, CircularProgress } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate, useParams } from "react-router-dom";
import type { UUID } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { criteriaApi, eventApi, roundApi } from "@/api";
import { EventCriteriaReadonlyList } from "../components/event/EventCriteriaReadonlyList";
import { useMemo } from "react";

export function EventCriteriaViewPage({ mode }: { mode?: "EVENT" | "ROUND" }) {
    const navigate = useNavigate();
    const { eventId, roundId } = useParams<{ eventId: UUID; roundId: UUID }>();
    const resolvedMode = mode ?? (roundId ? "ROUND" : "EVENT");
    
    const eventQuery = useQuery({
        queryKey: ["criteria-view-event", eventId],
        queryFn: () => eventApi.getEventById(eventId as UUID),
        enabled: resolvedMode === "EVENT" && Boolean(eventId),
    });
    
    const roundsQuery = useQuery({
        queryKey: ["criteria-view-rounds", eventId],
        queryFn: () => roundApi.getRoundsByEvent(eventId as UUID),
        enabled: resolvedMode === "EVENT" && Boolean(eventId),
    });

    const roundQuery = useQuery({
        queryKey: ["criteria-view-round", roundId],
        queryFn: () => roundApi.getRoundById(roundId as UUID),
        enabled: resolvedMode === "ROUND" && Boolean(roundId),
    });
    
    const criteriaQuery = useQuery({
        queryKey: ["criteria-readonly", resolvedMode, eventId, roundId],
        queryFn: () => 
            resolvedMode === "ROUND"
                ? criteriaApi.getCriteriaByRound(roundId as UUID)
                : criteriaApi.getEventCriteria(eventId as UUID, { isActive: true }),
        enabled: resolvedMode === "ROUND" ? Boolean(roundId) : Boolean(eventId),
    })
    
    const roundNameById = useMemo(
        () => new Map((roundsQuery.data ?? []).map((round) => [round.id, round.name])),
        [roundsQuery.data],  
    );
    
    const isLoading = 
        criteriaQuery.isLoading || eventQuery.isLoading || roundQuery.isLoading;
        
    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }
    
    if (criteriaQuery.isError || eventQuery.isError || roundQuery.isError) {
        return (
            <Alert severity="error">
                Failed to load criteria.
            </Alert>
        )
    }
    
    return (
        <div className="space-y-6 p-6">
            <div>
                <Button
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 1, textTransform: "none", fontWeight: 800 }}
                >
                    Back
                </Button>
                
                <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    {resolvedMode === "ROUND" ? "Round Criteria" : "Event Criteria"}
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    {resolvedMode === "ROUND"
                        ? `${roundQuery.data?.name ?? "Selected round"} · Judge and Coordinator read-only view`
                        : `${eventQuery.data?.name ?? "Selected event"} · Coordinator and Judge read-only view`}
                </p>
            </div>
            
            <EventCriteriaReadonlyList 
                criteria={criteriaQuery.data ?? []}
                roundNameById={resolvedMode === "EVENT" ? roundNameById : undefined}
            />
        </div>
    );
}
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CodeIcon from "@mui/icons-material/Code";
import { CircularProgress, Pagination } from "@mui/material";
import { EventCard } from "@/features/events/components/EventCard";
import { usePublicEventsQuery } from "@/features/events/hooks/usePublicEventQueries";
import {
  publicEventsFilterSchema,
  type PublicEventsFilterValues,
} from "@/features/events/schemas/publicEvent.schema";
import type { EventSummaryResponse } from "@/types/event.types";

const seasons: PublicEventsFilterValues["season"][] = [
  "All",
  "SPRING",
  "SUMMER",
  "FALL",
];

export function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () =>
      publicEventsFilterSchema.parse({
        season: searchParams.get("season") || "All",
        page: searchParams.get("page") || "1",
        size: searchParams.get("size") || "6",
      }),
    [searchParams],
  );

  const [activeSeason, setActiveSeason] = useState(filters.season);

  const eventsQuery = usePublicEventsQuery({
    season: activeSeason === "All" ? undefined : activeSeason,
    page: filters.page - 1,
    size: filters.size,
  });

  const events = eventsQuery.data?.content ?? [];
  const pageCount = eventsQuery.data?.totalPages ?? 0;

  const handleSeasonChange = (season: PublicEventsFilterValues["season"]) => {
    setActiveSeason(season);

    setSearchParams((current) => {
      current.set("season", season);
      current.set("page", "1");
      return current;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((current) => {
      current.set("page", String(page));
      return current;
    });

    document
      .getElementById("seasonal-rounds")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectEvent = (event: EventSummaryResponse) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <section className="relative space-y-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-10 text-center md:p-20">
        <div className="absolute left-0 top-0 h-1 w-full bg-blue-500" />

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <CodeIcon style={{ fontSize: 24 }} className="text-blue-500" />
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Build. Compete.{" "}
            <span className="font-bold text-blue-500">Innovate.</span>
          </h1>

          <p className="text-lg leading-relaxed text-gray-500">
            The ultimate software engineering challenge for FPT students.
            <br className="hidden md:block" />
            Turn your ideas into real-world technical solutions.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-6">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("seasonal-rounds")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-black active:scale-95"
          >
            Explore Now
          </button>

          <button
            type="button"
            onClick={() => navigate("/standings")}
            className="rounded-lg border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            View Standings
          </button>
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </section>

      <div id="seasonal-rounds" className="space-y-8 scroll-mt-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <AutoAwesomeIcon style={{ fontSize: 20 }} className="text-blue-500" />

            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Seasonal Events
            </h2>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1">
            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => handleSeasonChange(season)}
                className={[
                  "rounded-md px-4 py-1.5 text-sm font-semibold transition-all",
                  activeSeason === season
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                ].join(" ")}
              >
                {season === "All"
                  ? "All"
                  : season.charAt(0) + season.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {eventsQuery.isLoading && (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        )}

        {eventsQuery.isError && (
          <div className="py-20 text-center text-sm font-bold text-rose-500">
            Cannot load events.
          </div>
        )}

        {!eventsQuery.isLoading && events.length === 0 && (
          <div className="py-20 text-center text-sm font-bold uppercase tracking-widest text-gray-400">
            No events found.
          </div>
        )}

        {events.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={handleSelectEvent}
              />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination
              count={pageCount}
              page={filters.page}
              onChange={(_, value) => handlePageChange(value)}
              variant="outlined"
              shape="rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Pagination from '@mui/material/Pagination';
import { EventCard } from '../components/EventCard';
import { EVENTS } from '../mocks/events.mock';
import type { Event } from '@/types/event.types';

const SEASONS = ['All', 'Spring', 'Summer', 'Fall'] as const;
type Season = typeof SEASONS[number];

const PAGE_SIZE = 6; // number of events per page

export const EventsPage = () => {
  const navigate = useNavigate();
  const [activeSeason, setActiveSeason] = useState<Season>('All');
  const [page, setPage] = useState(1);

  const filteredEvents: Event[] = useMemo(
    () => (activeSeason === 'All' ? EVENTS : EVENTS.filter((e) => e.season === activeSeason)),
    [activeSeason],
  );

  // Reset to page 1 whenever season filter changes
  const handleSeasonChange = (season: Season) => {
    setActiveSeason(season);
    setPage(1);
  };

  const pageCount = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExploreNow = () => {
    document.getElementById('seasonal-rounds')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectEvent = (event: Event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-10 md:p-20 text-center space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
        <div className="mx-auto w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
          <CodeIcon style={{ fontSize: 24 }} className="text-blue-500" />
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Build. Compete. <span className="text-blue-500 font-bold">Innovate.</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            The ultimate software engineering challenge for FPT students.
            <br className="hidden md:block" />
            Turn your groundbreaking ideas into real-world technical solutions.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-6">
          <button
            onClick={handleExploreNow}
            className="inline-flex items-center gap-2 px-7 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-lg active:scale-95"
          >
            Explore Now
          </button>
          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all">
            Learn More
          </button>
        </div>
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </section>

      {/* Event list + season filter */}
      <div id="seasonal-rounds" className="space-y-8 scroll-mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <AutoAwesomeIcon style={{ fontSize: 20 }} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Seasonal Events</h2>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSeasonChange(s)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  activeSeason === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={handleSelectEvent} />
          ))}
        </div>

        {/* Pagination - only shown when there are multiple pages */}
        {pageCount > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                document.getElementById('seasonal-rounds')?.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="outlined"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#2563eb' },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
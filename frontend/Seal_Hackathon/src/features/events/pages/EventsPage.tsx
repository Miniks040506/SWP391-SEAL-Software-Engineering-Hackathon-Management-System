import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EVENTS } from '../mocks/events.mock';
import type { Event } from '@/types/event.types';

const SEASONS = ['All', 'Spring', 'Summer', 'Fall'] as const;
type Season = typeof SEASONS[number];

export const EventsPage = () => {
  const navigate = useNavigate();
  const [activeSeason, setActiveSeason] = useState<Season>('All');

  const filteredEvents: Event[] = useMemo(() => (
      activeSeason === 'All' ? EVENTS : EVENTS.filter(
        e => e.season === activeSeason
      )
    ),
    [activeSeason],
  );

  // receive card -> move to /events/:id
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
            The ultimate software engineering challenge for FPT students.{' '}
            <br className="hidden md:block" />
            Turn your groundbreaking ideas into real-world technical solutions.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-6">
          <button className="px-8 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-lg active:scale-95">
            Explore Now
          </button>
          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all">
            Learn More
          </button>
        </div>
        {/* Subtle dot-grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </section>

      {/* Event list + season filter */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <AutoAwesomeIcon style={{ fontSize: 20 }} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Seasonal Rounds</h2>
          </div>

          {/* Season filter pill */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {SEASONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  activeSeason === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Event cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => handleSelectEvent(event)}
              className="group cursor-pointer bg-white border border-gray-200 hover:border-blue-400 hover:shadow-xl rounded-xl p-7 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-5">
                <StatusBadge status={event.status} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{event.season}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">
                {event.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">{event.description}</p>
              <div className="mt-auto flex items-center justify-between text-xs text-gray-400 font-semibold pt-5 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <AccessTimeIcon style={{ fontSize: 13 }} className="text-blue-500" />
                  <span>{event.startDate}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  Details <ChevronRightIcon style={{ fontSize: 14 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

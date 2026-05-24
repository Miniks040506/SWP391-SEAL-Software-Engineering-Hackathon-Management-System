import React, { useState, useMemo } from 'react';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CampaignIcon from '@mui/icons-material/Campaign';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CodeIcon from '@mui/icons-material/Code';
import PublicIcon from '@mui/icons-material/Public';
import MailIcon from '@mui/icons-material/Mail';

// --- Mock Data ---
const EVENTS: any[] = [
  {
    id: 'seal-spring-24',
    title: 'SEAL Hackathon Spring 2024',
    season: 'Spring',
    status: 'Ongoing',
    registrationOpen: false,
    description: 'Conquer software engineering challenges and find innovative digital solutions for modern problems.',
    startDate: 'Mar 15, 2024',
    endDate: 'Mar 20, 2024',
    tracks: [
      { name: 'Web Development', desc: 'Building scalable modern web applications with cutting-edge tech.' },
      { name: 'Mobile App', desc: 'Creating seamless and intuitive mobile experiences.' },
      { name: 'AI & Machine Learning', desc: 'Implementing intelligent algorithms and data models.' },
    ],
    prizes: [
      { rank: 'Champion', value: '$1,000' },
      { rank: 'Runner Up', value: '$600' },
      { rank: 'Third Place', value: '$300' },
    ],
    announcements: [
      { date: '2h ago', text: 'Final round scoring criteria have been updated.' },
      { date: '1d ago', text: 'Technical workshop recordings are now available on the portal.' },
    ],
  },
  {
    id: 'seal-summer-24',
    title: 'SEAL Hackathon Summer 2024',
    season: 'Summer',
    status: 'Upcoming',
    registrationOpen: true,
    description: 'Integrated competition for Smart City solutions and Software innovation.',
    startDate: 'Jun 20, 2024',
    endDate: 'Jun 25, 2024',
    tracks: [
      { name: 'Cybersecurity', desc: 'Secure software development and vulnerability mitigation.' },
      { name: 'Cloud Computing', desc: 'Serverless solutions and infrastructure as code.' },
    ],
    prizes: [{ rank: 'Champion', value: '$1,200' }],
    announcements: [],
  },
  {
    id: 'seal-fall-23',
    title: 'SEAL Hackathon Fall 2023',
    season: 'Fall',
    status: 'Ended',
    registrationOpen: false,
    description: 'Successfully concluded with over 60 teams and hundreds of participants.',
    startDate: 'Oct 10, 2023',
    endDate: 'Oct 15, 2023',
    tracks: [{ name: 'Fintech', desc: 'Innovation in the financial technology sector.' }],
    prizes: [],
    announcements: [],
  },
];

const RANKINGS: any[] = [
  { rank: 1, team: 'Tech Wizards',  members: 'John Doe, Jane Smith',    score: 95.5, track: 'Web Development',       round: 'Final' },
  { rank: 2, team: 'Code Ninjas',   members: 'Alex Lee, Bob Brown',     score: 92.0, track: 'Web Development',       round: 'Final' },
  { rank: 3, team: 'AI Explorers',  members: 'Alice Wong, David Tan',   score: 88.5, track: 'AI & Machine Learning', round: 'Final' },
  { rank: 4, team: 'Skyline Team',  members: 'Chris Evans, Sarah Park', score: 85.0, track: 'Mobile App',            round: 'Preliminary' },
  { rank: 5, team: 'Byte Me',       members: 'Lucas Gray, Mia Chen',    score: 84.2, track: 'Web Development',       round: 'Preliminary' },
];

// --- Utility Components ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Upcoming: 'text-blue-600 bg-blue-50 border border-blue-100',
    Ongoing:  'text-white bg-blue-500 border border-blue-600',
    Ended:    'text-gray-400 bg-gray-50 border border-gray-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm ${styles[status] ?? styles.Ended}`}>
      {status.toUpperCase()}
    </span>
  );
};

// --- Screen 1: Event Explorer ---
const EventExplorer = ({ onSelectEvent }: { onSelectEvent: (event: any) => void }) => {
  const [activeSeason, setActiveSeason] = useState('All');

  const filteredEvents = useMemo(
    () => (activeSeason === 'All' ? EVENTS : EVENTS.filter(e => e.season === activeSeason)),
    [activeSeason],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
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
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </section>

      {/* Seasonal Competitions Grid */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <AutoAwesomeIcon style={{ fontSize: 20 }} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Seasonal Rounds</h2>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['All', 'Spring', 'Summer', 'Fall'].map(s => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="group cursor-pointer bg-white border border-gray-200 hover:border-blue-400 hover:shadow-xl rounded-xl p-7 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-5">
                <StatusBadge status={event.status} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{event.season}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">{event.title}</h3>
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

// --- Screen 2: Event Detail ---
const BASE_ROADMAP_STEPS = [
  { phase: 'Phase 1', title: 'Technical Proposal'    },
  { phase: 'Phase 2', title: 'Agile Coding Marathon' },
  { phase: 'Phase 3', title: 'Grand Finale Pitch'    },
];

const EventDetail = ({ event, onBack }: { event: any; onBack: () => void }) => {
  if (!event) return null;

  // Ended → all blue | Ongoing → phase 1 only | Upcoming → none
  const roadmapSteps = useMemo(
    () =>
      BASE_ROADMAP_STEPS.map((step, index) => ({
        ...step,
        active:
          event.status === 'Ended'   ? true :
          event.status === 'Ongoing' ? index === 0 :
          false,
      })),
    [event.status],
  );

  const metaItems = [
    { label: 'Start Date', val: event.startDate, icon: EventIcon },
    { label: 'Venue',      val: 'FPT Uni HCM',   icon: LocationOnIcon },
    { label: 'Audience',   val: 'SE Faculty',     icon: GroupIcon },
    { label: 'Awards',     val: 'Certified',      icon: WorkspacePremiumIcon },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} /> Back to dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={event.status} />
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                event.registrationOpen
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-gray-400 bg-gray-50 border-gray-100'
              }`}>
                {event.registrationOpen ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
            <p className="text-gray-600 text-base leading-relaxed">{event.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {metaItems.map(item => (
                <div key={item.label} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-white transition-all">
                  <item.icon style={{ fontSize: 18 }} className="text-blue-500 mb-3" />
                  <span className="text-xs text-gray-400 block uppercase font-bold tracking-widest mb-1">{item.label}</span>
                  <span className="text-gray-800 font-bold text-sm truncate block">{item.val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Roadmap */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-2">
              <AccessTimeIcon style={{ fontSize: 16 }} className="text-blue-500" /> Event Roadmap
            </h2>
            <div className="relative space-y-12 ml-3 border-l border-gray-100">
              {roadmapSteps.map(step => (
                <div key={step.phase} className="relative pl-10">
                  <div className={`absolute -left-[7.5px] top-1 w-3.5 h-3.5 rounded-full border-4 border-white shadow-md ${
                    step.active ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{step.phase}</span>
                    <h4 className="text-base font-bold text-gray-800">{step.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Competitive Tracks */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" /> Competitive Tracks
            </h3>
            <div className="space-y-4">
              {event.tracks.map((track: any) => (
                <div key={track.name} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm">{track.name}</h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{track.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Prize Structure */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" /> Prize Structure
            </h3>
            <div className="space-y-3">
              {event.prizes.map((prize: any) => (
                <div key={prize.rank} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{prize.rank}</span>
                  <span className="text-sm font-bold text-gray-800">{prize.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Announcements */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" /> Announcements
            </h3>
            <div className="space-y-6">
              {event.announcements.length > 0
                ? event.announcements.map((msg: any, i: number) => (
                    <div key={i} className="space-y-1 relative pl-4 border-l-2 border-blue-100">
                      <p className="text-xs text-gray-700 font-bold leading-snug">{msg.text}</p>
                      <span className="text-xs text-gray-400 font-bold uppercase">{msg.date}</span>
                    </div>
                  ))
                : <p className="text-xs text-gray-400 italic text-center py-4">No recent updates.</p>
              }
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- Screen 3: Leaderboard ---
const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-blue-500 text-white shadow-md',
  2: 'bg-gray-400 text-white',
  3: 'bg-amber-600 text-white',
};

const Leaderboard = ({ selectedEvent }: { selectedEvent: any }) => {
  const [filterTrack, setFilterTrack] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const top3 = RANKINGS.slice(0, 3);

  const filteredRankings = useMemo(
    () =>
      RANKINGS.filter(
        r =>
          (filterTrack === 'All' || r.track === filterTrack) &&
          r.team.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [filterTrack, searchTerm],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Podium */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
        {/* 2nd */}
        <div className="md:order-1 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl border-4 border-slate-50">2nd</div>
          <div className="space-y-1">
            <div className="font-bold text-gray-900 text-base">{top3[1]?.team}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{top3[1]?.track}</div>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-400">{top3[1]?.score.toFixed(1)}</div>
        </div>

        {/* 1st */}
        <div className="md:order-2 bg-white border-4 border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-5 relative shadow-2xl shadow-blue-100 transform md:-translate-y-6">
          <div className="absolute -top-4 px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">GOLD WINNER</div>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold text-3xl border-4 border-blue-100">1st</div>
          <div className="space-y-1">
            <div className="font-bold text-gray-900 text-xl">{top3[0]?.team}</div>
            <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">{top3[0]?.track}</div>
          </div>
          <div className="text-3xl font-mono font-bold text-blue-500">{top3[0]?.score.toFixed(1)}</div>
        </div>

        {/* 3rd */}
        <div className="md:order-3 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl border-4 border-amber-50">3rd</div>
          <div className="space-y-1">
            <div className="font-bold text-gray-900 text-base">{top3[2]?.team}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{top3[2]?.track}</div>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-600">{top3[2]?.score.toFixed(1)}</div>
        </div>
      </section>

      {/* Full standings table */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <VerifiedUserIcon style={{ fontSize: 18 }} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Public Standings</h2>
            </div>
            <p className="text-sm text-gray-400 font-medium">Verified results for {selectedEvent?.title}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon style={{ fontSize: 14 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-1 focus:ring-blue-400 w-56 shadow-inner"
              />
            </div>
            <select
              value={filterTrack}
              onChange={e => setFilterTrack(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none shadow-sm min-w-[140px]"
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Dev</option>
              <option value="AI & Machine Learning">AI & ML</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest w-20 text-center">Rank</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Team / Members</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Track</th>
                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Raw Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRankings.length > 0 ? (
                filteredRankings.map(team => (
                  <tr key={team.rank} className={`hover:bg-gray-50 transition-colors ${team.rank <= 3 ? 'bg-blue-50/10' : ''}`}>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm ${
                        RANK_BADGE_STYLES[team.rank] ?? 'text-gray-400 bg-gray-50'
                      }`}>
                        {team.rank}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-gray-900 tracking-tight">{team.team}</div>
                      <div className="text-xs text-gray-400 font-semibold italic mt-0.5">{team.members}</div>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-100 rounded">{team.track}</span>
                    </td>
                    <td className="p-5 text-right">
                      <span className="text-base font-mono font-bold text-gray-900 tracking-tight tabular-nums">{team.score.toFixed(1)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-24 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">No results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4 shadow-sm">
          <VerifiedUserIcon style={{ fontSize: 20 }} className="text-blue-500 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Transparency Protocol</p>
            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
              All results displayed are official. Scores have been verified through Inter-Rater Reliability (IRR) analysis to ensure absolute fairness across all judging panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
export const Home = () => {
  const [currentScreen, setCurrentScreen] = useState('listing');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setCurrentScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewRankings = () => {
    if (!selectedEvent) setSelectedEvent(EVENTS[0]);
    setCurrentScreen('rankings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-16 flex items-center shadow-sm">
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
            onClick={() => setCurrentScreen('listing')}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-3 transition-transform">S</div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-bold text-gray-900 tracking-tighter italic">SEAL</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hackathon System</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentScreen('listing')}
                className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${currentScreen === 'listing' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Explore
              </button>
              <button
                onClick={handleViewRankings}
                className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${currentScreen === 'rankings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Standings
              </button>
            </div>
            <div className="w-px h-5 bg-gray-200 mx-2 hidden sm:block" />
            <div className="flex items-center gap-3">
              <button className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Sign In
              </button>
              <button className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-md active:translate-y-0.5">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-280px)]">
        {currentScreen === 'listing'  && <EventExplorer onSelectEvent={handleSelectEvent} />}
        {currentScreen === 'detail'   && <EventDetail event={selectedEvent} onBack={() => setCurrentScreen('listing')} />}
        {currentScreen === 'rankings' && <Leaderboard selectedEvent={selectedEvent} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/40 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">S</div>
                <span className="text-lg font-bold text-gray-900 tracking-tighter italic">SEAL LEAGUE</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                The leading hackathon management platform for Software Engineering students. Empowering the next generation of innovators through competitive programming.
              </p>
              <div className="flex gap-4">
                <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-all text-gray-400 hover:text-blue-500">
                  <PublicIcon style={{ fontSize: 18 }} />
                </button>
                <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-all text-gray-400 hover:text-blue-500">
                  <MailIcon style={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-6">Products</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Seasonal Rounds</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Global Standings</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Team Registration</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Mentor Portal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-blue-600 transition-colors">System Status <OpenInNewIcon style={{ fontSize: 12 }} /></a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              <span>FPT University HCM</span>
              <span>PDP Department</span>
              <span>SE Faculty</span>
            </div>
            <div className="text-xs font-semibold text-gray-400">
              © 2024 SEAL LEAGUE PORTAL • v2.7 STABLE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
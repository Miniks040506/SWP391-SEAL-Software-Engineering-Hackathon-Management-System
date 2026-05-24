import React from 'react';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// --- Shared UI Components ---
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray', className = '' }: { children: React.ReactNode, variant?: string, className?: string }) => {
  const styles: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${styles[variant] || styles.gray} ${className}`}>{children}</span>;
};

// --- Main View Component ---
export const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* ROW 1: Quick Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <ShowChartIcon style={{ fontSize: 24 }}/>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest">Ongoing</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">SEAL Spring 2024</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Round: Final Pitch</p>
            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View Details <ChevronRightIcon style={{ fontSize: 16 }}/>
            </button>
          </div>
        </Card>
        
        <Card className="flex flex-col justify-center items-center text-center py-8 border-amber-200 bg-amber-50/30 hover:border-amber-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
            <HowToRegIcon style={{ fontSize: 24 }}/>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">14</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 mb-4">Pending Accounts</p>
          <button className="text-xs py-1.5 px-4 font-semibold rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all">Review in Hub</button>
        </Card>

        <Card className="flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2"><AccessTimeIcon style={{ fontSize: 16 }} className="text-blue-500"/> Upcoming Deadlines</h3>
          <div className="space-y-5 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
              <div>
                <p className="text-sm font-bold text-gray-800">Final Submissions Close</p>
                <p className="text-xs text-gray-500 mt-0.5">Today, 23:59 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
              <div>
                <p className="text-sm font-bold text-gray-800">Grading Window Ends</p>
                <p className="text-xs text-gray-500 mt-0.5">Tomorrow, 17:00 PM</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 2: Recent System Activity Trail */}
      <Card className="flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FormatListNumberedIcon style={{ fontSize: 20 }} className="text-blue-600"/> Recent Activity</h3>
          <button className="text-sm font-bold text-blue-600 hover:underline">View Full Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b border-gray-100">
              <tr>
                <th className="pb-3 px-2">Timestamp</th>
                <th className="pb-3 px-2">Actor</th>
                <th className="pb-3 px-2">Action Type</th>
                <th className="pb-3 px-2 w-1/2">Detail</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-gray-600 divide-y divide-gray-50">
              {[
                { time: '2024-05-16 14:32:01', actor: 'coord_mike', type: 'LOCK_SUBMISSION', detail: 'Locked submissions for round ID R-01.' },
                { time: '2024-05-16 12:15:44', actor: 'admin_sys', type: 'UPDATE_CRITERIA', detail: 'Changed weight of Code Quality to 40%.' },
                { time: '2024-05-15 09:00:12', actor: 'system_auto', type: 'NOTIFY', detail: 'Sent 150 emails to TARGET: PARTICIPANTS.' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 whitespace-nowrap">{log.time}</td>
                  <td className="py-3 px-2 text-blue-600 font-bold">{log.actor}</td>
                  <td className="py-3 px-2"><Badge variant="gray">{log.type}</Badge></td>
                  <td className="py-3 px-2 text-gray-800 font-sans">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROW 3: Dedicated Full-Width Team Management Hub */}
      <Card className="flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><GroupIcon style={{ fontSize: 20 }} className="text-blue-600"/> Team Management</h3>
          <button className="text-sm font-bold text-blue-600 hover:underline">Manage All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Tech Wizards', track: 'WEB DEV', status: 'APPROVED' },
            { name: 'AI Explorers', track: 'AI & ML', status: 'PENDING' },
            { name: 'Code Ninjas', track: 'MOBILE', status: 'APPROVED' },
          ].map((t, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 transition-all cursor-pointer">
              <div>
                <p className="text-base font-bold text-gray-900">{t.name}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">{t.track}</p>
              </div>
              <Badge variant={t.status === 'APPROVED' ? 'green' : 'amber'}>{t.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* ROW 4: Dedicated Full-Width System Control Panel */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-200">
          <SettingsIcon style={{ fontSize: 20 }} className="text-gray-500"/> System Control Panel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Sub-panel 1: Setup & Execution */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrackChangesIcon style={{ fontSize: 14 }} className="text-blue-500"/> Setup & Execution
            </h4>
            <ul className="space-y-1">
              <li><button className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Scoring Criteria</button></li>
              <li><button className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Judges & Assignments</button></li>
              <li><button className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Phase Locks (Submissions & Grading)</button></li>
            </ul>
          </div>

          {/* Sub-panel 2: Results & Communications */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CampaignIcon style={{ fontSize: 14 }} className="text-emerald-500"/> Results & Communications
            </h4>
            <ul className="space-y-1">
              <li><button className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex justify-between items-center">Results & Advancement <Badge variant="green" className="text-[8px]">Unified</Badge></button></li>
              <li><button className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Send Notifications</button></li>
              <li><button className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Data Exports (CSV/XLSX/RBL)</button></li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
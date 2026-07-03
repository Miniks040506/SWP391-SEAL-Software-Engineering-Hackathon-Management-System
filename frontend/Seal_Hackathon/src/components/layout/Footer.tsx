import PublicIcon from '@mui/icons-material/Public';
import MailIcon from '@mui/icons-material/Mail';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BottomBar from './BottomBar';

export const Footer = () => (
  <footer className="border-t border-gray-100 bg-gray-50/40 py-16 dark:border-slate-800 dark:bg-[#020617]">
    <div className="max-w-6xl mx-auto px-6">

      {/* 4-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <span className="text-md font-medium leading-relaxed text-gray-500 dark:text-slate-400 italic">SEAL LEAGUE</span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400">
            The leading hackathon management platform for Software Engineering students.
            Empowering the next generation of innovators through competitive programming.
          </p>
          <div className="flex gap-4">
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-all text-gray-400 hover:text-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-blue-400">
              <PublicIcon style={{ fontSize: 18 }} />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-all text-gray-400 hover:text-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-blue-400">
              <MailIcon style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Products */}
        <div>
          <h4 className="mb-6 text-sm font-bold text-gray-900 dark:text-slate-300">Products</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Seasonal Rounds</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Global Standings</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Team Registration</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Mentor Portal</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="mb-6 text-sm font-bold text-gray-900 dark:text-slate-300">Support</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Documentation</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Help Center</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Contact Us</a></li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                System Status <OpenInNewIcon style={{ fontSize: 12 }} />
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="mb-6 text-sm font-bold text-gray-900 dark:text-slate-300">Legal</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Privacy Policy</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Terms of Service</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Cookie Policy</a></li>
            <li><a href="#" className="transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">Compliance</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <BottomBar />

    </div>
  </footer>
);

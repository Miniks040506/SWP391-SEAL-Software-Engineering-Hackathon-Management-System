import React from 'react';
import PublicIcon from '@mui/icons-material/Public';
import MailIcon from '@mui/icons-material/Mail';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const Footer = () => (
  <footer className="border-t border-gray-100 bg-gray-50/40 py-16">
    <div className="max-w-6xl mx-auto px-6">

      {/* 4-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">

        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tighter italic">SEAL LEAGUE</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            The leading hackathon management platform for Software Engineering students.
            Empowering the next generation of innovators through competitive programming.
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

        {/* Products */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-6">Products</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Seasonal Rounds</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Global Standings</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Team Registration</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Mentor Portal</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-6">Support</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                System Status <OpenInNewIcon style={{ fontSize: 12 }} />
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
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

      {/* Bottom bar */}
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
);

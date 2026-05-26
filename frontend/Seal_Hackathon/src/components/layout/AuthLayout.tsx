import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';
import BottomBar from './BottomBar';


export const AuthLayout = () => (
  <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
    <Navbar />

    <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 min-h-[calc(100vh-280px)]">
      <Outlet />
    </main>
    
    <footer className="bg-gray-50/40 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <BottomBar />
      </div>
    </footer>
  </div>
);
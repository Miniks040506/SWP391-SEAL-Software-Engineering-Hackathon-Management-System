import React from "react";

const CURRENT_YEAR = new Date().getFullYear();

const BottomBar = () => {
  return (
    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        <span>FPT University HCM</span>
        <span>PDP Department</span>
        <span>SE Faculty</span>
      </div>
      <div className="text-xs font-semibold text-gray-400">© {CURRENT_YEAR} SEAL LEAGUE PORTAL</div>
    </div>
  );
};

export default BottomBar;

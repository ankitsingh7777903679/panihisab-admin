"use client";

import { Bars3Icon, MagnifyingGlassIcon, BellIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Image from "next/image";

export default function AdminHeader({ setIsSidebarOpen }) {
  const { user } = useAdminAuth();

  return (
    <header className="bg-[#0b1326]/90 backdrop-blur-xl border-x-0 border-t-0 border-b border-white/5 h-[88px] flex items-center justify-between px-8 z-30 sticky top-0 transition-all duration-200">
      <div className="flex items-center flex-1">
        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white lg:hidden p-2 rounded-md transition-colors mr-4">
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        {/* Search Bar matching screenshot */}
        <div className="hidden sm:flex items-center bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2.5 w-full max-w-[400px]">
          <MagnifyingGlassIcon className="h-4 w-4 text-slate-500 mr-3" />
          <input 
            type="text" 
            placeholder="Search system metrics..." 
            className="bg-transparent border-none outline-none text-[13px] text-white placeholder-slate-500 w-full font-mono"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6 ml-auto">
        {/* Icons */}
        <div className="flex items-center gap-5 text-slate-400">
          <button className="hover:text-white transition-colors">
            <BellIcon className="h-5 w-5" />
          </button>
          <button className="hover:text-white transition-colors">
            <Squares2X2Icon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Separator */}
        <div className="w-[1px] h-6 bg-white/10"></div>
        
        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors bg-slate-800 flex items-center justify-center">
             {/* Using a placeholder avatar since Alex Rivera image isn't local */}
             <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || "A"}</span>
          </div>
          <span className="text-[13px] font-mono font-medium text-slate-300 group-hover:text-white transition-colors hidden sm:block">
            {user?.name || "Alex Rivera"}
          </span>
        </div>
      </div>
    </header>
  );
}

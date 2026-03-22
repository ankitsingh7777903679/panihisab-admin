"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminHeader({ setIsSidebarOpen }) {
  const { user } = useAdminAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 shadow-sm">
      <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-900 lg:hidden p-2 rounded-md">
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="flex items-center ml-auto">
        <div className="text-right mr-3">
          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Super Admin</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0) || "A"}
        </div>
      </div>
    </header>
  );
}

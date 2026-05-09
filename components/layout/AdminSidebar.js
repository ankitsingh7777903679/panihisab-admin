"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPieIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  TruckIcon,
  DocumentDuplicateIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const nav = [
    { name: "Overview", href: "/dashboard", icon: ChartPieIcon },
    { name: "Vendors", href: "/vendors", icon: BuildingStorefrontIcon },
    { name: "Customers", href: "/customers", icon: UsersIcon },
    { name: "Deliveries", href: "/deliveries", icon: TruckIcon },
    { name: "All Bills", href: "/bills", icon: DocumentDuplicateIcon },
    { name: "Messages", href: "/messages", icon: EnvelopeIcon },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 text-slate-300 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full glass-panel border-r-0 border-y-0 border-l-0">
          <div className="h-16 flex items-center px-6 border-b border-white/5 bg-slate-900/50">
            <h1 className="text-xl font-bold tracking-widest uppercase text-sm text-white">
              Pani<span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Hisab</span>
            </h1>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-white/10 text-white rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative group ${
                    active ? "bg-white/5 text-white" : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  )}
                  <Icon className={`mr-3 h-5 w-5 transition-all duration-200 ${active ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-slate-500 group-hover:text-slate-300"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all duration-200 group">
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

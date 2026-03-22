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
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-300 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 bg-gray-950 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white tracking-widest uppercase text-sm">PaniHisab <span className="text-blue-500">Admin</span></h1>
          </div>
          <nav className="flex-1 px-3 py-6 space-y-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${active ? "text-blue-400" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 bg-gray-950 border-t border-gray-800">
            <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

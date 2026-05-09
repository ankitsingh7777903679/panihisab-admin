"use client";

import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function AllCustomers() {
  const { data: customersData, isLoading: loading } = useQuery({
    queryKey: ['adminCustomers'],
    queryFn: async () => {
      const res = await api.get("/api/admin/customers");
      return res.data.customers;
    }
  });

  const customers = customersData || [];

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading customers...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="glass-panel p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-white font-geist">All Customers</h1>
        <p className="text-[13px] text-slate-400 mt-1">Cross-platform customer directory.</p>
      </div>

      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Attached Vendor</th>
                <th className="px-6 py-4 text-right">Price/Can</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map(c => (
                <tr key={c._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-[13px]">{c.mobile}</td>
                  <td className="px-6 py-4 text-slate-400 max-w-xs truncate text-[13px]" title={c.address}>{c.address || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sky-400 font-semibold bg-sky-500/10 px-3 py-1.5 rounded-lg w-max border border-sky-500/20 text-[12px]">
                      <BuildingStorefrontIcon className="w-4 h-4" />
                      <span>{c.vendorId?.businessName || c.vendorId?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      ₹{c.pricePerCan}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No customers registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function AllBills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: billsData, isLoading: loading } = useQuery({
    queryKey: ['adminBills', month, year],
    queryFn: async () => {
      const res = await api.get(`/api/admin/bills?month=${month}&year=${year}`);
      return res.data.bills;
    }
  });

  const bills = billsData || [];

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading bills overview...</div>;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Filter bills by search and status only (month filtered by backend)
  const filteredBills = bills.filter(b => {
    const matchesSearch = !searchQuery || 
      b.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerId?.mobile?.includes(searchQuery) ||
      b.vendorId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPending = bills.reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0);
  const totalEarning = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="glass-panel p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-white font-geist">Platform Bills</h1>
        <p className="text-[13px] text-slate-400 mt-1">Cross-platform overview of all generated bills.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <h2 className="text-2xl font-bold text-white mt-1 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</h2>
        </div>
        <div className="glass-panel p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Pending Collection</p>
          <h2 className="text-2xl font-bold text-rose-400 mt-1 font-mono">₹{totalPending.toLocaleString('en-IN')}</h2>
        </div>
        <div className="glass-panel p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Total Earning</p>
          <h2 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">₹{totalEarning.toLocaleString('en-IN')}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search vendor, customer, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          {/* Month Selector */}
          <div className="relative min-w-[140px]">
            <select 
              value={`${month}-${year}`} 
              onChange={(e) => {
                const [m, y] = e.target.value.split('-');
                setMonth(Number(m));
                setYear(Number(y));
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const currentYear = new Date().getFullYear();
                return (
                  <option key={`${m}-${currentYear}`} value={`${m}-${currentYear}`}>
                    {monthNames[m-1]} {currentYear}
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        
        <div className="text-[13px] text-slate-500 font-medium px-1">
          Showing {filteredBills.length} of {bills.length} bills for {monthNames[month-1]} {year}
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Billing Month</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBills.map(b => (
                <tr key={b._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-sky-400">{b.vendorId?.businessName || b.vendorId?.name || "Unknown"}</td>
                  <td className="px-6 py-4 font-medium text-white">{b.customerId?.name || "Deleted"}</td>
                  <td className="px-6 py-4 text-center text-slate-400 font-medium text-[13px]">{monthNames[b.month - 1]} {b.year}</td>
                  <td className="px-6 py-4 text-center text-slate-500 font-mono text-[13px]">{b.totalCans} cans</td>
                  <td className="px-6 py-4 text-right font-extrabold text-white font-mono">₹{b.totalAmount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${b.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                    {searchQuery || statusFilter !== 'all' ? 'No bills match your filters.' : `No bills found for ${monthNames[month-1]} ${year}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

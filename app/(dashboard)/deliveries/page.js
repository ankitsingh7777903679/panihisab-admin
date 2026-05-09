"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function AllDeliveries() {
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  });

  const { data: deliveriesData, isLoading: loading } = useQuery({
    queryKey: ['adminDeliveries', selectedDate],
    queryFn: async () => {
      const res = await api.get(`/api/admin/deliveries?date=${selectedDate}`);
      return res.data.deliveries;
    }
  });

  const deliveries = deliveriesData || [];

  // No need to filter - backend already returns only selected date
  const filteredDeliveries = deliveries;

  // Navigate to previous/next date - fetch from backend
  const goToPreviousDate = () => {
    const dt = new Date(selectedDate);
    dt.setDate(dt.getDate() - 1);
    const prevDate = dt.toISOString().split('T')[0];
    setSelectedDate(prevDate);
  };

  const goToNextDate = () => {
    const dt = new Date(selectedDate);
    dt.setDate(dt.getDate() + 1);
    const nextDate = dt.toISOString().split('T')[0];
    setSelectedDate(nextDate);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Calculate total cans for selected date
  const totalCans = filteredDeliveries.reduce((sum, d) => sum + d.quantity, 0);

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading deliveries log...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="glass-panel p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-white font-geist">Deliveries Log</h1>
        <p className="text-[13px] text-slate-400 mt-1">View all deliveries by date.</p>
      </div>

      {/* Date Selector */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDate}
            className="p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/10"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-lg font-semibold text-white bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500/50 outline-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <button
            onClick={goToNextDate}
            className="p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/10"
          >
            <ChevronRightIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Quick Date Pills */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border-white/5'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              setSelectedDate(yesterday.toISOString().split('T')[0]);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
              selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border-white/5'
            }`}
          >
            Yesterday
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
          <span className="text-[13px] text-slate-400 font-medium">
            {formatDate(selectedDate)}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-slate-400">
              {filteredDeliveries.length} deliveries
            </span>
            <span className="text-[13px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Total: {totalCans} cans
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(d => (
                  <tr key={d._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-[13px]">
                      {new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-sky-400">{d.vendorId?.businessName || d.vendorId?.name || "Unknown"}</td>
                    <td className="px-6 py-4 font-medium text-white">{d.customerId?.name || "Deleted"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        {d.quantity} cans
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CalendarIcon className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-lg font-medium text-slate-300">No deliveries</p>
                      <p className="text-[13px] text-slate-500">No deliveries found for {formatDate(selectedDate)}.</p>
                    </div>
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

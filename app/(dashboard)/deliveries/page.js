"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function AllDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchDeliveries(selectedDate);
  }, [selectedDate]);

  const fetchDeliveries = async (date) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/deliveries?date=${date}`);
      setDeliveries(res.data.deliveries);
    } catch (e) { toast.error("Failed to load deliveries"); }
    finally { setLoading(false); }
  };

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

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading deliveries log...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries Log</h1>
        <p className="text-sm text-gray-500 mt-1">View all deliveries by date.</p>
      </div>

      {/* Date Selector */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDate}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-lg font-semibold text-gray-900 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={goToNextDate}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Quick Date Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yesterday
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {formatDate(selectedDate)}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {filteredDeliveries.length} deliveries
            </span>
            <span className="text-sm font-semibold text-blue-600">
              Total: {totalCans} cans
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(d => (
                  <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-700">{d.vendorId?.businessName || d.vendorId?.name || "Unknown"}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{d.customerId?.name || "Deleted"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                        {d.quantity} cans
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No deliveries logged yet.</td>
                </tr>
              )}
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <p className="text-lg font-medium text-gray-900 mb-1">No deliveries</p>
                  <p className="text-sm">No deliveries found for {formatDate(selectedDate)}.</p>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AllDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await api.get("/api/admin/deliveries");
        setDeliveries(res.data.deliveries);
      } catch (e) { toast.error("Failed to load deliveries"); }
      finally { setLoading(false); }
    };
    fetchDeliveries();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading deliveries log...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Recent Deliveries Log</h1>
        <p className="text-sm text-gray-500 mt-1">Cross-platform log of the last 100 deliveries.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deliveries.map(d => (
                <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">
                    <span className="font-medium">{new Date(d.date).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-700">{d.vendorId?.businessName || d.vendorId?.name || "Unknown"}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{d.customerId?.name || "Deleted"}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                      {d.quantity} cans
                    </span>
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No deliveries logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

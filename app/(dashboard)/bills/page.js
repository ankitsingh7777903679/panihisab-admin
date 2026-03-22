"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AllBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get("/api/admin/bills");
        setBills(res.data.bills);
      } catch (e) { toast.error("Failed to load bills"); }
      finally { setLoading(false); }
    };
    fetchBills();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading bills overview...</div>;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Platform Bills</h1>
        <p className="text-sm text-gray-500 mt-1">Cross-platform overview of all generated invariants.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Billing Month</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bills.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-700">{b.vendorId?.businessName || b.vendorId?.name || "Unknown"}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{b.customerId?.name || "Deleted"}</td>
                  <td className="px-6 py-4 text-center text-gray-600 font-medium">{monthNames[b.month - 1]} {b.year}</td>
                  <td className="px-6 py-4 text-center text-gray-500">{b.totalCans} cans</td>
                  <td className="px-6 py-4 text-right font-extrabold text-gray-900">₹{b.totalAmount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${b.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No bills generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

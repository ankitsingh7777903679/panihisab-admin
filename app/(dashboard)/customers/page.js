"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function AllCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/admin/customers");
        setCustomers(res.data.customers);
      } catch (e) {
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
        <p className="text-sm text-gray-500 mt-1">Cross-platform customer directory.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Attached Vendor</th>
                <th className="px-6 py-4 text-right">Price/Can</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{c.mobile}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={c.address}>{c.address || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-indigo-700 font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg w-max border border-indigo-100">
                      <BuildingStorefrontIcon className="w-4 h-4" />
                      <span>{c.vendorId?.businessName || c.vendorId?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ₹{c.pricePerCan}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No customers registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

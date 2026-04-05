"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { EyeIcon, NoSymbolIcon, CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get("/api/admin/vendors");
      setVendors(res.data.vendors);
    } catch (e) { toast.error("Failed to load vendors"); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this vendor?`)) return;
    try {
      await api.patch(`/api/admin/vendors/${id}`, { isActive: !currentStatus });
      toast.success("Vendor status updated");
      fetchVendors();
    } catch (e) { toast.error("Failed to update status"); }
  };

  const deleteVendor = async (id) => {
    if (!confirm("CRITICAL: Delete vendor and ALL associated data? This cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/vendors/${id}`);
      toast.success("Vendor deleted permanently");
      fetchVendors();
    } catch (e) { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading vendors...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered water suppliers.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Business / Vendor</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4 text-center">Customers</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendors.map(v => (
                <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {v.logoUrl ? (
                        <img src={v.logoUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {v.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{v.businessName || "N/A"}</p>
                        <p className="text-xs text-gray-500">{v.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">{v.mobile}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                      {v.customerCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {v.isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${v.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                        v.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {v.subscriptionStatus?.toUpperCase() || "UNKNOWN"}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {v.subscriptionStatus === 'trial' && v.trialEndsAt ? `T: ${new Date(v.trialEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'active' && v.subscriptionEndsAt ? `End: ${new Date(v.subscriptionEndsAt).toLocaleDateString()}` : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/vendors/${v._id}`} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="View Details">
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => toggleStatus(v._id, v.isActive)}
                      className={`inline-flex p-2 rounded-lg transition-colors ${v.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      title={v.isActive ? "Suspend" : "Activate"}
                    >
                      {v.isActive ? <NoSymbolIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteVendor(v._id)}
                      className="inline-flex p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

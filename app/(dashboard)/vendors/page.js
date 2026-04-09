"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { EyeIcon, NoSymbolIcon, CheckCircleIcon, TrashIcon, PlayIcon, CurrencyRupeeIcon, ArrowPathIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});

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

  const startTrial = async (id, name) => {
    if (!confirm(`Start 30-day free trial for ${name}?`)) return;
    setActionLoading({ ...actionLoading, [id]: 'trial' });
    try {
      const res = await api.post(`/api/admin/vendors/${id}/start-free-trial`);
      toast.success(res.data.message);
      fetchVendors();
    } catch (e) { 
      toast.error("Failed to start trial: " + (e.response?.data?.message || e.message)); 
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  const activatePaid = async (id, name) => {
    if (!confirm(`Activate PAID subscription for ${name}?\n\nAmount: ₹299\nDuration: 30 days`)) return;
    setActionLoading({ ...actionLoading, [id]: 'paid' });
    try {
      const res = await api.post(`/api/admin/vendors/${id}/start-paid-subscription`, {
        amount: 299,
        paymentMethod: 'manual',
        days: 30
      });
      toast.success(res.data.message);
      fetchVendors();
    } catch (e) { 
      toast.error("Failed to activate: " + (e.response?.data?.message || e.message)); 
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  const resetSub = async (id, name) => {
    if (!confirm(`⚠️ RESET subscription for ${name}?\n\nThis will clear all trial/paid dates!`)) return;
    setActionLoading({ ...actionLoading, [id]: 'reset' });
    try {
      const res = await api.post(`/api/admin/vendors/${id}/reset-subscription`);
      toast.success(res.data.message);
      fetchVendors();
    } catch (e) { 
      toast.error("Failed to reset: " + (e.response?.data?.message || e.message)); 
    } finally {
      setActionLoading({ ...actionLoading, [id]: null });
    }
  };

  // Filter vendors by search and status
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = !searchQuery || 
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mobile?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || v.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              {filteredVendors.map(v => (
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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        v.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                        v.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' :
                        v.subscriptionStatus === 'extra' ? 'bg-orange-100 text-orange-800' :
                        v.subscriptionStatus === 'pending' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {v.subscriptionStatus?.toUpperCase() || "FREE"}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {v.subscriptionStatus === 'trial' && v.trialEndsAt ? `Trial ends: ${new Date(v.trialEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'extra' && v.extraDaysEndsAt ? `Extra ends: ${new Date(v.extraDaysEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'active' && v.subscriptionEndsAt ? `Paid until: ${new Date(v.subscriptionEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'pending' || !v.trialEndsAt ? 'Unlimited free access' : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <Link href={`/vendors/${v._id}`} className="inline-flex p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="View Details">
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      
                      {/* Subscription Actions */}
                      {(!v.trialEndsAt || v.subscriptionStatus === 'expired') && (
                        <button
                          onClick={() => startTrial(v._id, v.name)}
                          disabled={actionLoading[v._id]}
                          className="inline-flex p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Start Free Trial"
                        >
                          {actionLoading[v._id] === 'trial' ? '...' : <PlayIcon className="w-5 h-5" />}
                        </button>
                      )}
                      
                      <button
                        onClick={() => activatePaid(v._id, v.name)}
                        disabled={actionLoading[v._id]}
                        className="inline-flex p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Activate Paid (₹299)"
                      >
                        {actionLoading[v._id] === 'paid' ? '...' : <CurrencyRupeeIcon className="w-5 h-5" />}
                      </button>
                      
                      <button
                        onClick={() => resetSub(v._id, v.name)}
                        disabled={actionLoading[v._id]}
                        className="inline-flex p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Reset Subscription"
                      >
                        {actionLoading[v._id] === 'reset' ? '...' : <ArrowPathIcon className="w-5 h-5" />}
                      </button>
                      
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      
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
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || statusFilter !== 'all' ? 'No vendors match your filters.' : 'No vendors found.'}
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

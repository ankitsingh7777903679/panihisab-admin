"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { EyeIcon, NoSymbolIcon, CheckCircleIcon, TrashIcon, PlayIcon, CurrencyRupeeIcon, ArrowPathIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function Vendors() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});

  const { data: vendorsData, isLoading: loading } = useQuery({
    queryKey: ['adminVendors'],
    queryFn: async () => {
      const res = await api.get("/api/admin/vendors");
      return res.data.vendors;
    }
  });

  const vendors = vendorsData || [];

  const toggleStatus = async (id, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this vendor?`)) return;
    try {
      await api.patch(`/api/admin/vendors/${id}`, { isActive: !currentStatus });
      toast.success("Vendor status updated");
      queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
    } catch (e) { toast.error("Failed to update status"); }
  };

  const deleteVendor = async (id) => {
    if (!confirm("CRITICAL: Delete vendor and ALL associated data? This cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/vendors/${id}`);
      toast.success("Vendor deleted permanently");
      queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
    } catch (e) { toast.error("Failed to delete"); }
  };

  const startTrial = async (id, name) => {
    if (!confirm(`Start 30-day free trial for ${name}?`)) return;
    setActionLoading({ ...actionLoading, [id]: 'trial' });
    try {
      const res = await api.post(`/api/admin/vendors/${id}/start-free-trial`);
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminVendors'] });
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

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading vendors...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-geist">Vendors Directory</h1>
          <p className="text-[13px] text-slate-400 mt-1">Manage all registered water suppliers.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-sm text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="relative">
             <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-sm text-white w-full sm:w-auto focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
             >
               <option value="all">All Status</option>
               <option value="trial">Trial</option>
               <option value="active">Paid Active</option>
               <option value="expired">Expired</option>
               <option value="pending">Free (Pending)</option>
             </select>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Business / Vendor</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4 text-center">Customers</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVendors.map(v => (
                <tr key={v._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {v.logoUrl ? (
                        <img src={v.logoUrl} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold border border-white/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          {v.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{v.businessName || "N/A"}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{v.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[13px] text-slate-300">{v.mobile}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-800 text-slate-300 border border-white/10">
                      {v.customerCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${v.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {v.isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        v.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        v.subscriptionStatus === 'trial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        v.subscriptionStatus === 'extra' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        v.subscriptionStatus === 'pending' ? 'bg-slate-800 text-slate-300 border-white/10' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                      {v.subscriptionStatus?.toUpperCase() || "FREE"}
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 mt-1.5">
                      {v.subscriptionStatus === 'trial' && v.trialEndsAt ? `Trial ends: ${new Date(v.trialEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'extra' && v.extraDaysEndsAt ? `Extra ends: ${new Date(v.extraDaysEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'active' && v.subscriptionEndsAt ? `Paid until: ${new Date(v.subscriptionEndsAt).toLocaleDateString()}` : ''}
                      {v.subscriptionStatus === 'pending' || !v.trialEndsAt ? 'Unlimited free access' : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <Link href={`/vendors/${v._id}`} className="inline-flex p-2 bg-slate-800 text-sky-400 hover:bg-slate-700 hover:text-sky-300 rounded-lg transition-colors border border-white/5" title="View Details">
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      
                      {/* Subscription Actions */}
                      {(!v.trialEndsAt || v.subscriptionStatus === 'expired') && (
                        <button
                          onClick={() => startTrial(v._id, v.name)}
                          disabled={actionLoading[v._id]}
                          className="inline-flex p-2 bg-slate-800 text-purple-400 hover:bg-slate-700 hover:text-purple-300 rounded-lg transition-colors border border-white/5 disabled:opacity-50"
                          title="Start Free Trial"
                        >
                          {actionLoading[v._id] === 'trial' ? '...' : <PlayIcon className="w-4 h-4" />}
                        </button>
                      )}
                      
                      <button
                        onClick={() => activatePaid(v._id, v.name)}
                        disabled={actionLoading[v._id]}
                        className="inline-flex p-2 bg-slate-800 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 rounded-lg transition-colors border border-white/5 disabled:opacity-50"
                        title="Activate Paid (₹299)"
                      >
                        {actionLoading[v._id] === 'paid' ? '...' : <CurrencyRupeeIcon className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => resetSub(v._id, v.name)}
                        disabled={actionLoading[v._id]}
                        className="inline-flex p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 rounded-lg transition-colors border border-white/5 disabled:opacity-50"
                        title="Reset Subscription"
                      >
                        {actionLoading[v._id] === 'reset' ? '...' : <ArrowPathIcon className="w-4 h-4" />}
                      </button>
                      
                      <div className="w-px h-5 bg-white/10 mx-1" />
                      
                      <button
                        onClick={() => toggleStatus(v._id, v.isActive)}
                        className={`inline-flex p-2 rounded-lg transition-colors border border-white/5 ${v.isActive ? 'bg-slate-800 text-orange-400 hover:bg-slate-700' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'}`}
                        title={v.isActive ? "Suspend" : "Activate"}
                      >
                        {v.isActive ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteVendor(v._id)}
                        className="inline-flex p-2 bg-slate-800 text-rose-400 hover:bg-slate-700 hover:text-rose-300 rounded-lg transition-colors border border-white/5" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
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

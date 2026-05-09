"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function VendorDetail() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [extending, setExtending] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [extendStatus, setExtendStatus] = useState("active");

  const { data, isLoading: loading } = useQuery({
    queryKey: ['adminVendorDetail', params.id],
    queryFn: async () => {
      const res = await api.get(`/api/admin/vendors/${params.id}`);
      return res.data;
    },
    onError: () => {
      toast.error("Failed to load vendor details");
      router.push("/vendors");
    }
  });

  const handleExtendSubscription = async (e) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to extend/activate this subscription for ${extendDays} days with status ${extendStatus}?`)) return;
    setExtending(true);
    try {
      const res = await api.patch(`/api/admin/vendors/${params.id}/subscription`, {
        days: extendDays,
        status: extendStatus
      });
      if (res.data.success) {
        toast.success(res.data.message || "Subscription updated successfully!");
        queryClient.invalidateQueries({ queryKey: ['adminVendorDetail', params.id] }); // Refresh data
      } else {
        toast.error(res.data.message || "Operation failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setExtending(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading details...</div>;
  if (!data) return null;

  const { vendor, metrics, recentDeliveries } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <button onClick={() => router.back()} className="flex items-center text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Back to Vendors
      </button>

      {/* Profile Header */}
      <div className="glass-panel p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border-b border-white/5"></div>
        {vendor.logoUrl ? (
          <img src={vendor.logoUrl} className="w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-xl z-10 bg-slate-800" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-800 text-sky-400 flex flex-col items-center justify-center font-bold text-3xl z-10 border-4 border-slate-900 shadow-xl shadow-sky-500/10">
            {vendor.name.charAt(0)}
          </div>
        )}
        <div className="z-10 text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-white tracking-tight font-geist">{vendor.businessName || "Unnamed Business"}</h1>
          <p className="text-lg text-slate-400 mt-1">{vendor.name}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-[13px] font-mono border border-white/5">📞 {vendor.mobile}</span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${vendor.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {vendor.isActive ? "ACTIVE" : "SUSPENDED"}
            </span>
            <span className="text-[13px] text-slate-500">Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Total Customers</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">{metrics.customersCount}</p>
        </div>
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Total Deliveries</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">{metrics.deliveriesCount}</p>
        </div>
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Total Unpaid Amount</p>
          <p className="text-3xl font-bold text-rose-400 mt-2 font-mono">₹{metrics.unpaidAmount}</p>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="glass-panel overflow-hidden border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-geist">Subscription & Access Control</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
            vendor.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            vendor.subscriptionStatus === 'trial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {vendor.subscriptionStatus?.toUpperCase() || "UNKNOWN"}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-[13px] font-bold text-slate-300 mb-3 uppercase tracking-wider">Current Subscription Details</h3>
            <ul className="space-y-3 text-[14px] text-slate-400">
              <li className="flex justify-between items-center py-2 border-b border-white/5"><strong className="font-medium text-slate-300">Plan:</strong> <span className="text-white capitalize">{vendor.plan || 'Free'}</span></li>
              {vendor.subscriptionStatus === 'trial' && (
                <li className="flex justify-between items-center py-2 border-b border-white/5"><strong className="font-medium text-slate-300">Trial Ends At:</strong> <span className="text-white font-mono">{vendor.trialEndsAt ? new Date(vendor.trialEndsAt).toLocaleString() : 'N/A'}</span></li>
              )}
              {vendor.subscriptionStatus === 'active' && (
                <li className="flex justify-between items-center py-2 border-b border-white/5"><strong className="font-medium text-slate-300">Subscription Ends At:</strong> <span className="text-white font-mono">{vendor.subscriptionEndsAt ? new Date(vendor.subscriptionEndsAt).toLocaleString() : 'N/A'}</span></li>
              )}
            </ul>
          </div>
          
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
            <h3 className="text-[13px] font-bold text-slate-300 mb-4 uppercase tracking-wider">Manually Update Plan</h3>
            <form onSubmit={handleExtendSubscription} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <input 
                  type="number" min="1" 
                  value={extendDays} onChange={e => setExtendDays(Number(e.target.value))}
                  className="w-24 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-sky-500/50 outline-none transition-colors"
                  placeholder="Days"
                  required
                />
                <select 
                  value={extendStatus} onChange={e => setExtendStatus(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none transition-colors"
                >
                  <option value="active">Active (Paid)</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button 
                type="submit" disabled={extending}
                className="w-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold py-2.5 rounded-xl text-[13px] tracking-wide hover:bg-sky-500/30 transition-all disabled:opacity-50"
              >
                {extending ? "Updating..." : "Update Subscription"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="glass-panel overflow-hidden border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-lg font-bold text-white font-geist">Recent Deliveries</h2>
        </div>
        <div className="overflow-x-auto">
          {recentDeliveries.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDeliveries.map(d => (
                  <tr key={d._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-[13px]">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-white">{d.customerId?.name || "Deleted Customer"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                        {d.quantity} cans
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">No recent deliveries found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

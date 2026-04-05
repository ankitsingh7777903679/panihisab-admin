"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function VendorDetail() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [extendStatus, setExtendStatus] = useState("active");

  useEffect(() => { fetchDetail(); }, [params.id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/api/admin/vendors/${params.id}`);
      setData(res.data);
    } catch (e) {
      toast.error("Failed to load vendor details");
      router.push("/vendors");
    } finally {
      setLoading(false);
    }
  };

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
        fetchDetail(); // Refresh data
      } else {
        toast.error(res.data.message || "Operation failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setExtending(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading details...</div>;
  if (!data) return null;

  const { vendor, metrics, recentDeliveries } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Vendors
      </button>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-blue-600 to-indigo-600 opacity-10"></div>
        {vendor.logoUrl ? (
          <img src={vendor.logoUrl} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md z-10" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex flex-col items-center justify-center font-bold text-3xl z-10 border-4 border-white shadow-md">
            {vendor.name.charAt(0)}
          </div>
        )}
        <div className="z-10 text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{vendor.businessName || "Unnamed Business"}</h1>
          <p className="text-lg text-gray-600 mt-1">{vendor.name}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">📞 {vendor.mobile}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${vendor.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {vendor.isActive ? "ACTIVE" : "SUSPENDED"}
            </span>
            <span className="text-sm text-gray-400">Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.customersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.deliveriesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Unpaid Amount</p>
          <p className="text-3xl font-bold text-rose-600 mt-2">₹{metrics.unpaidAmount}</p>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Subscription & Access Control</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            vendor.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
            vendor.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {vendor.subscriptionStatus?.toUpperCase() || "UNKNOWN"}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Current Subscription Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>Plan:</strong> {vendor.plan || 'Free'}</li>
              {vendor.subscriptionStatus === 'trial' && (
                <li><strong>Trial Ends At:</strong> {vendor.trialEndsAt ? new Date(vendor.trialEndsAt).toLocaleString() : 'N/A'}</li>
              )}
              {vendor.subscriptionStatus === 'active' && (
                <li><strong>Subscription Ends At:</strong> {vendor.subscriptionEndsAt ? new Date(vendor.subscriptionEndsAt).toLocaleString() : 'N/A'}</li>
              )}
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Manually Update Plan</h3>
            <form onSubmit={handleExtendSubscription} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input 
                  type="number" min="1" 
                  value={extendDays} onChange={e => setExtendDays(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  placeholder="Days"
                  required
                />
                <select 
                  value={extendStatus} onChange={e => setExtendStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="active">Active (Paid)</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button 
                type="submit" disabled={extending}
                className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {extending ? "Updating..." : "Update Subscription"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Deliveries</h2>
        </div>
        <div className="overflow-x-auto">
          {recentDeliveries.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDeliveries.map(d => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{d.customerId?.name || "Deleted Customer"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {d.quantity} cans
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">No recent deliveries found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

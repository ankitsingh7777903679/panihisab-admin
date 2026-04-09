"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RevenueChart from "@/components/charts/RevenueChart";
import DeliveryChart from "@/components/charts/DeliveryChart";
import { 
  BuildingStorefrontIcon, 
  UsersIcon, 
  TruckIcon, 
  CurrencyRupeeIcon,
  DocumentIcon,
  RocketLaunchIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemLoading, setSystemLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSystemStatus();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/stats");
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch admin stats", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await api.get("/api/admin/system-status");
      if (res.data.success) {
        setSystemStatus(res.data.system);
      }
    } catch (e) {
      console.error("Failed to fetch system status", e);
    }
  };

  const activateSystem = async () => {
    if (!confirm("Are you sure? This will start 30-day trial for ALL users immediately!")) return;
    
    setSystemLoading(true);
    try {
      const res = await api.post("/api/admin/activate-system", { trialDays: 30, extraDays: 10 });
      if (res.data.success) {
        alert(`✅ System activated! ${res.data.system.usersActivated} users got trial.`);
        fetchSystemStatus();
      }
    } catch (e) {
      alert("Failed to activate system: " + (e.response?.data?.message || e.message));
    } finally {
      setSystemLoading(false);
    }
  };

  const deactivateSystem = async () => {
    if (!confirm("⚠️ Emergency: This will give ALL users unlimited free access again!")) return;
    
    setSystemLoading(true);
    try {
      const res = await api.post("/api/admin/deactivate-system");
      if (res.data.success) {
        alert("⚠️ System deactivated - unlimited free mode active");
        fetchSystemStatus();
      }
    } catch (e) {
      alert("Failed to deactivate: " + (e.response?.data?.message || e.message));
    } finally {
      setSystemLoading(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500 font-medium">Loading platform data...</div>;

  const statsList = [
    { title: "Total Vendors", value: data?.stats?.totalVendors || 0, icon: <BuildingStorefrontIcon className="w-8 h-8 text-indigo-600" />, bg: "bg-indigo-50" },
    { title: "Active Customers", value: data?.stats?.totalCustomers || 0, icon: <UsersIcon className="w-8 h-8 text-blue-600" />, bg: "bg-blue-50" },
    { title: "All-Time Deliveries", value: data?.stats?.totalDeliveries || 0, icon: <TruckIcon className="w-8 h-8 text-emerald-600" />, bg: "bg-emerald-50" },
    { title: "Total Platform Revenue", value: `₹${data?.stats?.totalRevenue || 0}`, icon: <CurrencyRupeeIcon className="w-8 h-8 text-violet-600" />, bg: "bg-violet-50" },
    { title: "Unpaid Bills", value: data?.stats?.pendingBills || 0, icon: <DocumentIcon className="w-8 h-8 text-rose-600" />, bg: "bg-rose-50" },
  ];

  const isPending = systemStatus?.mode === 'pending';
  const isActive = systemStatus?.mode === 'active';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">High-level metrics across all vendors.</p>
      </div>

      {/* System Status Panel */}
      <div className={`rounded-2xl p-6 border-2 ${isPending ? 'bg-yellow-50 border-yellow-400' : 'bg-emerald-50 border-emerald-400'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isPending ? 'bg-yellow-200' : 'bg-emerald-200'}`}>
              {isPending ? (
                <ClockIcon className="w-8 h-8 text-yellow-700" />
              ) : (
                <CheckCircleIcon className="w-8 h-8 text-emerald-700" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                System Status: {isPending ? '🟡 PENDING (Unlimited Free)' : '🟢 ACTIVE (Trial Mode)'}
              </h2>
              <p className="text-sm text-gray-600">
                {isPending 
                  ? `Users have unlimited free access. ${systemStatus?.pendingUsersCount || 0} users waiting for trial start.`
                  : `Trial system active since ${new Date(systemStatus?.trialStartedAt).toLocaleDateString()}. All users on 30-day trial.`
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isPending && (
              <button
                onClick={activateSystem}
                disabled={systemLoading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                {systemLoading ? 'Activating...' : 'Start Trial for All Users'}
              </button>
            )}
            {isActive && (
              <button
                onClick={deactivateSystem}
                disabled={systemLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                <PauseCircleIcon className="w-5 h-5" />
                {systemLoading ? 'Deactivating...' : 'Emergency: Free Mode'}
              </button>
            )}
          </div>
        </div>
        
        {isPending && systemStatus?.pendingUsersCount > 0 && (
          <div className="mt-4 p-4 bg-yellow-100 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-800">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-semibold">
                {systemStatus.pendingUsersCount} users are in unlimited free mode
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Click "Start Trial for All Users" to begin 30-day trial + 10-day extra period for everyone.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsList.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`inline-flex p-3 rounded-xl ${s.bg} mb-4`}>
              {s.icon}
            </div>
            <p className="text-sm font-medium text-gray-500">{s.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Revenue Growth</h3>
          <RevenueChart data={data?.charts?.revenueByMonth} />
        </div>

        {/* Deliveries Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Deliveries (Last 7 Days)</h3>
          <DeliveryChart data={data?.charts?.deliveriesLast7Days} />
        </div>
      </div>

    </div>
  );
}

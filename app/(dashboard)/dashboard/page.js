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
  DocumentIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  if (loading) return <div className="p-8 animate-pulse text-gray-500 font-medium">Loading platform data...</div>;

  const statsList = [
    { title: "Total Vendors", value: data?.stats?.totalVendors || 0, icon: <BuildingStorefrontIcon className="w-8 h-8 text-indigo-600" />, bg: "bg-indigo-50" },
    { title: "Active Customers", value: data?.stats?.totalCustomers || 0, icon: <UsersIcon className="w-8 h-8 text-blue-600" />, bg: "bg-blue-50" },
    { title: "All-Time Deliveries", value: data?.stats?.totalDeliveries || 0, icon: <TruckIcon className="w-8 h-8 text-emerald-600" />, bg: "bg-emerald-50" },
    { title: "Total Platform Revenue", value: `₹${data?.stats?.totalRevenue || 0}`, icon: <CurrencyRupeeIcon className="w-8 h-8 text-violet-600" />, bg: "bg-violet-50" },
    { title: "Unpaid Bills", value: data?.stats?.pendingBills || 0, icon: <DocumentIcon className="w-8 h-8 text-rose-600" />, bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">High-level metrics across all vendors.</p>
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

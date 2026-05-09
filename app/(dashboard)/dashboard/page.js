"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import RevenueChart from "@/components/charts/RevenueChart";
import DeliveryChart from "@/components/charts/DeliveryChart";
import { 
  BuildingStorefrontIcon, 
  UsersIcon, 
  TruckIcon, 
  CurrencyRupeeIcon,
  DocumentIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Fetch Stats using React Query
  const { data: statsResponse, isLoading: loadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get("/api/admin/stats");
      return res.data;
    }
  });

  // Fetch System Status using React Query
  const { data: systemStatusResponse, isLoading: loadingSystem } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: async () => {
      const res = await api.get("/api/admin/system-status");
      return res.data;
    }
  });

  // Activate System Mutation
  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/admin/activate-system", { trialDays: 30, extraDays: 10 });
      return res.data;
    },
    onSuccess: (data) => {
      alert(`✅ System activated! ${data.system.usersActivated} users got trial.`);
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
    },
    onError: (error) => {
      alert("Failed to activate system: " + (error.response?.data?.message || error.message));
    }
  });

  // Deactivate System Mutation
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/admin/deactivate-system");
      return res.data;
    },
    onSuccess: () => {
      alert("⚠️ System deactivated - unlimited free mode active");
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
    },
    onError: (error) => {
      alert("Failed to deactivate: " + (error.response?.data?.message || error.message));
    }
  });

  const activateSystem = () => {
    if (!confirm("Are you sure? This will start 30-day trial for ALL users immediately!")) return;
    activateMutation.mutate();
  };

  const deactivateSystem = () => {
    if (!confirm("⚠️ Emergency: This will give ALL users unlimited free access again!")) return;
    deactivateMutation.mutate();
  };

  const loading = loadingStats || loadingSystem;
  const data = statsResponse?.success ? statsResponse : null;
  const systemStatus = systemStatusResponse?.success ? systemStatusResponse.system : null;
  const systemLoading = activateMutation.isPending || deactivateMutation.isPending;

  if (loading) return <div className="p-8 animate-pulse text-slate-400 font-medium">Loading platform data...</div>;

  // Dynamic Sparkline generator
  const Sparkline = ({ dataPoints, color = "#10b981" }) => {
    if (!dataPoints || dataPoints.length < 2) {
      return (
        <svg viewBox="0 0 100 30" className="w-full h-8 mt-2 overflow-visible opacity-50" preserveAspectRatio="none">
          <path d="M0,25 L100,25" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
        </svg>
      );
    }
    const maxX = dataPoints.length - 1;
    const minY = Math.min(...dataPoints);
    const maxY = Math.max(...dataPoints);
    const rangeY = maxY - minY === 0 ? 1 : maxY - minY;
    const scaleX = (index) => (index / maxX) * 100;
    const scaleY = (val) => 28 - ((val - minY) / rangeY) * 24;
    const pathD = dataPoints.map((val, index) => {
      const x = scaleX(index);
      const y = scaleY(val);
      if (index === 0) return `M${x},${y}`;
      const prevX = scaleX(index - 1);
      const prevY = scaleY(dataPoints[index - 1]);
      const cp1X = prevX + (x - prevX) / 2;
      return `C${cp1X},${prevY} ${cp1X},${y} ${x},${y}`;
    }).join(' ');
    return (
      <svg viewBox="0 0 100 30" className="w-full h-8 mt-2 overflow-visible" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  const trends = data?.trends || {};

  const statsList = [
    { id: 'vendors', title: "TOTAL VENDORS", value: data?.stats?.totalVendors || 0, icon: <BuildingStorefrontIcon className="w-5 h-5 text-slate-300" />, trend: "+12%", href: "/vendors", chartData: trends.vendors },
    { id: 'customers', title: "ACTIVE CUSTOMERS", value: data?.stats?.totalCustomers || 0, icon: <UsersIcon className="w-5 h-5 text-slate-300" />, trend: "+12%", href: "/customers", chartData: trends.customers },
    { id: 'deliveries', title: "TOTAL DELIVERIES", value: data?.stats?.totalDeliveries || 0, icon: <TruckIcon className="w-5 h-5 text-slate-300" />, trend: "+12%", href: "/deliveries", chartData: trends.deliveries },
    { id: 'revenue', title: "PLATFORM REVENUE", value: data?.stats?.totalRevenue ? `${data?.stats?.totalRevenue}` : "0", icon: <CurrencyRupeeIcon className="w-5 h-5 text-slate-300" />, trend: "+12%", href: "/bills", chartData: trends.revenue },
    { id: 'unpaid', title: "UNPAID BILLS", value: data?.stats?.pendingBills || 0, icon: <DocumentIcon className="w-5 h-5 text-slate-300" />, trend: "+12%", href: "/bills", chartData: trends.unpaidBills, color: "#f43f5e" },
  ];

  const isPending = systemStatus?.mode === 'pending';
  const isActive = systemStatus?.mode === 'active';

  // Helper to get active chart title
  const getChartTitle = () => {
    switch(selectedMetric) {
      case 'vendors': return 'Vendor Growth Trend';
      case 'customers': return 'Customer Acquisition';
      case 'deliveries': return 'Delivery Velocity';
      case 'unpaid': return 'Pending Payments Analysis';
      default: return 'Monthly Revenue Growth';
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* System Status Panel */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-xl flex-shrink-0 bg-emerald-500/10`}>
            {isPending ? (
              <ClockIcon className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                 <path d="M4 12V20M8 8V20M12 4V20M16 10V20M20 6V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-3 font-geist">
              System Status: {isPending ? 'Pending' : 'Active'}
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                TRIAL MODE
              </span>
            </h2>
            <p className="text-[13px] text-slate-400 mt-1">
              {isPending 
                ? `System pending trial activation. ${systemStatus?.pendingUsersCount || 0} users wait.`
                : `All operations nominal. Real-time telemetry is being synchronized with the cloud core.`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-6 py-2.5 bg-transparent border border-white/10 hover:bg-white/5 text-white text-[13px] font-medium rounded-lg transition-colors">
            View Logs
          </button>
          
          {isPending ? (
            <button
              onClick={activateSystem}
              disabled={systemLoading}
              className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white text-[13px] font-medium rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
            >
              {systemLoading ? 'Activating...' : 'Activate Trial'}
            </button>
          ) : (
            <button
              onClick={deactivateSystem}
              disabled={systemLoading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-[13px] font-medium rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mb-[1px]">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round"/>
              </svg>
              {systemLoading ? 'Pausing...' : 'Emergency Pause'}
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {statsList.map((s) => (
          <div 
            key={s.id} 
            onClick={() => setSelectedMetric(s.id)}
            className={`glass-panel p-5 flex flex-col justify-between group transition-all duration-300 cursor-pointer h-full border-2 ${selectedMetric === s.id ? 'border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.2)]' : 'border-white/5 hover:border-white/20'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`${selectedMetric === s.id ? 'text-sky-400' : 'text-slate-400'} transition-colors`}>
                {s.icon}
              </div>
              <div className="flex items-center text-[11px] font-bold text-emerald-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mr-1"><path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {s.trend}
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-mono font-medium text-slate-400 tracking-wider mb-1 uppercase">{s.title}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-[32px] font-bold text-white font-geist leading-none">{s.value}</p>
                <Link href={s.href} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                   <ArrowRightIcon className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
            
            <Sparkline dataPoints={s.chartData} color={s.color} />
          </div>
        ))}
      </div>

      {/* Dynamic Detail Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel p-8 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <BuildingStorefrontIcon className="w-32 h-32 text-white" />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <span className="text-sky-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">Intelligence Center</span>
              <h3 className="text-3xl font-bold text-white font-geist">{getChartTitle()}</h3>
              <p className="text-[13px] text-slate-400 mt-1 max-w-md">Real-time analytical telemetry processed via cloud core aggregation nodes.</p>
            </div>
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 backdrop-blur-sm">
              <button 
                onClick={() => setSelectedMetric('revenue')}
                className={`px-4 py-1.5 text-[11px] font-medium rounded-lg transition-all ${selectedMetric === 'revenue' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setSelectedMetric('deliveries')}
                className={`px-4 py-1.5 text-[11px] font-medium rounded-lg transition-all ${selectedMetric === 'deliveries' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Deliveries
              </button>
              <button 
                onClick={() => setSelectedMetric('vendors')}
                className={`px-4 py-1.5 text-[11px] font-medium rounded-lg transition-all ${selectedMetric === 'vendors' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Vendors
              </button>
            </div>
          </div>

          <div className="h-[400px] -ml-4">
            {selectedMetric === 'revenue' ? (
              <RevenueChart data={data?.charts?.revenueByMonth} />
            ) : selectedMetric === 'deliveries' ? (
              <DeliveryChart data={data?.charts?.deliveriesLast7Days} />
            ) : selectedMetric === 'vendors' || selectedMetric === 'customers' || selectedMetric === 'unpaid' ? (
              // Reusing DeliveryChart style for these trends since they are simple time-series
              <DeliveryChart 
                data={statsList.find(s => s.id === selectedMetric)?.chartData.map((val, i) => ({
                  date: `Point ${i+1}`,
                  count: val
                }))} 
              />
            ) : (
               <RevenueChart data={data?.charts?.revenueByMonth} />
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 text-[11px] font-mono text-slate-500">
        <p>© 2024 Panihisab Technical Luxury. All Nodes Operating.</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Protocol</a>
          <a href="#" className="hover:text-slate-300 transition-colors">System API</a>
        </div>
      </div>
    </div>
  );
}

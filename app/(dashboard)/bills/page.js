"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function AllBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchBills();
  }, [month, year]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/bills?month=${month}&year=${year}`);
      setBills(res.data.bills);
    } catch (e) { toast.error("Failed to load bills"); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading bills overview...</div>;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Filter bills by search and status only (month filtered by backend)
  const filteredBills = bills.filter(b => {
    const matchesSearch = !searchQuery || 
      b.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerId?.mobile?.includes(searchQuery) ||
      b.vendorId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPending = bills.reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0);
  const totalEarning = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Platform Bills</h1>
        <p className="text-sm text-gray-500 mt-1">Cross-platform overview of all generated bills.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-400">Total Revenue</p>
          <h2 className="text-lg font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-400">Pending Collection</p>
          <h2 className="text-lg font-bold text-red-500 mt-1">₹{totalPending.toLocaleString('en-IN')}</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-400">Total Earning</p>
          <h2 className="text-lg font-bold text-green-600 mt-1">₹{totalEarning.toLocaleString('en-IN')}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor, customer, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          
          {/* Month Selector */}
          <div className="relative">
            <select 
              value={`${month}-${year}`} 
              onChange={(e) => {
                const [m, y] = e.target.value.split('-');
                setMonth(Number(m));
                setYear(Number(y));
              }}
              className="pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const currentYear = new Date().getFullYear();
                return (
                  <option key={`${m}-${currentYear}`} value={`${m}-${currentYear}`}>
                    {monthNames[m-1]} {currentYear}
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredBills.length} of {bills.length} bills for {monthNames[month-1]} {year}
        </div>
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
              {filteredBills.map(b => (
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
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || statusFilter !== 'all' ? 'No bills match your filters.' : `No bills found for ${monthNames[month-1]} ${year}.`}
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

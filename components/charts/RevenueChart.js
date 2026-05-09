"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-slate-500 font-medium">No revenue data available</div>;
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
          <Tooltip 
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
            formatter={(value) => [`₹${value}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

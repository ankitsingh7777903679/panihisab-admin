"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeliveryChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-slate-500 font-medium">No delivery data available</div>;
  }

  const formatData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: item.count
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <Tooltip 
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#38bdf8" 
            strokeWidth={3}
            filter="url(#glow)"
            dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#38bdf8' }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#38bdf8', filter: "url(#glow)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

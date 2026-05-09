"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  TrashIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading: loading, refetch: fetchMessages } = useQuery({
    queryKey: ['adminMessages', filter],
    queryFn: async () => {
      const res = await api.get(`/api/contact?status=${filter === "all" ? "" : filter}`);
      return {
        messages: res.data.messages || [],
        stats: { total: res.data.total || 0, unread: res.data.unreadCount || 0 }
      };
    }
  });

  const messages = data?.messages || [];
  const stats = data?.stats || { total: 0, unread: 0 };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/contact/${id}`, { status });
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/api/contact/${id}`);
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      read: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
      replied: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      archived: "bg-slate-800 text-slate-400 border border-white/10",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${styles[status] || styles.new}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-geist flex items-center gap-3">
            <EnvelopeIcon className="w-7 h-7 text-sky-400" />
            Contact Messages
            {stats.unread > 0 && (
              <span className="bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] px-2 py-0.5 rounded-full font-bold ml-2">
                {stats.unread} new
              </span>
            )}
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">Manage messages from your website contact form</p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 text-sky-400 border border-white/5 rounded-xl hover:bg-slate-700 transition-colors text-sm font-semibold"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "sky", bg: "from-sky-500/10" },
          { label: "New", value: stats.unread, color: "rose", bg: "from-rose-500/10" },
          { label: "Read", value: messages.filter((m) => m.status === "read").length, color: "indigo", bg: "from-indigo-500/10" },
          { label: "Replied", value: messages.filter((m) => m.status === "replied").length, color: "emerald", bg: "from-emerald-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5 relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <div className={`text-3xl font-bold mt-2 font-mono text-${stat.color}-400`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="relative min-w-[160px]">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-sky-500/50 outline-none appearance-none transition-colors"
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-sky-500"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
          <EnvelopeIcon className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">No messages found</h3>
          <p className="text-[13px] text-slate-500 mt-2">
            {search ? "Try adjusting your search query." : "Messages will appear here when users contact you."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`glass-panel p-6 border-l-4 transition-all hover:bg-white/[0.03] ${
                message.status === "new" ? "border-l-rose-500" : "border-l-transparent"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{message.name}</h3>
                    {getStatusBadge(message.status)}
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-[13px] text-sky-400 hover:text-sky-300 transition-colors mb-2 block w-fit font-medium"
                  >
                    {message.email}
                  </a>
                  <p className="text-[12px] text-slate-500 mb-4 font-mono">
                    {message.subject} • {new Date(message.createdAt).toLocaleString("en-IN")}
                  </p>
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                    <p className="text-[14px] text-slate-300 whitespace-pre-wrap leading-relaxed">{message.message}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  {message.status === "new" && (
                    <button
                      onClick={() => updateStatus(message._id, "read")}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-sky-400 border border-white/5 rounded-xl hover:bg-slate-700 transition-colors text-[13px] font-semibold"
                      title="Mark as read"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark Read</span>
                    </button>
                  )}
                  {message.status !== "replied" && (
                    <button
                      onClick={() => updateStatus(message._id, "replied")}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-emerald-400 border border-white/5 rounded-xl hover:bg-slate-700 transition-colors text-[13px] font-semibold"
                      title="Mark as replied"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark Replied</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-rose-400 border border-white/5 rounded-xl hover:bg-slate-700 transition-colors text-[13px] font-semibold"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

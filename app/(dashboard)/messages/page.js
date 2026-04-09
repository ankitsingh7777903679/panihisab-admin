"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  TrashIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/contact?status=${filter === "all" ? "" : filter}`);
      setMessages(res.data.messages || []);
      setStats({ total: res.data.total || 0, unread: res.data.unreadCount || 0 });
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/contact/${id}`, { status });
      toast.success("Status updated");
      fetchMessages();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/api/contact/${id}`);
      toast.success("Message deleted");
      fetchMessages();
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
      new: "bg-red-100 text-red-700",
      read: "bg-blue-100 text-blue-700",
      replied: "bg-green-100 text-green-700",
      archived: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.new}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <EnvelopeIcon className="w-7 h-7 text-blue-600" />
            Contact Messages
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Manage messages from your website contact form</p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "blue" },
          { label: "New", value: stats.unread, color: "red" },
          { label: "Read", value: messages.filter((m) => m.status === "read").length, color: "blue" },
          { label: "Replied", value: messages.filter((m) => m.status === "replied").length, color: "green" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 p-4 rounded-xl border border-${stat.color}-100`}>
            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <EnvelopeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
          <p className="text-gray-500">
            {search ? "Try adjusting your search" : "Messages will appear here when users contact you"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`bg-white border rounded-xl p-5 ${
                message.status === "new" ? "border-red-200 bg-red-50/30" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{message.name}</h3>
                    {getStatusBadge(message.status)}
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-blue-600 hover:underline mb-1 block"
                  >
                    {message.email}
                  </a>
                  <p className="text-sm text-gray-500 mb-3">
                    {message.subject} • {new Date(message.createdAt).toLocaleString("en-IN")}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                </div>

                <div className="flex sm:flex-col gap-2">
                  {message.status === "new" && (
                    <button
                      onClick={() => updateStatus(message._id, "read")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                      title="Mark as read"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="sm:hidden">Mark Read</span>
                    </button>
                  )}
                  {message.status !== "replied" && (
                    <button
                      onClick={() => updateStatus(message._id, "replied")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                      title="Mark as replied"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="sm:hidden">Mark Replied</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="sm:hidden">Delete</span>
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

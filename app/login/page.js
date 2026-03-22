"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLogin() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAdminAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { mobile, password });
      if (res.data.success) {
        if (res.data.user.role !== 'admin') {
          toast.error("Access denied. Admins only.");
          return;
        }
        toast.success("Welcome Admin!");
        login(res.data.user, res.data.token);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gray-800 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">PaniHisab Admin</h2>
          <p className="text-gray-400 mt-1">Platform Management</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="text-gray-700 font-medium text-sm block mb-1">Admin Mobile</label>
            <input 
              type="tel" required
              value={mobile} onChange={e => setMobile(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="text-gray-700 font-medium text-sm block mb-1">Password</label>
            <input 
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-all mt-2"
          >
            {loading ? "Authenticating..." : "Admin Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

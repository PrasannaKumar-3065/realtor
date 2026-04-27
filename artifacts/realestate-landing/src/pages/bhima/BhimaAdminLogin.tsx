import React, { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BhimaLogo } from "@/components/bhima/BhimaNavbar";

export const BHIMA_AUTH_KEY = "bhima_admin_auth";
export function isBhimaAuthed(): boolean { return sessionStorage.getItem(BHIMA_AUTH_KEY) === "1"; }
export function setBhimaAuth(val: boolean) {
  if (val) sessionStorage.setItem(BHIMA_AUTH_KEY, "1");
  else sessionStorage.removeItem(BHIMA_AUTH_KEY);
}

export default function BhimaAdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        setBhimaAuth(true);
        setLocation("/bhima/admin/dashboard");
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <BhimaLogo size={56} />
            <h1 className="text-2xl font-black text-blue-950 mt-4">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Bhima Homes & Properties — Admin Panel</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input className="pl-9" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} required data-testid="bhima-admin-username" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input className="pl-9 pr-10" type={showPass ? "text" : "password"} placeholder="••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-4 rounded-2xl transition-colors disabled:opacity-60 text-base shadow-lg">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            <a href="/bhima" className="hover:text-blue-700 transition-colors">← Back to website</a>
          </p>
        </div>
      </div>
    </div>
  );
}

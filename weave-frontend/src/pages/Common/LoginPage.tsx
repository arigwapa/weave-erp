// Login page with username/password and role redirect.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

import GlassAuthLayout from "../../layout/GlassAuthLayout";
import InputGroup from "../../components/ui/InputGroup";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Checkbox from "../../components/ui/Checkbox";
import BrandLogo from "../../components/ui/BrandLogo";

const ROLE_HOME: Record<string, string> = {
  SuperAdmin: "/super-admin/dashboard",
  BranchAdmin: "/admin/dashboard",
  Admin: "/admin/dashboard",
  PLMManager: "/plm/dashboard",
  ProductionManager: "/production/dashboard",
  WarehouseManager: "/warehouse/dashboard",
  FinanceManager: "/plm/dashboard",
  QAManager: "/qa/dashboard",
  BranchManager: "/branch/dashboard",
  BRANCH_USER: "/branch/dashboard",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(username, password);
      const dest = ROLE_HOME[user.roleName] || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassAuthLayout>
      <div className="mb-8 text-center sm:text-left">
        <BrandLogo className="mb-6 justify-center sm:justify-start" />
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h1>
        <p className="text-slate-500">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <InputGroup
            id="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            icon={Mail}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <InputGroup
            id="password"
            label="Password"
            isPassword={true}
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            id="remember"
            label="Remember for 30 days"
            checked={rememberMe}
            onChange={setRememberMe}
          />
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
            className="text-xs font-bold text-[#000047] hover:opacity-80 transition-opacity"
          >
            Forgot Password?
          </a>
        </div>

        <PrimaryButton onClick={handleLogin} isLoading={isLoading}>
          <span className="flex items-center justify-center gap-2">
            Sign in <ArrowRight size={18} />
          </span>
        </PrimaryButton>
      </form>
    </GlassAuthLayout>
  );
};

export default LoginPage;

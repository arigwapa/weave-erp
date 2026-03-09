// RequireRole.tsx - checks the user's role against an allowed list
// shows a 403 page if they don't have access (backend also checks server-side)
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { roleMatches } from "./roles";
import {
  ShieldOff,
  ArrowLeft,
  Home,
  Lock,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import weaveLogo from "../assets/Weave Logo.png";

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RequireRole({ allowedRoles, children }: Props) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // role not allowed - show 403 page
  if (!roleMatches(role, allowedRoles)) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full animate-pulse-soft"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
              top: `calc(10% + ${mousePos.y * 0.5}px)`,
              left: `calc(-5% + ${mousePos.x * 0.5}px)`,
              transition: "top 0.8s ease-out, left 0.8s ease-out",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full animate-pulse-soft"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
              bottom: `calc(5% + ${mousePos.y * -0.3}px)`,
              right: `calc(-5% + ${mousePos.x * -0.3}px)`,
              transition: "bottom 0.8s ease-out, right 0.8s ease-out",
              animationDelay: "1.5s",
            }}
          />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute top-[15%] left-[10%] animate-float-slow pointer-events-none">
          <Lock size={18} className="text-amber-400/30" />
        </div>
        <div className="absolute top-[25%] right-[12%] animate-drift pointer-events-none">
          <KeyRound size={20} className="text-indigo-400/25" />
        </div>
        <div className="absolute bottom-[20%] left-[15%] animate-float-delayed pointer-events-none">
          <ShieldOff size={20} className="text-amber-300/25" />
        </div>
        <div
          className="absolute bottom-[30%] right-[10%] animate-float-slow pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        >
          <AlertTriangle size={16} className="text-indigo-300/30" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] pointer-events-none">
          <div className="w-full h-full rounded-full border border-dashed border-amber-200/20 animate-spin-slow" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit">
            <div className="w-2 h-2 rounded-full bg-amber-400/40" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 rounded-[32px] shadow-[0_2px_40px_-8px_rgba(6,81,237,0.1)] overflow-hidden">
            <div
              className="h-1 w-full bg-gradient-to-r from-amber-500 via-indigo-500 via-50% to-amber-500 animate-shimmer"
              style={{ backgroundSize: "200% 100%" }}
            />

            <div className="px-8 sm:px-14 pt-10 pb-8">
              <div className="flex justify-center mb-10 animate-fade-in-down">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center overflow-hidden p-1">
                    <img
                      src={weaveLogo}
                      alt="Weave"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-slate-700">
                    WEAVE ERP
                  </span>
                  <div className="w-px h-4 bg-slate-200" />
                  <span className="text-[10px] font-medium text-slate-400">
                    v1.0
                  </span>
                </div>
              </div>

              <div className="relative flex flex-col items-center mb-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl" />

                <div
                  className="relative animate-bounce-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="flex items-end gap-2 sm:gap-3">
                    <span
                      className="text-[100px] sm:text-[130px] font-black leading-none bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent drop-shadow-sm"
                      style={{ fontFeatureSettings: "'tnum'" }}
                    >
                      4
                    </span>

                    <div className="relative animate-float mb-3 sm:mb-4">
                      <div className="w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] rounded-full bg-gradient-to-br from-amber-50 to-indigo-50 border-2 border-amber-200/60 flex items-center justify-center shadow-lg shadow-amber-200/30">
                        <ShieldOff
                          size={32}
                          className="text-amber-600 animate-pulse-soft"
                        />
                      </div>
                      <div
                        className="absolute inset-0 animate-spin-slow"
                        style={{ animationDuration: "6s" }}
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                      </div>
                      <div
                        className="absolute inset-0 animate-spin-slow"
                        style={{
                          animationDuration: "8s",
                          animationDirection: "reverse",
                        }}
                      >
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-300" />
                      </div>
                    </div>

                    <span
                      className="text-[100px] sm:text-[130px] font-black leading-none bg-gradient-to-b from-amber-600 via-amber-700 to-slate-800 bg-clip-text text-transparent drop-shadow-sm"
                      style={{ fontFeatureSettings: "'tnum'" }}
                    >
                      3
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full bg-amber-400/40 animate-pulse-soft"
                      style={{
                        width: i === 2 ? 6 : i === 1 || i === 3 ? 4 : 3,
                        height: i === 2 ? 6 : i === 1 || i === 3 ? 4 : 3,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="text-center mb-8 animate-fade-in-down"
                style={{ animationDelay: "0.3s" }}
              >
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  Access Restricted
                </h1>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You don't have permission to access{" "}
                  <code className="text-xs bg-amber-50 px-1.5 py-0.5 rounded-md font-mono text-amber-700 border border-amber-200">
                    {location.pathname}
                  </code>
                  . Please contact your administrator or navigate to an
                  authorized section.
                </p>
              </div>

              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-down"
                style={{ animationDelay: "0.45s" }}
              >
                <button
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                  Go Back
                </button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-white bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <Home
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5"
                  />
                  Back to Login
                </Link>
              </div>
            </div>

            <div className="px-8 sm:px-14 py-4 bg-slate-50/40 border-t border-slate-200/40 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Weave ERP — Garment Manufacturing
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

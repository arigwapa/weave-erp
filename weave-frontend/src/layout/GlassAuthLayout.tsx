// GlassAuthLayout.tsx - frosted glass split-screen layout for the login page
// left side has branding/illustration (hidden on mobile), right side has the form

import React from "react";
import { Activity, ShieldCheck } from "lucide-react";
import FloatingWidget from "../components/ui/FloatingWidget";
import backgroundImg from "../assets/background.png";
interface GlassAuthLayoutProps {
  children: React.ReactNode;
}
const GlassAuthLayout: React.FC<GlassAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-[120px]" />

      <div className="w-full max-w-[1100px] bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className="hidden md:flex md:w-5/12 relative bg-slate-50 overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
            style={{ backgroundImage: `url(${backgroundImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-indigo-900/10 mix-blend-multiply" />

          <div className="relative z-10 w-full h-full flex flex-col justify-between p-8">
            <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10">
              <span className="text-white text-xs font-medium tracking-wider">
                WEAVE ERP V1.0
              </span>
            </div>

            <FloatingWidget
              icon={Activity}
              title="Production Live"
              subtitle="Line A: 98% Efficiency"
              className="top-1/3 -right-6 animate-pulse-slow"
            />
            <FloatingWidget
              icon={ShieldCheck}
              title="Quality Control"
              subtitle="Defect Rate: < 0.01%"
              className="bottom-1/3 -left-6"
            />

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 shadow-sm">
                Seamless Lifecycle.
              </h2>
              <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-[80%]">
                Connect design, production, and quality data in one unified
                platform.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white/40">
          <div className="animate-form-enter">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default GlassAuthLayout;

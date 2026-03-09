import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#F8F9FC] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200/70 bg-white/80 p-10 shadow-[0_2px_40px_-8px_rgba(6,81,237,0.1)] backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600">
            <Compass size={28} />
          </div>
        </div>
        <h1 className="text-center text-3xl font-extrabold text-slate-900">
          Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500">
          The route{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-indigo-600">
            {location.pathname}
          </code>{" "}
          does not exist.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-slate-800 sm:w-auto"
          >
            <Home size={14} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

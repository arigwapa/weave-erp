type RoleWorkspacePageProps = {
  roleLabel: string;
  pageTitle: string;
  description: string;
  gate?: "A" | "B" | "C" | "D";
};

export default function RoleWorkspacePage({
  roleLabel,
  pageTitle,
  description,
  gate,
}: RoleWorkspacePageProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-800">{pageTitle}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {roleLabel}
        </span>
        {gate && (
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
            Gate {gate}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

// RoleBadge.tsx - inline role pill for data tables, color-coded by keyword

interface RoleBadgeProps {
  role: string;
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const displayRole =
    role === "BRANCH_USER" || role === "BRANCH_MANAGER" || role === "BranchManager"
      ? "BRANCH_MANAGER"
      : role;

  // partial-match so "Branch Admin" still hits "admin"
  const getRoleStyle = (roleName: string) => {
    const normalizedRole = roleName.toLowerCase();

    if (normalizedRole.includes("admin")) {
      return "bg-purple-50 text-purple-700";
    }

    if (normalizedRole.includes("qa") || normalizedRole.includes("quality")) {
      return "bg-amber-50 text-amber-700";
    }

    if (
      normalizedRole.includes("finance") ||
      normalizedRole.includes("account")
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      normalizedRole.includes("production") ||
      normalizedRole.includes("operation")
    ) {
      return "bg-sky-50 text-sky-700";
    }

    return "bg-slate-50 text-slate-600";
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-md 
        text-xs font-bold capitalize
        ${getRoleStyle(displayRole)}
      `}
    >
      {displayRole}
    </span>
  );
};

export default RoleBadge;

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Building2,
  Eye,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DetailsModal from "../../components/ui/DetailsModal";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { TableToolbar } from "../../components/ui/TableToolbar";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { useAuth } from "../../lib/AuthContext";
import { hydrateBranchWarehouseData } from "../../lib/branchStorage";
import { rolesApi } from "../../lib/api/rolesApi";
import { usersApi } from "../../lib/api/usersApi";

type UserRow = {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
  warehouse: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  lastLogin: string;
  archived?: boolean;
};

type UserDraft = {
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
  password: string;
  warehouse: string;
  isActive: boolean;
};

type UserFormErrors = Partial<Record<
  "name" | "username" | "email" | "mobile" | "role" | "password" | "warehouse" | "status" | "form",
  string
>>;

type ConfirmationAction = "create" | "edit" | "archive" | "activate" | "deactivate";

type ConfirmationState = {
  isOpen: boolean;
  action: ConfirmationAction | null;
  userId?: number;
  title: string;
  message: string;
  variant: "primary" | "danger";
  confirmText: string;
  reopenUserModalOnCancel?: boolean;
};

const INITIAL_USERS: UserRow[] = [];

const EMPTY_DRAFT: UserDraft = {
  name: "",
  username: "",
  email: "",
  mobile: "",
  role: "",
  password: "",
  warehouse: "",
  isActive: true,
};

const ADMIN_ROLE_BASELINE = [
  "Production Manager",
  "Product Manager",
  "QA Manager",
];

const SUPER_ADMIN_ASSIGNABLE_ROLES = ["Admin", "Warehouse Manager"];

const ADMIN_ASSIGNABLE_MANAGER_ROLES = new Set<string>([
  "production manager",
  "product manager",
  "qa manager",
]);

const ROLE_ALIAS_TO_CANONICAL: Record<string, string> = {
  "plm manager": "Product Manager",
  "product finance budget manager": "Product Manager",
  "finance manager": "Product Manager",
  "product quality manager": "QA Manager",
  "branch manager": "Warehouse Manager",
};

function normalizeRoleName(role: string): string {
  const clean = role.trim();
  if (!clean) return "";
  return ROLE_ALIAS_TO_CANONICAL[clean.toLowerCase()] ?? clean;
}

function isSuperAdminRoleName(role: string): boolean {
  const normalized = normalizeRoleName(role)
    .toLowerCase()
    .replace(/[\s-]/g, "");
  return normalized === "superadmin";
}

function mergeUniqueCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((value) => {
    const clean = normalizeRoleName(value);
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(clean);
  });
  return out;
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function AddEditUserModal({
  isOpen,
  onClose,
  onSave,
  draft,
  setDraft,
  isEditing,
  warehouseOptions,
  roleOptions,
  fieldErrors,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  draft: UserDraft;
  setDraft: React.Dispatch<React.SetStateAction<UserDraft>>;
  isEditing: boolean;
  warehouseOptions: string[];
  roleOptions: string[];
  fieldErrors: UserFormErrors;
}) {
  if (!isOpen) return null;

  const normalizedRole = normalizeRoleName(draft.role);
  const isWarehouseManager = normalizedRole === "Warehouse Manager";

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {isEditing ? "Edit User" : "Add User"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Fill in user details, warehouse assignment, and activation status.
          </p>
        </div>

        <div className="p-6 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Full Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              className="rounded-2xl"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
          </div>
          <div>
            <Label>Username</Label>
            <Input
              value={draft.username}
              onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
              className="rounded-2xl"
            />
            {fieldErrors.username && <p className="mt-1 text-xs text-rose-600">{fieldErrors.username}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="name@company.com"
              className="rounded-2xl"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <Label>Mobile</Label>
            <Input
              value={draft.mobile}
              onChange={(e) => setDraft((prev) => ({ ...prev, mobile: e.target.value }))}
              placeholder="+63 9xx xxx xxxx"
              className="rounded-2xl"
            />
            {fieldErrors.mobile && <p className="mt-1 text-xs text-rose-600">{fieldErrors.mobile}</p>}
          </div>
          <div className="sm:col-span-2 max-w-xl">
            <Label>Role</Label>
            <Select
              value={draft.role}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  role: value,
                  warehouse: normalizeRoleName(value) === "Warehouse Manager" ? prev.warehouse : "",
                }))
              }
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.role && <p className="mt-1 text-xs text-rose-600">{fieldErrors.role}</p>}
          </div>
          <div className="sm:col-span-2 max-w-xl">
            <Label>Password</Label>
            <Input
              type="password"
              value={draft.password}
              onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
              placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
              className="rounded-2xl"
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
          </div>
          {isWarehouseManager && (
            <>
              <div className="sm:col-span-2">
                <Label>Warehouse Assignment</Label>
                <Select
                  value={draft.warehouse}
                  onValueChange={(value) => setDraft((prev) => ({ ...prev, warehouse: value }))}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseOptions.map((warehouse) => (
                      <SelectItem key={warehouse} value={warehouse}>
                        {warehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.warehouse && <p className="mt-1 text-xs text-rose-600">{fieldErrors.warehouse}</p>}
              </div>
            </>
          )}
          <div className="sm:col-span-2 space-y-2 pt-1">
            <Label>Status</Label>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                active={draft.isActive}
                onToggle={() => setDraft((prev) => ({ ...prev, isActive: !prev.isActive }))}
                label="Set user active status"
              />
              <span className="text-sm text-slate-600">{draft.isActive ? "Active" : "Inactive"}</span>
            </div>
            {fieldErrors.status && <p className="mt-1 text-xs text-rose-600">{fieldErrors.status}</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          {fieldErrors.form && (
            <p className="mr-auto self-center text-xs text-rose-600">{fieldErrors.form}</p>
          )}
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <SecondaryButton
            onClick={onSave}
            className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 hover:!text-white"
          >
            {isEditing ? "Save Changes" : "Add User"}
          </SecondaryButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { role: currentRole } = useAuth();
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [draft, setDraft] = useState<UserDraft>(EMPTY_DRAFT);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    action: null,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "Confirm",
  });
  const [toastState, setToastState] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [backendRoleOptions, setBackendRoleOptions] = useState<string[]>([]);
  const [backendWarehouseOptions, setBackendWarehouseOptions] = useState<string[]>([]);
  const [backendWarehouseByName, setBackendWarehouseByName] = useState<Record<string, number>>({});

  const itemsPerPage = 4;

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.list();
      const actorRole = (currentRole ?? "").toLowerCase();
      const visibleUsers = actorRole === "admin"
        ? data.filter((u) => !isSuperAdminRoleName(u.RoleName || ""))
        : data;
      setUsers(
        visibleUsers.map((u) => ({
          id: u.UserID,
          name: u.Fullname || u.Username,
          username: u.Username || "-",
          email: u.Email || "-",
          mobile: u.Mobile || "-",
          role: normalizeRoleName(u.RoleName || "-"),
          warehouse: u.WarehouseName || "Unassigned",
          createdBy: u.CreatedBy || (u.CreatedByUserID ? `User #${u.CreatedByUserID}` : "-"),
          createdAt: formatDateTime(u.CreatedAt),
          isActive: Boolean(u.IsActive ?? true),
          lastLogin: "-",
          archived: false,
        })),
      );
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [currentRole]);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const { warehouses } = await hydrateBranchWarehouseData();
        const activeWarehouses = warehouses.filter((warehouse) => warehouse.active === "Active");
        const activeWarehouseNames = activeWarehouses
          .map((warehouse) => warehouse.name)
          .filter(Boolean);
        setBackendWarehouseOptions(mergeUniqueCaseInsensitive(activeWarehouseNames));
        setBackendWarehouseByName(
          activeWarehouses.reduce<Record<string, number>>((acc, warehouse) => {
            if (!warehouse.name) return acc;
            acc[warehouse.name.toLowerCase()] = warehouse.id;
            return acc;
          }, {}),
        );
      } catch {
        setBackendWarehouseOptions([]);
        setBackendWarehouseByName({});
      }
    };

    void loadWarehouses();
  }, []);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await rolesApi.list();
        const activeRoleNames = roles
          .filter((role) => role.IsActive)
          .map((role) => role.DisplayName)
          .filter(Boolean);
        setBackendRoleOptions(mergeUniqueCaseInsensitive(activeRoleNames));
      } catch {
        setBackendRoleOptions([]);
      }
    };

    void loadRoles();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (user.archived) return false;

      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.warehouse.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        normalizeRoleName(user.role).toLowerCase() === normalizeRoleName(roleFilter).toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);
  const warehouseOptions = useMemo(
    () => mergeUniqueCaseInsensitive(backendWarehouseOptions),
    [backendWarehouseOptions],
  );

  const assignableRoleOptions = useMemo(() => {
    const normalizedActorRole = (currentRole ?? "").toLowerCase();
    if (normalizedActorRole === "superadmin") {
      return mergeUniqueCaseInsensitive(SUPER_ADMIN_ASSIGNABLE_ROLES);
    }

    if (normalizedActorRole === "admin") {
      const adminRoles = mergeUniqueCaseInsensitive(ADMIN_ROLE_BASELINE).filter((role) =>
        ADMIN_ASSIGNABLE_MANAGER_ROLES.has(role.toLowerCase()),
      );
      const backendManagerRoles = backendRoleOptions.filter(
        (role) =>
          ADMIN_ASSIGNABLE_MANAGER_ROLES.has(normalizeRoleName(role).toLowerCase()) &&
          !isSuperAdminRoleName(role),
      );
      return mergeUniqueCaseInsensitive([
        ...backendManagerRoles,
        ...adminRoles,
      ]).filter((role) => !isSuperAdminRoleName(role));
    }

    return mergeUniqueCaseInsensitive(backendRoleOptions)
      .filter((role) => !isSuperAdminRoleName(role));
  }, [backendRoleOptions, currentRole]);

  const modalRoleOptions = useMemo(() => {
    if (editingUserId === null) return assignableRoleOptions;
    return mergeUniqueCaseInsensitive([...assignableRoleOptions, draft.role]).filter(
      (role) => !isSuperAdminRoleName(role),
    );
  }, [assignableRoleOptions, draft.role, editingUserId]);

  const effectiveRoleOptions = useMemo(() => {
    const rolesFromUsers = users
      .map((user) => user.role)
      .filter((role) => role.trim() && role !== "-");
    return mergeUniqueCaseInsensitive([
      ...assignableRoleOptions,
      ...rolesFromUsers,
    ]);
  }, [assignableRoleOptions, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const openAddModal = () => {
    setEditingUserId(null);
    setDraft({ ...EMPTY_DRAFT, role: assignableRoleOptions[0] ?? "", password: "" });
    setFormErrors({});
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setEditingUserId(user.id);
    setDraft({
      name: user.name,
      username: user.username === "-" ? "" : user.username,
      email: user.email === "-" ? "" : user.email,
      mobile: user.mobile === "-" ? "" : user.mobile,
      role: normalizeRoleName(user.role),
      password: "",
      warehouse: user.warehouse === "Unassigned" ? "" : user.warehouse,
      isActive: user.isActive,
    });
    setFormErrors({});
    setIsUserModalOpen(true);
  };

  const mapValidationErrors = (error: unknown): UserFormErrors => {
    const raw = (error as any)?.validationErrors as Record<string, string[] | string> | undefined;
    const out: UserFormErrors = {};
    const distributeGenericMessage = (message: string) => {
      const lower = message.toLowerCase();
      if (lower.includes("username")) out.username = out.username ?? "Username is required.";
      if (lower.includes("fullname") || lower.includes("full name")) out.name = out.name ?? "Full name is required.";
      if (lower.includes("role")) out.role = out.role ?? "Role is required.";
      if (lower.includes("password")) out.password = out.password ?? "Password is required.";
      if (lower.includes("warehouse")) out.warehouse = out.warehouse ?? "Warehouse assignment is required.";
    };

    if (!raw) {
      const message = (error as Error)?.message;
      if (message) {
        distributeGenericMessage(message);
        if (!out.name && !out.username && !out.email && !out.mobile && !out.role && !out.password && !out.warehouse && !out.status) {
          out.form = message;
        }
      }
      return out;
    }

    const pickFirst = (value: string[] | string): string =>
      Array.isArray(value) ? (value[0] ?? "") : value;

    Object.entries(raw).forEach(([key, value]) => {
      const message = pickFirst(value);
      const normalizedKey = key.toLowerCase();
      if (!message) return;
      if (normalizedKey.includes("fullname")) out.name = out.name ?? message;
      else if (normalizedKey.includes("username")) out.username = out.username ?? message;
      else if (normalizedKey.includes("email")) out.email = out.email ?? message;
      else if (normalizedKey.includes("mobile")) out.mobile = out.mobile ?? message;
      else if (normalizedKey.includes("role")) out.role = out.role ?? message;
      else if (normalizedKey.includes("password")) out.password = out.password ?? message;
      else if (normalizedKey.includes("warehouse")) out.warehouse = out.warehouse ?? message;
      else if (normalizedKey.includes("isactive") || normalizedKey.includes("status")) out.status = out.status ?? message;
      else {
        distributeGenericMessage(message);
        if (!out.name && !out.username && !out.email && !out.mobile && !out.role && !out.password && !out.warehouse && !out.status) {
          out.form = out.form ?? message;
        }
      }
    });

    if (!out.form) {
      const fallback = (error as Error)?.message;
      if (fallback) out.form = fallback;
    }

    return out;
  };

  const persistUser = async (): Promise<boolean> => {
    setFormErrors({});
    const trimmedName = draft.name.trim();
    const trimmedUsername = draft.username.trim();
    const trimmedEmail = draft.email.trim();
    const trimmedMobile = draft.mobile.trim();
    const trimmedRole = draft.role.trim();
    const trimmedPassword = draft.password.trim();
    const normalizedRole = normalizeRoleName(trimmedRole);
    const existingUser = editingUserId ? users.find((u) => u.id === editingUserId) : null;
    const normalizedExistingRole = normalizeRoleName(existingUser?.role ?? "");
    const shouldSendRoleName = !editingUserId || normalizedRole !== normalizedExistingRole;
    const requiresWarehouseAssignment = normalizedRole === "Warehouse Manager";
    const selectedWarehouseId = backendWarehouseByName[draft.warehouse.trim().toLowerCase()];

    try {
      if (editingUserId) {
        await usersApi.update(editingUserId, {
          Fullname: trimmedName,
          Username: trimmedUsername,
          Email: trimmedEmail || undefined,
          Mobile: trimmedMobile || undefined,
          RoleName: shouldSendRoleName ? normalizedRole : undefined,
          WarehouseID:
            shouldSendRoleName && requiresWarehouseAssignment ? selectedWarehouseId : undefined,
          WarehouseName:
            shouldSendRoleName && requiresWarehouseAssignment ? draft.warehouse.trim() : undefined,
          IsActive: draft.isActive,
          Password: trimmedPassword || undefined,
        });
      } else {
        await usersApi.create({
          Fullname: trimmedName,
          Username: trimmedUsername,
          Email: trimmedEmail || undefined,
          Mobile: trimmedMobile || undefined,
          RoleName: normalizedRole,
          WarehouseID: requiresWarehouseAssignment ? selectedWarehouseId : undefined,
          WarehouseName: requiresWarehouseAssignment ? draft.warehouse.trim() : undefined,
          Password: trimmedPassword,
        });
        setCurrentPage(1);
      }

      await loadUsers();
      setIsUserModalOpen(false);
      setToastState({
        type: "success",
        message: editingUserId ? "User updated successfully." : "User added successfully.",
      });
      return true;
    } catch (error) {
      // Keep modal open so user can correct the input with field-level messages.
      setFormErrors(mapValidationErrors(error));
      setToastState({
        type: "error",
        message: editingUserId
          ? "Failed to update user. Please review the form errors."
          : "Failed to add user. Please review the form errors.",
      });
      return false;
    }
  };

  const closeConfirmation = (options?: { reopenUserModal?: boolean }) => {
    const shouldReopenUserModal = options?.reopenUserModal ?? Boolean(confirmation.reopenUserModalOnCancel);
    setConfirmation({
      isOpen: false,
      action: null,
      title: "",
      message: "",
      variant: "primary",
      confirmText: "Confirm",
    });
    if (shouldReopenUserModal) {
      setIsUserModalOpen(true);
    }
  };

  const requestSaveConfirmation = () => {
    const isEditing = editingUserId !== null;
    setIsUserModalOpen(false);
    setConfirmation({
      isOpen: true,
      action: isEditing ? "edit" : "create",
      title: isEditing ? "Confirm User Update" : "Confirm Add User",
      message: isEditing
        ? "Are you sure you want to save these user changes?"
        : "Are you sure you want to add this user?",
      variant: "primary",
      confirmText: isEditing ? "Save Changes" : "Add User",
      reopenUserModalOnCancel: true,
    });
  };

  const requestToggleUserStatus = (user: UserRow) => {
    setConfirmation({
      isOpen: true,
      action: user.isActive ? "deactivate" : "activate",
      userId: user.id,
      title: user.isActive ? "Confirm Deactivate User" : "Confirm Activate User",
      message: user.isActive
        ? `Are you sure you want to set ${user.name} as inactive?`
        : `Are you sure you want to set ${user.name} as active?`,
      variant: "primary",
      confirmText: user.isActive ? "Set Inactive" : "Set Active",
    });
  };

  const requestArchiveUser = (user: UserRow) => {
    setConfirmation({
      isOpen: true,
      action: "archive",
      userId: user.id,
      title: "Confirm Archive User",
      message: `Are you sure you want to archive ${user.name}?`,
      variant: "danger",
      confirmText: "Archive User",
    });
  };

  const archiveUser = async (id: number) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, archived: true } : user)),
    );
    await usersApi.archive(id);
    if (selectedUser?.id === id) {
      setIsDetailsOpen(false);
      setSelectedUser(null);
    }
  };

  const applyToggleUserStatus = async (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user,
      ),
    );

    try {
      await usersApi.update(id, { IsActive: !target.isActive });
    } catch {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: target.isActive } : user,
        ),
      );
      throw new Error("Unable to update user status.");
    }
  };

  const handleConfirmationConfirm = () => {
    void (async () => {
      const action = confirmation.action;
      const userId = confirmation.userId;
      closeConfirmation({ reopenUserModal: false });

      try {
        if (action === "create" || action === "edit") {
          const saved = await persistUser();
          if (!saved) setIsUserModalOpen(true);
          return;
        }

        if (action === "archive" && userId) {
          await archiveUser(userId);
          setToastState({ type: "success", message: "User archived successfully." });
          return;
        }

        if ((action === "activate" || action === "deactivate") && userId) {
          await applyToggleUserStatus(userId);
          setToastState({
            type: "success",
            message: action === "activate" ? "User activated successfully." : "User deactivated successfully.",
          });
        }
      } catch (error) {
        setToastState({
          type: "error",
          message: (error as Error)?.message || "Action failed. Please try again.",
        });
      }
    })();
  };

  const openDetails = (user: UserRow) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage identities, role access, security controls, and access reviews.
        </p>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">User List</CardTitle>
          <CardDescription>
            Filter by role, active state, and last login activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              onAdd={openAddModal}
              addLabel="Add User"
              placeholder="Search user, email, mobile..."
              filterLabel="Role & Status"
              inlineControls={
                (currentRole ?? "").toLowerCase() === "superadmin" ? (
                  <SecondaryButton onClick={() => navigate("/super-admin/archives")}>
                    Open Archives
                  </SecondaryButton>
                ) : undefined
              }
            >
              <div className="p-3 space-y-3">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Role</p>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => {
                      setRoleFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {effectiveRoleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading users..." : "No users found for current filters."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-6">
                      <p className="text-sm font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.createdBy}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="text-slate-600">{user.lastLogin}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <SecondaryButton
                          onClick={() => openDetails(user)}
                          icon={Eye}
                          ariaLabel={`View details for ${user.name}`}
                          className="!px-2 !py-2 !rounded-lg"
                        >
                          <span className="sr-only">Details</span>
                        </SecondaryButton>
                        <SecondaryButton
                          onClick={() => openEditModal(user)}
                          icon={Pencil}
                          ariaLabel={`Edit ${user.name}`}
                          className="!px-2 !py-2 !rounded-lg"
                        >
                          <span className="sr-only">Edit</span>
                        </SecondaryButton>
                        <SecondaryButton
                          onClick={() => requestArchiveUser(user)}
                          icon={Archive}
                          ariaLabel={`Archive ${user.name}`}
                          className="!px-2 !py-2 !rounded-lg"
                        >
                          <span className="sr-only">Archive</span>
                        </SecondaryButton>

                        <div className="mx-1 h-5 w-px bg-slate-200" />

                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            active={user.isActive}
                            onToggle={() => requestToggleUserStatus(user)}
                            label={`Set ${user.name} status`}
                          />
                          <span className="text-xs font-medium text-slate-600 min-w-[48px]">
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredUsers.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <AddEditUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={requestSaveConfirmation}
        draft={draft}
        setDraft={setDraft}
        isEditing={editingUserId !== null}
        warehouseOptions={warehouseOptions}
        roleOptions={modalRoleOptions}
        fieldErrors={formErrors}
      />

      <DetailsModal
        isOpen={isDetailsOpen && selectedUser !== null}
        onClose={() => setIsDetailsOpen(false)}
        title="User Details"
        itemId={`USR-${selectedUser?.id ?? "-"}`}
        headerIcon={
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <UserCircle2 size={16} />
          </div>
        }
        gridFields={
          selectedUser
            ? [
                { label: "Full Name", value: selectedUser.name, icon: UserCircle2 },
                { label: "Username", value: selectedUser.username, icon: UserCircle2 },
                { label: "Email", value: selectedUser.email, icon: Mail },
                { label: "Mobile", value: selectedUser.mobile, icon: Phone },
                { label: "Role", value: selectedUser.role, icon: ShieldCheck },
                { label: "Warehouse", value: selectedUser.warehouse, icon: Building2 },
                { label: "Created By", value: selectedUser.createdBy, icon: UserCircle2 },
                { label: "Created At", value: selectedUser.createdAt, icon: UserCircle2 },
                {
                  label: "Status",
                  value: selectedUser.isActive ? "Active" : "Inactive",
                  icon: ShieldCheck,
                },
              ]
            : []
        }
      />

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmationConfirm}
        title={confirmation.title}
        message={confirmation.message}
        variant={confirmation.variant}
        confirmText={confirmation.confirmText}
      />

      {toastState && (
        <Toast
          type={toastState.type}
          message={toastState.message}
          onClose={() => setToastState(null)}
        />
      )}
    </div>
  );
}

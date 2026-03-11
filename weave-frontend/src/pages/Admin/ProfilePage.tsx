import { useEffect, useMemo, useState } from "react";
import { Building2, Mail, Phone } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { usersApi } from "../../lib/api/usersApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const PRODUCT_MANAGER_ROLE_KEYS = [
  "plmmanager",
  "plm manager",
  "productmanager",
  "product manager",
  "finance manager",
  "product finance budget manager",
];

function isProductManagerRole(role?: string): boolean {
  const normalized = (role || "").trim().toLowerCase();
  if (!normalized) return false;
  return PRODUCT_MANAGER_ROLE_KEYS.includes(normalized);
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("Product Manager");
  const [username, setUsername] = useState("product.manager");
  const [email, setEmail] = useState("product.manager@local");
  const [mobile, setMobile] = useState("-");
  const [role, setRole] = useState("Product Manager");
  const [branchScope, setBranchScope] = useState("Main Branch");
  const [status, setStatus] = useState("Active");
  const [timezone, setTimezone] = useState("Asia/Manila");

  useEffect(() => {
    const loadProductManagerProfile = async () => {
      try {
        const users = await usersApi.list();
        const productManager =
          users.find((item) => isProductManagerRole(item.RoleName))
          || users.find((item) => item.Username?.trim().toLowerCase().includes("product"));

        if (!productManager) {
          setFullName("Product Manager");
          setUsername("product.manager");
          setEmail("product.manager@local");
          setMobile("-");
          setRole("Product Manager");
          setBranchScope(user?.branchName || "Main Branch");
          setStatus("Active");
          return;
        }

        setFullName(productManager.Fullname?.trim() || "Product Manager");
        setUsername(productManager.Username?.trim() || "product.manager");
        setEmail(productManager.Email?.trim() || "product.manager@local");
        setMobile(productManager.Mobile?.trim() || "-");
        setRole(productManager.RoleName?.trim() || "Product Manager");
        setBranchScope(productManager.BranchName?.trim() || user?.branchName || "Main Branch");
        setStatus((productManager.Status?.trim() || (productManager.IsActive ? "Active" : "Inactive")) || "Active");
      } catch {
        setBranchScope(user?.branchName || "Main Branch");
      }
    };

    void loadProductManagerProfile();
  }, [user?.branchName, user?.fullname, user?.roleName, user?.status, user?.userID, user?.username]);

  const avatarInitials = useMemo(
    () =>
      (fullName || "Admin User")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join(""),
    [fullName],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
              Centralized Product Manager account details for admin visibility and governance.
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-semibold">
                  {avatarInitials}
                </div>
                <div>
                  <p className="text-lg font-semibold">{fullName}</p>
                  <p className="text-sm text-slate-200">{role} • {branchScope}</p>
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
            <CardDescription>Product Manager profile details displayed in account inputs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Full Name</Label>
              <Input className="rounded-xl" value={fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input className="rounded-xl" value={username} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input className="rounded-xl" value={email} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input className="rounded-xl" value={mobile} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input className="rounded-xl" value={role} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Branch Scope</Label>
              <Input className="rounded-xl" value={branchScope} readOnly />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <SecondaryButton>Cancel</SecondaryButton>
              <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
                Save Profile
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Account Snapshot</CardTitle>
            <CardDescription>Quick profile overview for admin workspace context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-500">Profile Owner</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{fullName}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-500">Username</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{username}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-500">Role</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{role}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-500">Status</p>
              <div className="mt-1">
                <StatusBadge status={status} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-500">Contact</p>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-500" />
                  {email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-500" />
                  {mobile}
                </p>
                <p className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-500" />
                  {branchScope}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

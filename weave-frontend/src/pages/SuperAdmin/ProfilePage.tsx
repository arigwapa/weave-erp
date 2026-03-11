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

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("Super Admin");
  const [username, setUsername] = useState("superadmin");
  const [email, setEmail] = useState("superadmin@local");
  const [mobile, setMobile] = useState("-");
  const [role, setRole] = useState("SuperAdmin");
  const [branchScope, setBranchScope] = useState("Main Branch");
  const [status, setStatus] = useState("Active");
  const [timezone, setTimezone] = useState("Asia/Manila");

  useEffect(() => {
    setFullName(user?.fullname ?? "Super Admin");
    setUsername(user?.username ?? "superadmin");
    setRole(user?.roleName ?? "SuperAdmin");
    setBranchScope(user?.branchName ?? "Main Branch");
    setStatus(user?.status ?? "Active");
  }, [user]);

  useEffect(() => {
    const loadSuperAdminProfile = async () => {
      try {
        const users = await usersApi.list();
        const current = users.find((item) =>
          (user?.userID && item.UserID === user.userID)
          || item.Username.toLowerCase() === (user?.username ?? "").toLowerCase(),
        );

        if (!current) return;
        setEmail(current.Email?.trim() || "superadmin@local");
        setMobile(current.Mobile?.trim() || "-");
      } catch {
        setEmail("superadmin@local");
      }
    };

    void loadSuperAdminProfile();
  }, [user]);

  const avatarInitials = useMemo(
    () =>
      (fullName || "Super Admin")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join(""),
    [fullName],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Centralized Super Admin account details and identity settings.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
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
        <Card className="rounded-2xl xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
            <CardDescription>Super Admin identity and contact details from your account profile.</CardDescription>
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

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Account Snapshot</CardTitle>
            <CardDescription>Quick overview of your active Super Admin profile.</CardDescription>
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
              <p className="text-xs text-slate-500">Branch Scope</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{branchScope}</p>
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

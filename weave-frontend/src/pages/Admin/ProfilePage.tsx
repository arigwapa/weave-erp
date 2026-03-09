import { useMemo, useState } from "react";
import { Bell, KeyRound, ShieldCheck, UserCircle2 } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type ProfileTab = "account" | "security" | "preferences";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [fullName, setFullName] = useState(user?.fullname ?? "Admin User");
  const [username] = useState(user?.username ?? "admin");
  const [mobile, setMobile] = useState("+63 9xx xxx xxxx");
  const [jobTitle, setJobTitle] = useState("Operations Administrator");
  const [timezone, setTimezone] = useState("Asia/Manila");
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const tabs = useMemo(
    () => [
      { id: "account", label: "Account", icon: UserCircle2 },
      { id: "security", label: "Security", icon: ShieldCheck },
      { id: "preferences", label: "Preferences", icon: Bell },
    ],
    [],
  );

  const avatarInitials = (user?.fullname || "Admin User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage personal account information, security preferences, and notification behavior.
          </p>
        </div>
        <StatusBadge status={user?.isActive ? "Active" : "Inactive"} />
      </div>

      <div className="flex flex-col items-center py-2 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-md">
          {avatarInitials}
        </div>
        <p className="mt-4 text-lg font-semibold text-slate-900">{user?.fullname || "Admin User"}</p>
        <p className="text-sm text-slate-500">{user?.roleName || "Admin"}</p>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as ProfileTab)} />

      {activeTab === "account" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
              <CardDescription>Update your public profile and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Full Name</Label>
                <Input className="rounded-2xl" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input className="rounded-2xl" value={username} disabled />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input className="rounded-2xl" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input className="rounded-2xl" value={user?.roleName ?? "Admin"} disabled />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input className="rounded-2xl" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 sm:col-span-2">
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
              <CardDescription>Current profile and workspace status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Username</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{user?.username ?? "admin"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Branch Scope</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{user?.branchName || "Assigned Branch"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={user?.status ?? "Active"} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Security Controls</CardTitle>
            <CardDescription>Manage password access and sign-in security policy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Multi-Factor Authentication</p>
                <p className="text-xs text-slate-500">Require MFA for all admin sessions.</p>
              </div>
              <ToggleSwitch active={mfaEnabled} onToggle={() => setMfaEnabled((v) => !v)} label="Toggle MFA" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Login Alerts</p>
                <p className="text-xs text-slate-500">Send alert when account signs in from new device.</p>
              </div>
              <ToggleSwitch active={loginAlerts} onToggle={() => setLoginAlerts((v) => !v)} label="Toggle alerts" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <SecondaryButton icon={KeyRound}>Change Password</SecondaryButton>
              <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
                Save Security
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "preferences" && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
            <CardDescription>Choose how and when platform updates are delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Weekly Digest</p>
                <p className="text-xs text-slate-500">Receive weekly summary of assignment and SLA updates.</p>
              </div>
              <ToggleSwitch active={weeklyDigest} onToggle={() => setWeeklyDigest((v) => !v)} label="Toggle digest" />
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Preferred Alert Channel</p>
              <Select defaultValue="email-inapp">
                <SelectTrigger className="mt-2 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email-inapp">Email + In-app</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="inapp">In-app only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <SecondaryButton>Reset Defaults</SecondaryButton>
              <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
                Save Preferences
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

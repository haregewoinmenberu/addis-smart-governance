import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, changePassword, getSessions, revokeSession, revokeAllOtherSessions, getActivityLogs } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { User, Lock, Activity, Monitor, Save, Trash2, LogOut, Shield, Mail, Phone, Building2, Calendar, MapPin } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "My Account — STRP" }] }),
  component: Page,
});

function Page() {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: "revoke" | "revoke-all" | null;
    target: any | null;
  }>({ isOpen: false, action: null, target: null });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Fetch sessions
  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    enabled: activeTab === "security",
  });

  // Fetch activity logs
  const { data: activityData } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: () => getActivityLogs(),
    enabled: activeTab === "activity",
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      refetchUser();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({
        title: "Success",
        description: "Session revoked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Revoke all sessions mutation
  const revokeAllMutation = useMutation({
    mutationFn: revokeAllOtherSessions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({
        title: "Success",
        description: `${data.revoked_count} session(s) revoked successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  const openConfirm = (action: "revoke" | "revoke-all", target: any = null) => {
    setConfirmState({ isOpen: true, action, target });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, target: null });
  };

  const handleConfirm = () => {
    if (!confirmState.action) return;
    if (confirmState.action === "revoke" && confirmState.target) {
      revokeSessionMutation.mutate(confirmState.target.id);
    }
    if (confirmState.action === "revoke-all") {
      revokeAllMutation.mutate();
    }
    closeConfirm();
  };

  const sessions = sessionsData?.sessions || [];
  const activities = activityData?.data || [];

  return (
    <AppShell>
      <PageHeader
        title="My Account"
        subtitle="Manage your profile, security settings, and view your activity."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/40 p-1 rounded-xl mb-6 flex flex-wrap h-auto">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6 rounded-2xl border-border/60">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
              <div className="h-20 w-20 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-glow">
                {user?.name.split(" ").map((x) => x[0]).join("").toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  {user?.roles?.map((role: any) => (
                    <Badge key={role.name} variant="secondary" className="text-xs">
                      {role.display_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-9"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <div className="relative mt-1.5">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      className="pl-9"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sub-City:</span>
                  <span className="font-medium">{user?.sub_city || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Login:</span>
                  <span className="font-medium">
                    {user?.last_login_at ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm") : "N/A"}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6 rounded-2xl border-border/60">
            <h3 className="font-semibold tracking-tight mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    className="mt-1.5"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    className="mt-1.5"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password_confirmation">Confirm New Password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    className="mt-1.5"
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="gap-1.5"
                disabled={changePasswordMutation.isPending}
              >
                <Lock className="h-4 w-4" />
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card className="p-6 rounded-2xl border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold tracking-tight flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </h3>
              {sessions.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openConfirm("revoke-all")}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Revoke All Others
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active sessions</p>
              ) : (
                sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.user_agent || "Unknown Device"}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.ip_address} • Last active: {format(new Date(session.last_activity_at), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openConfirm("revoke", session)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card className="rounded-2xl border-border/60 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold tracking-tight flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </h3>
            </div>
            <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm m-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8fafc] border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-[#718096]">
                    <tr>
                      <th className="text-left py-3.5 px-6 font-semibold">Action</th>
                      <th className="text-left py-3.5 px-6 font-semibold">Module</th>
                      <th className="text-left py-3.5 px-6 font-semibold">IP Address</th>
                      <th className="text-left py-3.5 px-6 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          No activity logs found
                        </td>
                      </tr>
                    ) : (
                      activities.map((log: any, rowIndex: number) => (
                        <tr key={log.id} className={`border-b border-border/40 hover:bg-slate-50/50 transition-colors ${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/30"
                        }`}>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">
                            <Badge variant="secondary" className="animate-none">{log.action}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">{log.module}</td>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">{log.ip_address || "—"}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmState.isOpen} onOpenChange={closeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmState.action === "revoke-all" ? "Revoke all other sessions?" : "Revoke session?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.action === "revoke-all"
                ? "This will sign you out from all other devices. Your current session will remain active."
                : "This will immediately sign out this session."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground">
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

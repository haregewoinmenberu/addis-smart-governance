import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Send, Upload, ArrowRightCircle, Activity, FileCheck,
  Eye, RefreshCw, CheckCircle2, EyeOff,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAuthToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/research/reports/$id/respond")({
  component: () => (
    <RequireAuth>
      <RespondToReportPage />
    </RequireAuth>
  ),
});

const DECISION_COLORS: Record<string, string> = {
  approved_to_develop: "bg-emerald-500/15 text-emerald-700 border-emerald-400/30",
  transfer_existing: "bg-blue-500/15 text-blue-700 border-blue-400/30",
  customization_of_existing: "bg-purple-500/15 text-purple-700 border-purple-400/30",
  infrastructure_upgrade: "bg-indigo-500/15 text-indigo-700 border-indigo-400/30",
  rejected: "bg-red-500/15 text-red-700 border-red-400/30",
  needs_improvement: "bg-orange-500/15 text-orange-700 border-orange-400/30",
  deferred: "bg-gray-500/15 text-gray-700 border-gray-400/30",
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-400/30",
  further_review_required: "bg-amber-500/15 text-amber-700 border-amber-400/30",
  resubmit_with_changes: "bg-orange-500/15 text-orange-700 border-orange-400/30",
  approved_with_conditions: "bg-teal-500/15 text-teal-700 border-teal-400/30",
  approved_for_pilot: "bg-cyan-500/15 text-cyan-700 border-cyan-400/30",
  approved_for_full_implementation: "bg-green-500/15 text-green-700 border-green-400/30",
  approved_for_production: "bg-emerald-600/15 text-emerald-800 border-emerald-500/30",
  no_risks: "bg-slate-500/15 text-slate-700 border-slate-400/30",
};

function ReachedBadge({ response }: { response: any }) {
  const reached = !!response.notification?.read_at;
  return reached ? (
    <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-400/40 bg-emerald-500/10">
      <CheckCircle2 className="h-3 w-3" />
      Seen
    </Badge>
  ) : (
    <Badge variant="outline" className="text-xs gap-1 text-amber-700 border-amber-400/40 bg-amber-500/10">
      <EyeOff className="h-3 w-3" />
      Not seen yet
    </Badge>
  );
}

function ResendButton({ response, reportId }: { response: any; reportId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reached = !!response.notification?.read_at;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/research/reports/responses/${response.id}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to resend");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Resent", description: "The notification has been resent." });
      queryClient.invalidateQueries({ queryKey: ["research-report-responses", reportId] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-2"
      disabled={reached || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <RefreshCw className="h-3.5 w-3.5" />
      {mutation.isPending ? "Resending..." : "Resend"}
    </Button>
  );
}

function SentResponseCard({ response, reportId, title }: { response: any; reportId: number; title: string }) {
  const navigate = useNavigate();

  return (
    <Card className="border-border/60">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-400/30">{title}</Badge>
            <ReachedBadge response={response} />
          </div>
          <span className="text-xs text-muted-foreground">
            Sent {new Date(response.sent_at).toLocaleString()}
          </span>
        </div>
        {response.response_type === "forward" && response.forwarded_to && (
          <p className="text-xs text-muted-foreground">Forwarded to: {response.forwarded_to.name}</p>
        )}
        <p className="text-sm">{response.message}</p>
        <div className="flex items-center gap-2 pt-1">
          {response.certificate_name && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                navigate({
                  to: "/documents/$id",
                  params: { id: String(response.id) },
                  search: {
                    name: response.certificate_name,
                    returnTo: `/research/reports/${reportId}/respond`,
                    type: "research-report-response",
                    path: "",
                    attachmentId: "",
                    fileType: "",
                  },
                })
              }
            >
              <Eye className="h-3.5 w-3.5" />
              View {response.response_type === "requester" ? "Certificate" : "Letter"}
            </Button>
          )}
          <ResendButton response={response} reportId={reportId} />
        </div>
      </CardContent>
    </Card>
  );
}

function RequesterResponseSection({ report, existing }: { report: any; existing: any | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!certificate) throw new Error("Certificate/letter is required");

      const formData = new FormData();
      formData.append("certificate", certificate);
      formData.append("message", message);

      const res = await fetch(`/api/research/reports/${report.id}/respond-to-requester`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to send response");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Response sent", description: "The requester has been notified with the decision certificate." });
      queryClient.invalidateQueries({ queryKey: ["research-report-responses", report.id] });
      setMessage("");
      setCertificate(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to send response", description: error.message, variant: "destructive" });
    },
  });

  if (existing) {
    return <SentResponseCard response={existing} reportId={report.id} title="Sent to Requester" />;
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Response to Requester</CardTitle>
            <CardDescription>Send the final decision and certificate to the person who submitted this request</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="response-message">Message to Requester *</Label>
          <Textarea
            id="response-message"
            placeholder="Explain the decision and any next steps for the requester..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="certificate">Certificate / Decision Letter *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="certificate"
              type="file"
              onChange={(e) => setCertificate(e.target.files?.[0] ?? null)}
            />
            <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground">
            This document serves as the official certificate of the decision sent to the requester.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            className="gap-2"
            disabled={!message || !certificate || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Send className="h-4 w-4" />
            {mutation.isPending ? "Sending..." : "Send Response"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ForwardSection({ report, existing }: { report: any; existing: any | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [forwardToUserId, setForwardToUserId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [letter, setLetter] = useState<File | null>(null);

  const { data: targetsData } = useQuery({
    queryKey: ["research-reports-forward-targets"],
    queryFn: async () => {
      const res = await fetch("/api/research/reports/forward-targets", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch forward targets");
      return res.json();
    },
    enabled: !existing,
  });
  const forwardTargets = targetsData?.data ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      if (!forwardToUserId) throw new Error("Select who to forward this to");
      if (!letter) throw new Error("A letter/document is required to forward this request");

      const formData = new FormData();
      formData.append("forward_to_user_id", forwardToUserId);
      formData.append("message", message);
      formData.append("letter", letter);

      const res = await fetch(`/api/research/reports/${report.id}/forward`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to forward request");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Forwarded", description: "The request has been forwarded to continue the process." });
      queryClient.invalidateQueries({ queryKey: ["research-report-responses", report.id] });
      setForwardToUserId("");
      setMessage("");
      setLetter(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to forward", description: error.message, variant: "destructive" });
    },
  });

  if (existing) {
    return <SentResponseCard response={existing} reportId={report.id} title="Forwarded" />;
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ArrowRightCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Continue the Process</CardTitle>
            <CardDescription>Forward this approved request to another sector or director to continue</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forward-to">Forward To *</Label>
          <Select value={forwardToUserId} onValueChange={setForwardToUserId}>
            <SelectTrigger id="forward-to">
              <SelectValue placeholder="Select a sector or director" />
            </SelectTrigger>
            <SelectContent>
              {forwardTargets.map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forward-letter">Letter / Document *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="forward-letter"
              type="file"
              onChange={(e) => setLetter(e.target.files?.[0] ?? null)}
            />
            <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground">
            Document handed off to the recipient so they can continue the process.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="forward-message">Note *</Label>
          <Textarea
            id="forward-message"
            placeholder="Note for the recipient about continuing the process..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={!forwardToUserId || !message || !letter || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <ArrowRightCircle className="h-4 w-4" />
            {mutation.isPending ? "Forwarding..." : "Forward Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RespondToReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["research-report", id],
    queryFn: async () => {
      const res = await fetch(`/api/research/reports/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ["research-report-responses", Number(id)],
    queryFn: async () => {
      const res = await fetch(`/api/research/reports/${id}/responses`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch response history");
      return res.json();
    },
  });

  const report = data?.data;
  const isRejected = report?.decision === "rejected";
  const responses = responsesData?.data ?? [];
  const existingRequesterResponse = responses.find((r: any) => r.response_type === "requester") ?? null;
  const existingForward = responses.find((r: any) => r.response_type === "forward") ?? null;

  if (isLoading || responsesLoading) {
    return (
      <AppShell>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3">
              <Activity className="h-8 w-8 text-primary animate-pulse" />
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/research/reports" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title="Respond to Report"
            subtitle={report?.research_title}
          />
        </div>

        {report && (
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={DECISION_COLORS[report.decision] ?? "bg-gray-100 text-gray-700"}>
                  {report.decision_label}
                </Badge>
                {isRejected && (
                  <Badge variant="outline" className="text-xs">
                    Only a response to the requester applies for rejected requests
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{report.research_summary}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Submitted by: {report.submitter}</span>
                <span>Reviewed by: {report.reviewer}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {report && (
          <>
            <RequesterResponseSection report={report} existing={existingRequesterResponse} />
            {!isRejected && <ForwardSection report={report} existing={existingForward} />}
          </>
        )}
      </div>
    </AppShell>
  );
}

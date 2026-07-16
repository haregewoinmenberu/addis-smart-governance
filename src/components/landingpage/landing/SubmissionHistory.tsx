import { useState, useEffect } from "react";
import { Copy, ExternalLink, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Submission {
  reference: string;
  serviceType: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected" | "under_review";
}

export function SubmissionHistory() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    try {
      const stored = localStorage.getItem("strp_submissions");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSubmissions(parsed);
      }
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success("Copied to clipboard!");
    }
  };

  const serviceLabels: Record<string, string> = {
    research: "Research Proposal",
    transformation: "Technology Transformation",
    licensing: "Professional Licensing",
    lms: "LMS Enrollment",
  };

  const statusConfig = {
    pending: {
      label: "Pending Review",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
    under_review: {
      label: "Under Review",
      icon: AlertCircle,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    },
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your submission history?")) {
      localStorage.removeItem("strp_submissions");
      setSubmissions([]);
      toast.success("History cleared");
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Your past service submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No submissions yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your submission history will appear here after you submit a service form
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""} saved locally
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear History
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission, index) => {
            const status = statusConfig[submission.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Service Type */}
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {serviceLabels[submission.serviceType] || submission.serviceType}
                      </p>
                      <Badge variant="outline" className={status.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>

                    {/* Reference Number */}
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {submission.reference}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(submission.reference)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(submission.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Track Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`/track-status?ref=${submission.reference}`, "_blank");
                    }}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Track
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Message */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Note:</strong> This history is stored locally in your browser. 
            Clear your browser data will remove this history. For official tracking, 
            use the reference number to check status on our portal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Search, Loader2, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusResult {
  reference_number: string;
  service_type: string;
  status: string;
  submitted_at: string;
  updated_at: string;
}

export function TrackStatus() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/service-forms/status/${referenceNumber}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No submission found with this reference number");
        }
        throw new Error("Failed to fetch status");
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; icon: any; className: string; description: string }> = {
    pending: {
      label: "Pending Review",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      description: "Your submission is in the queue and will be reviewed soon",
    },
    under_review: {
      label: "Under Review",
      icon: AlertCircle,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      description: "Our team is currently reviewing your submission",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      description: "Your submission has been approved! Check your email for next steps",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      description: "Your submission was not approved. Check your email for details",
    },
  };

  const serviceLabels: Record<string, string> = {
    research: "Research Proposal",
    transformation: "Technology Transformation Request",
    licensing: "Professional License Application",
    lms: "LMS Enrollment",
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Submission</CardTitle>
          <CardDescription>
            Enter your reference number to check the status of your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter reference number (e.g., RSH-20260710-ABC123)"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Track
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center py-4">
              {(() => {
                const config = statusConfig[result.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <StatusIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <Badge className={`${config.className} text-sm px-3 py-1`}>
                        {config.label}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        {config.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Details */}
            <div className="space-y-3 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                  <p className="font-mono text-sm mt-1">{result.reference_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                  <p className="text-sm mt-1">
                    {serviceLabels[result.service_type] || result.service_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-sm mt-1">
                    {new Date(result.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm mt-1">
                    {new Date(result.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">What's Next?</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {result.status === "pending" && (
                  <>
                    <li>Your submission is in the review queue</li>
                    <li>You'll receive an email notification when review begins</li>
                    <li>Expected review time: 3-5 business days</li>
                  </>
                )}
                {result.status === "under_review" && (
                  <>
                    <li>Our team is actively reviewing your submission</li>
                    <li>We may contact you if additional information is needed</li>
                    <li>Check your email regularly for updates</li>
                  </>
                )}
                {result.status === "approved" && (
                  <>
                    <li>Congratulations! Your submission has been approved</li>
                    <li>Check your email for detailed next steps</li>
                    <li>You may need to complete additional requirements</li>
                  </>
                )}
                {result.status === "rejected" && (
                  <>
                    <li>Your submission was not approved at this time</li>
                    <li>Check your email for the reason and feedback</li>
                    <li>You may be able to resubmit with corrections</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Need Help?</p>
            <p>
              If you have questions about your submission or need assistance, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email: support@strp.gov.et</li>
              <li>Phone: +251 11 XXX XXXX</li>
              <li>Office hours: Monday - Friday, 8:30 AM - 5:00 PM</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

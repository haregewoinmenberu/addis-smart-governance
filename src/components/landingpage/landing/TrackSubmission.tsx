import { useState } from "react";
import { Search, Loader2, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubmissionStatus {
  reference_number: string;
  service_type: string;
  status: string;
  submitted_at: string;
  updated_at: string;
}

export function TrackSubmission() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<SubmissionStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!referenceNumber.trim()) {
      toast.error("Please enter a reference number");
      return;
    }

    setLoading(true);
    setNotFound(false);
    setSubmission(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/service-forms/status/${referenceNumber.trim()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setSubmission(data.data);
      } else {
        setNotFound(true);
        toast.error("Submission not found", {
          description: "Please check your reference number and try again.",
        });
      }
    } catch (error) {
      toast.error("Error checking status", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      under_review: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const variant = variants[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-300";

    return (
      <Badge className={`${variant} border capitalize`}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const formatServiceType = (type: string) => {
    const types: Record<string, string> = {
      research: "Research & Innovation",
      transformation: "Technology Transformation",
      licensing: "Professional Licensing",
      lms: "Learning Management System",
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Track Your Submission</CardTitle>
          <CardDescription>
            Enter your reference number to check the status of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter reference number (e.g., RSH-20260709-ABC123)"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 h-11 rounded-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 px-6 rounded-lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>

          {submission && (
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reference Number</p>
                    <p className="text-lg font-semibold font-mono">
                      {submission.reference_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    {getStatusBadge(submission.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{formatServiceType(submission.service_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{submission.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted On</p>
                    <p className="font-medium text-sm">{formatDate(submission.submitted_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-sm">{formatDate(submission.updated_at)}</p>
                  </div>
                </div>

                {submission.status === "pending" && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      Your submission is being reviewed by our team. You will receive an email
                      notification once the review is complete.
                    </p>
                  </div>
                )}

                {submission.status === "approved" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900">
                      Congratulations! Your application has been approved. Check your email for
                      next steps.
                    </p>
                  </div>
                )}

                {submission.status === "rejected" && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900">
                      Your application was not approved. Please check your email for detailed
                      feedback and information about resubmission.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {notFound && (
            <Card className="border-2 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="font-semibold text-red-900">Submission Not Found</p>
                  <p className="text-sm text-red-700">
                    No submission found with reference number "{referenceNumber}". Please check
                    the number and try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Reference Number Format:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>RSH-</strong> Research & Innovation submissions</li>
              <li>• <strong>TTR-</strong> Technology Transformation requests</li>
              <li>• <strong>LIC-</strong> Professional Licensing applications</li>
              <li>• <strong>LMS-</strong> Learning Management System enrollments</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-2">
              Example: RSH-20260709-ABC123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

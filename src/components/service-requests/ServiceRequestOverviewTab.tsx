import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, User, Calendar, Building2, Hash, AlertCircle, Clock, CheckCircle2, XCircle, Paperclip, Eye } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  under_review: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  under_review: <AlertCircle className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  research: 'Research',
  transformation: 'Digital Transformation',
  licensing: 'Licensing',
  lms: 'LMS Enrollment',
};

const SERVICE_TYPE_COLORS: Record<string, string> = {
  research: 'bg-violet-100 text-violet-700 border-violet-200',
  transformation: 'bg-blue-100 text-blue-700 border-blue-200',
  licensing: 'bg-amber-100 text-amber-700 border-amber-200',
  lms: 'bg-green-100 text-green-700 border-green-200',
};

function prettifyKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

interface ServiceRequestOverviewTabProps {
  serviceRequest: any;
  onUpdate: () => void;
}

export default function ServiceRequestOverviewTab({ serviceRequest, onUpdate }: ServiceRequestOverviewTabProps) {
  const navigate = useNavigate();

  function viewFile(filePath: string, fileName: string) {
    navigate({
      to: '/documents/$id',
      params: { id: String(serviceRequest.id) },
      search: {
        path: filePath,
        name: fileName,
        returnTo: `/service-requests/${serviceRequest.id}/workspace`,
      },
    });
  }

  const attachments = serviceRequest.form_data?.attachments;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="border-border/60">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reference Number</p>
              <p className="text-sm font-mono font-bold flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                {serviceRequest.reference_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Service Type</p>
              <Badge className={`text-xs ${SERVICE_TYPE_COLORS[serviceRequest.service_type] ?? ''}`}>
                {SERVICE_TYPE_LABELS[serviceRequest.service_type] ?? serviceRequest.service_type}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge className={`text-xs flex w-fit items-center gap-1 ${STATUS_STYLES[serviceRequest.status] ?? ''}`}>
                {STATUS_ICON[serviceRequest.status]}
                {serviceRequest.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Submitted At</p>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(serviceRequest.submission_timestamp ?? serviceRequest.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Submitted By</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {serviceRequest.submitted_name ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">{serviceRequest.submitted_email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
              {serviceRequest.reviewed_by ? (
                <p className="text-sm font-medium text-blue-700 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {typeof serviceRequest.reviewed_by === 'object'
                    ? serviceRequest.reviewed_by.name
                    : `User #${serviceRequest.reviewed_by}`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Unassigned</p>
              )}
            </div>
            {serviceRequest.form_data?.institution && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Institution</p>
                <p className="text-sm flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {serviceRequest.form_data.institution}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Data */}
      <Card className="border-border/60">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Form Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {Object.entries(serviceRequest.form_data ?? {})
              .filter(([k]) => k !== 'attachments' && k !== 'agree')
              .map(([key, val]) => (
                <div
                  key={key}
                  className="grid grid-cols-[200px_1fr] gap-3 items-start border-b border-border/20 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs font-medium text-muted-foreground">{prettifyKey(key)}</span>
                  <span className="text-sm break-words">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Notes */}
      {serviceRequest.review_notes && (
        <Card className="border-blue-200 bg-blue-50/60">
          <CardHeader className="pb-4 border-b border-blue-200">
            <CardTitle className="text-sm font-semibold text-blue-900">Review Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm whitespace-pre-wrap">{serviceRequest.review_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {attachments && (
        <Card className="border-border/60">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Research: Supporting Letter */}
              {attachments.supportingLetter && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-accent/5 transition-colors">
                  <div className="h-10 w-10 rounded bg-violet-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {attachments.supportingLetter.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Supporting Letter • {(attachments.supportingLetter.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      viewFile(attachments.supportingLetter.path, attachments.supportingLetter.original_name)
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              )}

              {/* Transformation: Official Letter */}
              {attachments.officialLetter && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-accent/5 transition-colors">
                  <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {attachments.officialLetter.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Official Letter • {(attachments.officialLetter.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      viewFile(attachments.officialLetter.path, attachments.officialLetter.original_name)
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              )}

              {/* Licensing: Multiple Documents */}
              {attachments.documents &&
                Array.isArray(attachments.documents) &&
                attachments.documents.length > 0 &&
                attachments.documents.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-accent/5 transition-colors"
                  >
                    <div className="h-10 w-10 rounded bg-amber-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.original_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Document {index + 1} • {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => viewFile(doc.path, doc.original_name)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}

              {!attachments.supportingLetter &&
                !attachments.officialLetter &&
                (!attachments.documents || attachments.documents.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No files attached</p>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

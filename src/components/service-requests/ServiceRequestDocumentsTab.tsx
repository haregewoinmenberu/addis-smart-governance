import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Paperclip } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface ServiceRequestDocumentsTabProps {
  serviceRequest: any;
}

export default function ServiceRequestDocumentsTab({ serviceRequest }: ServiceRequestDocumentsTabProps) {
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

  if (!attachments) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p>No documents attached to this service request.</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
                onClick={() => viewFile(attachments.supportingLetter.path, attachments.supportingLetter.original_name)}
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
                onClick={() => viewFile(attachments.officialLetter.path, attachments.officialLetter.original_name)}
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
        </div>
      </CardContent>
    </Card>
  );
}

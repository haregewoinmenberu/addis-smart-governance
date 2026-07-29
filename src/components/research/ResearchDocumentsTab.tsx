import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchIdea } from '@/types/research';
import { FileText, Eye, Paperclip } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface ResearchDocumentsTabProps {
  researchIdea: ResearchIdea;
  onUpdate: () => void;
}

export default function ResearchDocumentsTab({ researchIdea, onUpdate }: ResearchDocumentsTabProps) {
  const navigate = useNavigate();

  function viewFile(fileId: number, fileName: string, filePath: string) {
    navigate({
      to: '/documents/$id',
      params: { id: String(researchIdea.id) },
      search: {
        path: filePath,
        name: fileName,
        returnTo: `/research/ideas/${researchIdea.id}/workspace`,
        type: 'research-idea',
        attachmentId: String(fileId),
      },
    });
  }

  const attachments = researchIdea.attachments || [];

  if (attachments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No documents attached to this research idea.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          Uploaded Files ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-accent/5 transition-colors"
            >
              <div className="h-10 w-10 rounded bg-violet-100 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{attachment.file_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {attachment.file_type || 'Document'} •{' '}
                  {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded on {new Date(attachment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => viewFile(attachment.id, attachment.file_name, attachment.file_path)}
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

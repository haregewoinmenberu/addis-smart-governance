import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResearchIdea } from '@/types/research';
import { FileText, Eye, Paperclip } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface ResearchOverviewTabProps {
  researchIdea: ResearchIdea;
}

export default function ResearchOverviewTab({ researchIdea }: ResearchOverviewTabProps) {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{researchIdea.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{researchIdea.problem_statement}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{researchIdea.objectives}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected Outcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{researchIdea.expected_outcome}</p>
        </CardContent>
      </Card>

      {researchIdea.government_sector && (
        <Card>
          <CardHeader>
            <CardTitle>Government Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{researchIdea.government_sector}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submitted By</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            {researchIdea.submitter?.name}
            {researchIdea.submitted_at && (
              <span className="text-sm text-gray-500 ml-2">
                on {new Date(researchIdea.submitted_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {researchIdea.attachments && researchIdea.attachments.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              Uploaded Files ({researchIdea.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {researchIdea.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-accent/5 transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-violet-100 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {attachment.file_type || 'Document'} •{' '}
                      {attachment.file_size
                        ? `${(attachment.file_size / 1024).toFixed(1)} KB`
                        : 'Unknown size'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      viewFile(attachment.id, attachment.file_name, attachment.file_path)
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

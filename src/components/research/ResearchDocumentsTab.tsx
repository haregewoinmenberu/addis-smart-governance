import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResearchIdea } from '@/types/research';
import { FileText, Eye, Paperclip, Edit, User, Clock } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

interface ResearchDocumentsTabProps {
  researchIdea: ResearchIdea;
  onUpdate: () => void;
}

interface AttachmentVersion {
  id: number;
  version_number: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  version_notes?: string;
  is_current: boolean;
  created_at: string;
  uploader?: {
    id: number;
    name: string;
  };
}

interface AttachmentWithPrivilege {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploaded_by: number;
  edited_by?: number;
  edited_at?: string;
  uploader?: {
    id: number;
    name: string;
  };
  last_editor?: {
    id: number;
    name: string;
  };
  versions?: AttachmentVersion[];
  can_edit?: boolean;
  edit_reason?: string;
}

export default function ResearchDocumentsTab({ researchIdea, onUpdate }: ResearchDocumentsTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [uploadingFileId, setUploadingFileId] = useState<number | null>(null);

  // Check edit privileges for each attachment
  const { data: attachmentsWithPrivileges, refetch: refetchPrivileges } = useQuery({
    queryKey: ['attachments-privileges', researchIdea.id],
    queryFn: async () => {
      const attachments = researchIdea.attachments || [];
      const privilegeChecks = await Promise.all(
        attachments.map(async (attachment) => {
          try {
            const response = await fetch(
              `/api/research-ideas/${researchIdea.id}/attachments/${attachment.id}/check-edit-privilege`,
              {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
              }
            );
            const data = await response.json();
            return {
              ...attachment,
              can_edit: data.can_edit,
              edit_reason: data.reason,
              uploader: attachment.uploader,
              last_editor: attachment.last_editor,
            };
          } catch (error) {
            return {
              ...attachment,
              can_edit: false,
              edit_reason: 'Unable to check privileges',
            };
          }
        })
      );
      return privilegeChecks;
    },
    enabled: (researchIdea.attachments?.length || 0) > 0,
  });

  // Mutation for uploading new version
  const uploadVersionMutation = useMutation({
    mutationFn: async ({ attachmentId, file }: { attachmentId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('_method', 'PUT');

      const response = await fetch(
        `/api/research-ideas/${researchIdea.id}/attachments/${attachmentId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create new version');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('New version created successfully');
      // Immediately update the local cache with the new data
      onUpdate();
      refetchPrivileges();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create new version');
    },
  });

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

  const handleFileEdit = async (attachmentId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFileId(attachmentId);
    toast.info(`Uploading ${file.name}...`);

    try {
      await uploadVersionMutation.mutateAsync({ attachmentId, file });
    } finally {
      setUploadingFileId(null);
      setEditingFileId(null);
    }
  };

  const attachments = attachmentsWithPrivileges || researchIdea.attachments || [];

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
          {attachments.map((attachment: AttachmentWithPrivilege) => {
            const isUploading = uploadingFileId === attachment.id;
            const hasVersions = (attachment.versions?.length || 0) > 0;
            const currentVersion = attachment.versions?.find(v => v.is_current);
            const olderVersions = attachment.versions?.filter(v => !v.is_current) || [];
            
            return (
            <div key={attachment.id} className="space-y-2">
              {/* Main Original Document */}
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                  isUploading
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/40 hover:border-primary/30 hover:bg-accent/5'
                }`}
              >
                <div className={`h-10 w-10 rounded flex items-center justify-center shrink-0 ${
                  isUploading ? 'bg-primary/20 animate-pulse' : 'bg-violet-100'
                }`}>
                  <FileText className={`h-5 w-5 ${isUploading ? 'text-primary' : 'text-violet-600'}`} />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {attachment.file_type || 'Document'} •{' '}
                      {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                      ORIGINAL
                    </Badge>
                  </div>

                  {/* Show uploading indicator */}
                  {isUploading && (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                      <span>Creating new version...</span>
                    </div>
                  )}

                  {/* Uploader metadata */}
                  {!isUploading && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          Uploaded by{' '}
                          <span className="font-medium text-foreground">
                            {attachment.uploader?.name || 'Unknown'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(attachment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Edit privilege badge */}
                  {!isUploading && attachment.can_edit !== undefined && (
                    <div className="flex items-center gap-2">
                      <Badge variant={attachment.can_edit ? 'default' : 'secondary'} className="text-xs">
                        {attachment.can_edit ? 'Can Edit' : 'View Only'}
                      </Badge>
                      {attachment.edit_reason && (
                        <span className="text-xs text-muted-foreground italic">{attachment.edit_reason}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => viewFile(attachment.id, attachment.file_name, attachment.file_path)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  {attachment.can_edit && !isUploading && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`file-edit-${attachment.id}`);
                          input?.click();
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        New Version
                      </Button>
                      <input
                        id={`file-edit-${attachment.id}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileEdit(attachment.id, e)}
                      />
                    </>
                  )}

                  {isUploading && (
                    <Button variant="ghost" size="sm" disabled>
                      <div className="h-4 w-4 mr-1 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Uploading
                    </Button>
                  )}
                </div>
              </div>

              {/* Versions (like replies) */}
              {hasVersions && (
                <div className="ml-12 space-y-2 border-l-2 border-primary/20 pl-4">
                  {/* Current Version (Final) */}
                  {currentVersion && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/40 bg-primary/5 shadow-sm">
                      <div className="h-9 w-9 rounded flex items-center justify-center shrink-0 bg-primary/30">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {currentVersion.file_name}
                              </p>
                              <Badge className="text-[10px] px-1.5 py-0.5 bg-primary">
                                FINAL v{currentVersion.version_number}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentVersion.file_type} •{' '}
                              {currentVersion.file_size ? `${(currentVersion.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Version Notes */}
                        {currentVersion.version_notes && (
                          <div className="p-2 rounded bg-amber-50 border border-amber-200">
                            <p className="text-xs text-amber-900">
                              <span className="font-medium">Note:</span> {currentVersion.version_notes}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              Edited by{' '}
                              <span className="font-medium text-foreground">
                                {currentVersion.uploader?.name || 'Unknown'}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(currentVersion.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => viewFile(attachment.id, currentVersion.file_name, currentVersion.file_path)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  )}

                  {/* Older Versions */}
                  {olderVersions.length > 0 && (
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 py-1">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        View {olderVersions.length} older version{olderVersions.length > 1 ? 's' : ''}
                      </summary>
                      <div className="mt-2 space-y-2">
                        {olderVersions.map((version) => (
                          <div
                            key={version.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 bg-muted">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {version.file_name}
                                </p>
                                <Badge variant="outline" className="text-[9px] px-1 py-0">
                                  v{version.version_number}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {version.file_type} •{' '}
                                {version.file_size ? `${(version.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
                              </p>
                              
                              {/* Version Notes */}
                              {version.version_notes && (
                                <div className="p-1.5 rounded bg-amber-50/50 border border-amber-200/50">
                                  <p className="text-[10px] text-amber-900">
                                    <span className="font-medium">Note:</span> {version.version_notes}
                                  </p>
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>
                                    <span className="font-medium text-foreground">
                                      {version.uploader?.name || 'Unknown'}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(version.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 shrink-0"
                              onClick={() => viewFile(attachment.id, version.file_name, version.file_path)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
      </CardContent>
    </Card>
  );
}

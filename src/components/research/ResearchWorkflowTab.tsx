import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ResearchIdea } from '@/types/research';
import { ResearchWorkflowProgress, ResearchWorkflowStage } from '@/types/research-workflow';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { CheckCircle, Circle, AlertCircle, Play, Check, X, ArrowRight, User, ShieldCheck, FileCheck, UserCog, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import TechnologyClearanceCertificate, { ClearanceCertificateData } from './TechnologyClearanceCertificate';
import { FILLABLE_BY_ROLE_LABELS } from './WorkflowStageForm';

interface ResearchWorkflowTabProps {
  researchIdea: ResearchIdea;
  progress: any;
  onUpdate: () => void;
}

export default function ResearchWorkflowTab({ researchIdea, progress, onUpdate }: ResearchWorkflowTabProps) {
  const [stages, setStages] = useState<ResearchWorkflowStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializingWorkflow, setInitializingWorkflow] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<ClearanceCertificateData | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const [officerAssignments, setOfficerAssignments] = useState<any[]>([]);
  const [assigningProgressId, setAssigningProgressId] = useState<number | null>(null);

  const userRoles = (user?.roles ?? []).map((r: any) => r.name);
  const isDirector = userRoles.includes('research_director');
  const isTeamLeader = userRoles.includes('research_team_leader');
  const isSystemAdmin = userRoles.includes('itdb_administrator');
  const isAdmin = userRoles.some((r: string) =>
    ['itdb_administrator', 'bureau_head', 'smart_city_sector_head'].includes(r)
  );
  const canAssignStageOfficer = isAdmin || isDirector || isTeamLeader;

  const canReviewStage = (progressItem: ResearchWorkflowProgress): boolean => {
    if (progressItem.status !== 'pending_review' || !progressItem.stage?.requires_approval) return false;
    // No per-stage approver designation exists: admins, the research director,
    // and the team leader assigned to this research may all review. The backend
    // enforces the actual assignment check for team leaders.
    return isAdmin || isDirector || isTeamLeader;
  };

  const canWorkOnStage = (progressItem: ResearchWorkflowProgress): boolean =>
    ['not_started', 'in_progress', 'revision_requested'].includes(progressItem.status);

  // Mirrors the backend's canBeWorkedOnBy() role restriction: itdb_administrator
  // always bypasses, a stage with no fillable_by_role is unrestricted, otherwise
  // only the matching role can start/work on it.
  const canFillRestrictedStage = (stage?: ResearchWorkflowStage): boolean => {
    if (isSystemAdmin) return true;
    if (!stage?.fillable_by_role) return true;
    return userRoles.includes(stage.fillable_by_role);
  };

  useEffect(() => {
    let mounted = true;
    const reqType = (researchIdea as any).request_type ?? 'system_request';
    researchWorkflowAPI.getStages(reqType)
      .then(r => { if (r.success && mounted) setStages(r.data); })
      .catch(e => { if (mounted) setError(e.message); });
    return () => { mounted = false; };
  }, [researchIdea]);

  useEffect(() => {
    if (!canAssignStageOfficer) return;
    let mounted = true;
    researchWorkflowAPI.getAssignments(researchIdea.id.toString())
      .then(r => {
        if (r.success && mounted) {
          setOfficerAssignments((r.data ?? []).filter((a: any) => a.assignment_type === 'officer'));
        }
      })
      .catch(() => { /* non-fatal — assign control just won't have options */ });
    return () => { mounted = false; };
  }, [researchIdea.id, canAssignStageOfficer]);

  const handleAssignStageOfficer = async (progressId: number, officerId: string) => {
    setAssigningProgressId(progressId);
    try {
      const r = await researchWorkflowAPI.assignStageOfficer(progressId.toString(), Number(officerId));
      if (r.success) {
        toast.success('Officer assigned to stage');
        onUpdate();
      } else {
        throw new Error(r.message);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign officer');
    } finally {
      setAssigningProgressId(null);
    }
  };

  const initializeWorkflow = async () => {
    if (initializingWorkflow) return;
    setInitializingWorkflow(true);
    try {
      const r = await researchWorkflowAPI.initializeWorkflow(researchIdea.id.toString());
      if (r.success) { toast.success('Evaluation process initialized'); onUpdate(); }
      else throw new Error(r.message);
    } catch (e: any) { setError(e.message); toast.error(e.message); }
    finally { setInitializingWorkflow(false); }
  };

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/research-workflow/ideas/${researchIdea.id}/clearance-certificate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setCertificateData(data.data);
        setShowCertificate(true);
      } else {
        toast.error('Failed to load clearance certificate');
      }
    } catch (e: any) {
      toast.error('Error loading clearance certificate');
    }
  };

  const handleStartStage = async (p: ResearchWorkflowProgress) => {
    setLoading(true);
    try { await researchWorkflowAPI.startStage(p.id.toString()); toast.success('Stage started'); onUpdate(); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleNavigateToWork = (p: ResearchWorkflowProgress) =>
    navigate({ to: '/research/ideas/$id/workflow/$progressId/work', params: { id: researchIdea.id.toString(), progressId: p.id.toString() } });

  const handleNavigateToReview = (p: ResearchWorkflowProgress) =>
    navigate({ to: '/research/ideas/$id/workflow/$progressId/review', params: { id: researchIdea.id.toString(), progressId: p.id.toString() } });

  const statusIcon = (s: string) => {
    if (['completed','approved'].includes(s)) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (s === 'in_progress') return <Play className="h-5 w-5 text-blue-500" />;
    if (s === 'pending_review') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (s === 'revision_requested') return <AlertCircle className="h-5 w-5 text-orange-500" />;
    if (s === 'rejected') return <X className="h-5 w-5 text-red-500" />;
    return <Circle className="h-5 w-5 text-gray-300" />;
  };

  const statusBadge = (s: string) => {
    const c: Record<string,string> = { not_started:'bg-gray-400', in_progress:'bg-blue-500', pending_review:'bg-yellow-500', approved:'bg-green-500', completed:'bg-green-600', revision_requested:'bg-orange-500', rejected:'bg-red-500' };
    return <Badge className={c[s] || 'bg-gray-400'}>{s.replace(/_/g,' ')}</Badge>;
  };

  return (
    <div className="space-y-4">
      {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 flex gap-2 text-red-700"><AlertCircle className="h-5 w-5"/><p className="text-sm">{error}</p></CardContent></Card>}

      {showCertificate && certificateData && (
        <div className="mb-6">
          <TechnologyClearanceCertificate certificate={certificateData} onClose={() => setShowCertificate(false)} />
        </div>
      )}

      {!progress?.progress?.length ? (
        <Card><CardContent className="p-6 text-center text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-gray-400"/>
            <p className="text-lg font-medium">Evaluation Process Not Initialized</p>
            <p className="text-sm">The technology evaluation process has not been started for this request.</p>
            {['approved', 'submitted', 'under_review'].includes(researchIdea.status as string) && (isDirector || isAdmin) && (
              <Button onClick={initializeWorkflow} disabled={initializingWorkflow} className="mt-2">
                {initializingWorkflow ? 'Initializing...' : 'Initialize Evaluation Process'}
              </Button>
            )}
          </div>
        </CardContent></Card>
      ) : (
        <>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600"/>
                <span className="font-medium text-blue-900">Evaluation Progress: {progress.percentage}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-blue-700">
                  {progress.progress.filter((p: ResearchWorkflowProgress) => ['completed','approved'].includes(p.status)).length} of {progress.progress.length} stages completed
                </div>
                {['approved', 'rejected'].includes(researchIdea.status as string) && (
                  <Button size="sm" variant="default" onClick={fetchCertificate} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    View Technology Clearance Certificate
                  </Button>
                )}
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width:`${progress.percentage}%`}}/>
            </div>
          </div>

          {progress.progress.map((pi: ResearchWorkflowProgress, idx: number) => (
            <Card key={pi.id} className={pi.status === 'in_progress' ? 'border-blue-500 border-2' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    {statusIcon(pi.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-500">Stage {idx+1}</span>
                        <h3 className="font-semibold">{pi.stage?.name}</h3>
                        {pi.stage?.is_required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        {pi.stage?.requires_approval && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 flex items-center gap-1">
                            <User className="h-3 w-3"/>Approval Required
                          </Badge>
                        )}
                        {pi.stage?.fillable_by_role && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                            <Lock className="h-3 w-3"/>
                            {FILLABLE_BY_ROLE_LABELS[pi.stage.fillable_by_role] ?? pi.stage.fillable_by_role}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pi.stage?.description}</p>
                      {pi.notes && <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">Notes: {pi.notes}</p>}
                      {pi.assigned_user && <p className="text-xs text-gray-500 mt-1">Assigned to: <span className="font-medium">{pi.assigned_user.name}</span></p>}
                      {pi.started_at && <p className="text-xs text-gray-500">Started: {new Date(pi.started_at).toLocaleDateString()}</p>}
                      {pi.submitted_at && <p className="text-xs text-gray-500">Submitted: {new Date(pi.submitted_at).toLocaleDateString()}</p>}
                      {pi.reviews && pi.reviews.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm border-l-2 border-blue-500">
                          <p className="font-medium">Latest Review:</p>
                          <p className="text-gray-600">{pi.reviews[0].review_comments}</p>
                          <p className="text-xs text-gray-500 mt-1">by {pi.reviews[0].reviewer?.name} on {new Date(pi.reviews[0].reviewed_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {canAssignStageOfficer && !['completed', 'approved'].includes(pi.status) && officerAssignments.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <UserCog className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Select
                            value={pi.assigned_user ? String(pi.assigned_user.id) : undefined}
                            onValueChange={(v) => handleAssignStageOfficer(pi.id, v)}
                            disabled={assigningProgressId === pi.id}
                          >
                            <SelectTrigger className="h-8 text-xs w-56">
                              <SelectValue placeholder="Assign officer to this stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {officerAssignments.map((a: any) => (
                                <SelectItem key={a.id} value={String(typeof a.assigned_to === 'object' ? a.assigned_to.id : a.assigned_to)}>
                                  {typeof a.assigned_to === 'object' ? a.assigned_to.name : `User #${a.assigned_to}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {statusBadge(pi.status)}
                    {!canFillRestrictedStage(pi.stage) && canWorkOnStage(pi) ? (
                      <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Not your role
                      </Badge>
                    ) : (
                      <>
                        {pi.status === 'not_started' && canWorkOnStage(pi) && (
                          <Button size="sm" onClick={() => handleStartStage(pi)} disabled={loading}><Play className="mr-1 h-3 w-3"/>Start</Button>
                        )}
                        {canWorkOnStage(pi) && pi.status !== 'not_started' && (
                          <Button size="sm" onClick={() => handleNavigateToWork(pi)} disabled={loading}>
                            <ArrowRight className="mr-1 h-3 w-3"/>{pi.status === 'revision_requested' ? 'Revise' : 'Work on Stage'}
                          </Button>
                        )}
                      </>
                    )}
                    {canReviewStage(pi) && (
                      <Button size="sm" variant="outline" onClick={() => handleNavigateToReview(pi)} disabled={loading} className="border-green-500 text-green-700 hover:bg-green-50">
                        <Check className="mr-1 h-3 w-3"/>Review Stage
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

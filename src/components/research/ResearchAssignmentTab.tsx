import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResearchIdea } from '@/types/research';
import { ResearchAssignment } from '@/types/research-workflow';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/rbac';

interface ResearchAssignmentTabProps {
  researchIdea: ResearchIdea;
  onUpdate: () => void;
}

export default function ResearchAssignmentTab({ researchIdea, onUpdate }: ResearchAssignmentTabProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ResearchAssignment[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [showTeamLeaderDialog, setShowTeamLeaderDialog] = useState(false);
  const [showOfficerDialog, setShowOfficerDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [canAssignTeamLeader, setCanAssignTeamLeader] = useState(false);
  const [canAssignOfficer, setCanAssignOfficer] = useState(false);

  // Check if current user is a team leader
  const isTeamLeader = user ? hasRole(user, 'research_team_leader') : false;

  useEffect(() => {
    fetchAssignments();
    checkPermissions();
  }, [researchIdea.id, isTeamLeader]);

  const fetchAssignments = async () => {
    try {
      const response = await researchWorkflowAPI.getAssignments(researchIdea.id.toString());
      if (response.success) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      // Try to fetch team leaders - if successful, user can assign team leaders
      try {
        const tlResponse = await researchWorkflowAPI.getAvailableTeamLeaders();
        if (tlResponse.success && tlResponse.data.length > 0) {
          setCanAssignTeamLeader(true);
          setTeamLeaders(tlResponse.data);
        }
      } catch (e) {
        setCanAssignTeamLeader(false);
      }

      // Try to fetch officers - if successful, user can assign officers
      try {
        let offResponse;
        
        // If user is a team leader, fetch only their team members
        if (isTeamLeader) {
          offResponse = await researchWorkflowAPI.getTeamLeaderMembers();
        } else {
          // For directors, fetch all available officers
          offResponse = await researchWorkflowAPI.getAvailableOfficers();
        }
        
        if (offResponse.success && offResponse.data.length > 0) {
          setCanAssignOfficer(true);
          setOfficers(offResponse.data);
        }
      } catch (e) {
        setCanAssignOfficer(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleAssignTeamLeader = async () => {
    if (!selectedUser) {
      toast.error('Please select a team leader');
      return;
    }

    setLoading(true);
    try {
      await researchWorkflowAPI.assignTeamLeader(researchIdea.id.toString(), {
        team_leader_id: parseInt(selectedUser),
        assignment_notes: notes || undefined,
      });
      toast.success('Team leader assigned successfully');
      setShowTeamLeaderDialog(false);
      setSelectedUser('');
      setNotes('');
      fetchAssignments();
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to assign team leader';
      toast.error(errorMessage);
      console.error('Assignment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedUser) {
      toast.error('Please select an officer');
      return;
    }

    setLoading(true);
    try {
      await researchWorkflowAPI.assignOfficer(researchIdea.id.toString(), {
        officer_id: parseInt(selectedUser),
        assignment_notes: notes || undefined,
      });
      toast.success('Officer assigned successfully');
      setShowOfficerDialog(false);
      setSelectedUser('');
      setNotes('');
      fetchAssignments();
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to assign officer';
      toast.error(errorMessage);
      console.error('Assignment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (assignmentId: number) => {
    setLoading(true);
    try {
      await researchWorkflowAPI.acceptAssignment(assignmentId.toString());
      toast.success('Assignment accepted');
      fetchAssignments();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssignment = async (assignmentId: number) => {
    setLoading(true);
    try {
      await researchWorkflowAPI.startAssignment(assignmentId.toString());
      toast.success('Assignment started');
      fetchAssignments();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start assignment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return <Badge className={colors[status]}>{status.replace(/_/g, ' ')}</Badge>;
  };

  const getAssignmentIcon = (type: string) => {
    return type === 'team_leader' ? '👨‍💼' : '👨‍🔬';
  };

  return (
    <div className="space-y-4">
      {/* Show hierarchy info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Assignment Hierarchy:</strong> Research Director assigns Team Leaders → Team Leaders assign Officers
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {canAssignTeamLeader && (
          <Button onClick={() => setShowTeamLeaderDialog(true)} disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Team Leader
          </Button>
        )}
        {canAssignOfficer && (
          <Button onClick={() => setShowOfficerDialog(true)} disabled={loading}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Officer
          </Button>
        )}
        {!canAssignTeamLeader && !canAssignOfficer && (
          <Card className="flex-1">
            <CardContent className="p-4 text-center text-gray-500">
              You do not have permission to assign team members. Only Directors can assign Team Leaders, and Team Leaders can assign Officers.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No assignments yet. Assign team members to start research work.
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getAssignmentIcon(assignment.assignment_type)}</span>
                      <div>
                        <p className="font-medium">
                          {typeof assignment.assigned_to === 'object' ? assignment.assigned_to.name : 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">{assignment.assignment_type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    {assignment.assignment_notes && (
                      <p className="text-sm text-gray-600 mt-2">{assignment.assignment_notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Assigned by {typeof assignment.assigned_by === 'object' ? assignment.assigned_by.name : 'Unknown'} on{' '}
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(assignment.status)}
                    {assignment.status === 'pending' && (
                      <Button size="sm" onClick={() => handleAcceptAssignment(assignment.id)} disabled={loading}>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                    )}
                    {assignment.status === 'accepted' && (
                      <Button size="sm" onClick={() => handleStartAssignment(assignment.id)} disabled={loading}>
                        <Clock className="mr-1 h-3 w-3" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showTeamLeaderDialog} onOpenChange={setShowTeamLeaderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Team Leader</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Team Leader</Label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                <option value="">-- Select --</option>
                {teamLeaders.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Assignment Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTeamLeaderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTeamLeader} disabled={loading}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOfficerDialog} onOpenChange={setShowOfficerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Research Officer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Officer</Label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border rounded-md px-3 py-2 mt-1"
              >
                <option value="">-- Select --</option>
                {officers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Assignment Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOfficerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignOfficer} disabled={loading}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Eye,
  UserPlus,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceFormSubmission {
  id: number;
  service_type: string;
  reference_number: string;
  form_data: any;
  submitted_by?: number;
  submitted_email?: string;
  submitted_name?: string;
  status: string;
  submission_timestamp: string;
  review_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  institution_id?: number;
  created_at: string;
  updated_at: string;
  institution?: {
    id: number;
    name: string;
    type: string;
  };
  submittedBy?: {
    id: number;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

interface DashboardStats {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  by_service_type: Record<string, number>;
  by_status: Record<string, number>;
}

export function SmartCityServiceRequestsDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ServiceFormSubmission | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assigned_to: '',
    notes: '',
  });
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch service requests
  const { data, isLoading } = useQuery({
    queryKey: ['smart-city-service-requests', search, filterServiceType, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterServiceType && filterServiceType !== 'all') params.append('service_type', filterServiceType);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await apiGet<{
        success: boolean;
        data: ServiceFormSubmission[];
        stats: DashboardStats;
        pagination: {
          total: number;
          current_page: number;
          last_page: number;
          per_page: number;
        };
      }>(`/smart-city/service-requests?${params.toString()}`);
      return response;
    },
  });

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['assignable-users'],
    queryFn: async () => {
      try {
        const response = await apiGet<{
          data: Array<{ id: number; name: string; email: string }>;
        }>('/users');
        return response;
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return { data: [] };
      }
    },
    retry: false,
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async (data: { id: number; assigned_to: string; notes: string }) => {
      return await apiPost(`/smart-city/service-requests/${data.id}/assign`, {
        assigned_to: parseInt(data.assigned_to),
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success('Service request assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['smart-city-service-requests'] });
      setShowAssignDialog(false);
      setAssignForm({ assigned_to: '', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign service request');
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (data: { id: number; approval_notes?: string }) => {
      return await apiPost(`/smart-city/service-requests/${data.id}/approve`, {
        approval_notes: data.approval_notes,
      });
    },
    onSuccess: () => {
      toast.success('Service request approved successfully');
      queryClient.invalidateQueries({ queryKey: ['smart-city-service-requests'] });
      setShowApproveDialog(false);
      setApprovalNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve service request');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (data: { id: number; rejection_reason: string }) => {
      return await apiPost(`/smart-city/service-requests/${data.id}/reject`, {
        rejection_reason: data.rejection_reason,
      });
    },
    onSuccess: () => {
      toast.success('Service request rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['smart-city-service-requests'] });
      setShowRejectDialog(false);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject service request');
    },
  });

  const handleViewDetails = async (submission: ServiceFormSubmission) => {
    const response = await apiGet<{ success: boolean; data: ServiceFormSubmission }>(`/smart-city/service-requests/${submission.id}`);
    setSelectedSubmission(response.data);
    setShowViewDialog(true);
  };

  const handleAssign = (submission: ServiceFormSubmission) => {
    setSelectedSubmission(submission);
    setAssignForm({
      assigned_to: '',
      notes: '',
    });
    setShowAssignDialog(true);
  };

  const handleApprove = (submission: ServiceFormSubmission) => {
    setSelectedSubmission(submission);
    setApprovalNotes('');
    setShowApproveDialog(true);
  };

  const handleReject = (submission: ServiceFormSubmission) => {
    setSelectedSubmission(submission);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedSubmission || !assignForm.assigned_to) {
      toast.error('Please select a user to assign');
      return;
    }
    assignMutation.mutate({
      id: selectedSubmission.id,
      assigned_to: assignForm.assigned_to,
      notes: assignForm.notes,
    });
  };

  const handleApproveSubmit = () => {
    if (!selectedSubmission) return;
    approveMutation.mutate({
      id: selectedSubmission.id,
      approval_notes: approvalNotes,
    });
  };

  const handleRejectSubmit = () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({
      id: selectedSubmission.id,
      rejection_reason: rejectionReason,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500',
      under_review: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      completed: 'bg-purple-500',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-500'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      research: 'Research',
      transformation: 'Transformation',
      licensing: 'Licensing',
      lms: 'LMS',
    };
    return labels[type] || type;
  };

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"> 
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ListChecks className="h-8 w-8" />
              Service Requests Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all service form submissions
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.under_review}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by reference, name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterServiceType} onValueChange={setFilterServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="transformation">Transformation</SelectItem>
                <SelectItem value="licensing">Licensing</SelectItem>
                <SelectItem value="lms">LMS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Submitter</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.reference_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getServiceTypeLabel(submission.service_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>{submission.submitted_name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {submission.submitted_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.institution ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span className="text-sm">{submission.institution.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(submission.submission_timestamp).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAssign(submission)}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Assign
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(submission)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(submission)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Request Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedSubmission?.reference_number}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Type</h3>
                  <Badge variant="outline">
                    {getServiceTypeLabel(selectedSubmission.service_type)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Submitter Information</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {selectedSubmission.submitted_name}<br />
                  <strong>Email:</strong> {selectedSubmission.submitted_email}<br />
                  {selectedSubmission.institution && (
                    <>
                      <strong>Institution:</strong> {selectedSubmission.institution.name}<br />
                    </>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Form Data</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedSubmission.form_data, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedSubmission.review_notes && (
                <div>
                  <h3 className="font-semibold mb-2">Review Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.review_notes}</p>
                </div>
              )}

              {selectedSubmission.reviewed_by && selectedSubmission.reviewedBy && (
                <div>
                  <h3 className="font-semibold mb-2">Reviewed By</h3>
                  <p className="text-sm">
                    {selectedSubmission.reviewedBy.name} ({selectedSubmission.reviewedBy.email})<br />
                    <span className="text-xs text-muted-foreground">
                      {selectedSubmission.reviewed_at && new Date(selectedSubmission.reviewed_at).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedSubmission && selectedSubmission.status === 'pending' && (
              <>
                <Button onClick={() => {
                  setShowViewDialog(false);
                  handleAssign(selectedSubmission);
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleApprove(selectedSubmission);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Service Request</DialogTitle>
            <DialogDescription>
              Select a user to handle this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assign To</label>
              <Select
                value={assignForm.assigned_to}
                onValueChange={(value) => setAssignForm({ ...assignForm, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {usersData?.data?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                placeholder="Add any notes or instructions..."
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Service Request</DialogTitle>
            <DialogDescription>
              Confirm approval for reference: {selectedSubmission?.reference_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Approval Notes (Optional)</label>
              <Textarea
                placeholder="Add any approval notes..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApproveSubmit}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Service Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rejection Reason *</label>
              <Textarea
                placeholder="Provide a detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
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
  Filter,
  Download,
  FileIcon,
  X,
  ChevronLeft,
  BarChart3,
  ListChecks,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

interface ResearchIdea {
  id: number;
  title: string;
  summary: string;
  problem_statement: string;
  objectives: string;
  expected_outcome: string;
  research_category: string;
  government_sector?: string;
  priority: string;
  status: string;
  assignment_status: string;
  submitted_by: number;
  sub_city_id?: number;
  assigned_to_smart_city: boolean;
  smart_city_assigned_at?: string;
  smart_city_notes?: string;
  assigned_to_director?: number;
  director_assigned_at?: string;
  director_notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  submitter?: {
    id: number;
    name: string;
    email: string;
  };
  assignedToDirector?: {
    id: number;
    name: string;
    email: string;
  };
  sub_city?: {
    id: number;
    name: string;
  };
  attachments?: Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
    created_at: string;
  }>;
}

interface DashboardStats {
  total: number;
  pending_review: number;
  assigned_to_director: number;
  in_research_review: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
}

export function SmartCityResearchDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState<ResearchIdea | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [assignForm, setAssignForm] = useState({
    director_id: '',
    smart_city_notes: '',
    priority: '',
  });

  // Fetch research ideas
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['smart-city_research_ideas', search, filterStatus, filterPriority, filterAssignment],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority && filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterAssignment && filterAssignment !== 'all') params.append('assignment_status', filterAssignment);
      
      const response = await apiGet<{
        success: boolean;
        data: ResearchIdea[];
        stats: DashboardStats;
        pagination: {
          total: number;
          current_page: number;
          last_page: number;
          per_page: number;
        };
      }>(`/smart-city/research/ideas?${params.toString()}`);
      return response;
    },
  });

  // Fetch directors list
  const { data: directorsData } = useQuery({
    queryKey: ['research-directors'],
    queryFn: async () => {
      try {
        const response = await apiGet<{
          data: Array<{ id: number; name: string; email: string }>;
        }>('/users?role=research_director');
        return response;
      } catch (error) {
        console.error('Failed to fetch research directors:', error);
        return { data: [] };
      }
    },
    retry: false,
  });

  // Assign to director mutation
  const assignMutation = useMutation({
    mutationFn: async (data: { id: number; director_id: string; smart_city_notes: string; priority?: string }) => {
      return await apiPost(`/smart-city/research/ideas/${data.id}/assign-to-director`, {
        director_id: parseInt(data.director_id),
        smart_city_notes: data.smart_city_notes,
        priority: data.priority || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Research idea assigned to Research Director successfully');
      queryClient.invalidateQueries({ queryKey: ['smart-city_research_ideas'] });
      setShowAssignDialog(false);
      setAssignForm({ director_id: '', smart_city_notes: '', priority: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign research idea');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes?: string }) => {
      return await apiPost(`/smart-city/research/ideas/${data.id}/status`, {
        status: data.status,
        smart_city_notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['smart-city_research_ideas'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const handleViewDetails = async (idea: ResearchIdea) => {
    // Fetch full details
    const response = await apiGet<{ success: boolean; data: ResearchIdea }>(`/smart-city/research/ideas/${idea.id}`);
    setSelectedIdea(response.data);
    setShowViewDialog(true);
  };

  const handleAssign = (idea: ResearchIdea) => {
    setSelectedIdea(idea);
    setAssignForm({
      director_id: '',
      smart_city_notes: '',
      priority: idea.priority,
    });
    setShowAssignDialog(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedIdea || !assignForm.director_id) {
      toast.error('Please select a Research Director');
      return;
    }
    assignMutation.mutate({
      id: selectedIdea.id,
      director_id: assignForm.director_id,
      smart_city_notes: assignForm.smart_city_notes,
      priority: assignForm.priority,
    });
  };

  const handlePreviewDocument = (doc: any) => {
    setPreviewDocument(doc);
    setShowDocumentPreview(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-500'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-400',
      medium: 'bg-blue-400',
      high: 'bg-orange-500',
      urgent: 'bg-red-600',
    };
    return (
      <Badge className={colors[priority] || 'bg-gray-400'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getAssignmentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_smart_city: 'bg-amber-500',
      assigned_to_director: 'bg-blue-500',
      in_research_review: 'bg-purple-500',
      rejected: 'bg-red-500',
    };
    return (
      <Badge className={colors[status] || 'bg-gray-500'}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"> 
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ListChecks className="h-8 w-8" />
              Smart City
            </h1>
            <p className="text-muted-foreground mt-1">
              Research Ideas Management & Assignment
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_review}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned to Director</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned_to_director}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Research Review</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_research_review}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search research ideas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterAssignment} onValueChange={setFilterAssignment}>
              <SelectTrigger>
                <SelectValue placeholder="Assignment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="pending_smart_city">Pending Review</SelectItem>
                <SelectItem value="assigned_to_director">Assigned to Director</SelectItem>
                <SelectItem value="in_research_review">In Research Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Research Ideas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Research Ideas</CardTitle>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Submitter</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Attachments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="truncate">{idea.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {idea.summary}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{idea.submitter?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {idea.submitter?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {idea.research_category.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(idea.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(idea.priority)}</TableCell>
                      <TableCell>{getStatusBadge(idea.status)}</TableCell>
                      <TableCell>{getAssignmentStatusBadge(idea.assignment_status)}</TableCell>
                      <TableCell>
                        {idea.attachments && idea.attachments.length > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewDocument(idea.attachments?.[0])}
                          >
                            <FileIcon className="h-3 w-3 mr-1" />
                            {idea.attachments.length}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(idea)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {idea.assignment_status === 'pending_smart_city' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAssign(idea)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
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
              <p>No research ideas found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Research Idea Details</DialogTitle>
            <DialogDescription>
              Complete information about the research idea
            </DialogDescription>
          </DialogHeader>
          {selectedIdea && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p>{selectedIdea.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  {getStatusBadge(selectedIdea.status)}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priority</h3>
                  {getPriorityBadge(selectedIdea.priority)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{selectedIdea.summary}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Problem Statement</h3>
                <p className="text-sm text-muted-foreground">{selectedIdea.problem_statement}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Objectives</h3>
                <p className="text-sm text-muted-foreground">{selectedIdea.objectives}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Expected Outcome</h3>
                <p className="text-sm text-muted-foreground">{selectedIdea.expected_outcome}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Submitter Information</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {selectedIdea.submitter?.name}<br />
                  <strong>Email:</strong> {selectedIdea.submitter?.email}
                </p>
              </div>

              {selectedIdea.smart_city_notes && (
                <div>
                  <h3 className="font-semibold mb-2">Smart City Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedIdea.smart_city_notes}</p>
                </div>
              )}

              {selectedIdea.attachments && selectedIdea.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Attachments ({selectedIdea.attachments.length})</h3>
                  <div className="space-y-2">
                    {selectedIdea.attachments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.file_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewDocument(doc)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`http://localhost:8000/storage/${doc.file_path}`, '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedIdea && selectedIdea.assignment_status === 'pending_smart_city' && (
              <Button onClick={() => {
                setShowViewDialog(false);
                handleAssign(selectedIdea);
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign to Director
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Director Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Research Director</DialogTitle>
            <DialogDescription>
              Select a Research Director to handle this research idea
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Research Director</label>
              <Select
                value={assignForm.director_id}
                onValueChange={(value) => setAssignForm({ ...assignForm, director_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Research Director" />
                </SelectTrigger>
                <SelectContent>
                  {directorsData?.data?.map((director) => (
                    <SelectItem key={director.id} value={director.id.toString()}>
                      {director.name} ({director.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority (Optional)</label>
              <Select
                value={assignForm.priority}
                onValueChange={(value) => setAssignForm({ ...assignForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                placeholder="Add any notes or instructions for the Research Director..."
                value={assignForm.smart_city_notes}
                onChange={(e) => setAssignForm({ ...assignForm, smart_city_notes: e.target.value })}
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

      {/* Document Preview Dialog */}
      <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Document Preview: {previewDocument?.file_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocumentPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[70vh] overflow-auto">
            {previewDocument && (
              <>
                {previewDocument.file_type?.includes('pdf') ? (
                  <iframe
                    src={`http://localhost:8000/storage/${previewDocument.file_path}`}
                    className="w-full h-full border-0"
                    title={previewDocument.file_name}
                  />
                ) : previewDocument.file_type?.includes('image') ? (
                  <img
                    src={`http://localhost:8000/storage/${previewDocument.file_path}`}
                    alt={previewDocument.file_name}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Preview not available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This file type cannot be previewed directly in the browser.
                    </p>
                    <Button
                      onClick={() => window.open(`http://localhost:8000/storage/${previewDocument.file_path}`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.open(`http://localhost:8000/storage/${previewDocument?.file_path}`, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setShowDocumentPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

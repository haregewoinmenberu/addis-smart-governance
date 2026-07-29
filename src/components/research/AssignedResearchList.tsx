import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { getAuthToken } from '@/lib/api';
import { Eye, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AssignedResearchList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // Fetch all research ideas assigned to current user
      const response = await fetch('/api/research-ideas', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch research ideas');
      
      const data = await response.json();
      
      // Filter only ideas where user is assigned as team leader or officer
      const ideas = data.data || [];
      
      // Fetch assignments for each idea to check if user is assigned
      const assignedIdeas = [];
      
      for (const idea of ideas) {
        try {
          const assignResponse = await fetch(`/api/research-workflow/ideas/${idea.id}/assignments`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          
          if (assignResponse.ok) {
            const assignData = await assignResponse.json();
            const userAssignments = (assignData.data || []).filter((a: any) => 
              a.assigned_to && 
              typeof a.assigned_to === 'object' && 
              a.assigned_to.id === getCurrentUserId()
            );
            
            if (userAssignments.length > 0) {
              assignedIdeas.push({
                ...idea,
                myAssignments: userAssignments,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching assignments for idea ${idea.id}:`, err);
        }
      }
      
      setAssignments(assignedIdeas);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assigned research');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    // Get current user ID from token or local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getAssignmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading assigned research...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assigned Research</h3>
            <p className="text-gray-500">
              You don't have any research assigned to you yet. Assignments will appear here when directors assign research to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Assigned Research ({assignments.length})</h2>
          </div>
          
          {assignments.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.research_category?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="outline">{idea.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{idea.summary}</p>
                
                {/* Show user's assignments */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Your Assignments:</p>
                  <div className="flex flex-wrap gap-2">
                    {idea.myAssignments?.map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center gap-2">
                        <Badge className={getAssignmentStatusColor(assignment.status)}>
                          {assignment.assignment_type === 'team_leader' ? '👨‍💼' : '👨‍🔬'} 
                          {assignment.assignment_type.replace(/_/g, ' ')} - {assignment.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Submitted by {idea.submitter?.name || 'Unknown'}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: `/research/ideas/${idea.id}/workspace` })}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Open Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

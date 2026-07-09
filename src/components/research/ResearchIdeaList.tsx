import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ResearchIdea, IdeaStatus, Priority } from '@/types/research';
import { Search, Plus, Eye } from 'lucide-react';

interface ResearchIdeaListProps {
  onViewIdea: (id: number) => void;
  onCreateIdea: () => void;
}

export default function ResearchIdeaList({ onViewIdea, onCreateIdea }: ResearchIdeaListProps) {
  const [ideas, setIdeas] = useState<ResearchIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchIdeas();
  }, [search, filterStatus]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/research-ideas?${params}`);
      const data = await response.json();
      setIdeas(data.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: IdeaStatus) => {
    const colors = {
      [IdeaStatus.DRAFT]: 'bg-gray-500',
      [IdeaStatus.SUBMITTED]: 'bg-blue-500',
      [IdeaStatus.UNDER_REVIEW]: 'bg-yellow-500',
      [IdeaStatus.APPROVED]: 'bg-green-500',
      [IdeaStatus.REJECTED]: 'bg-red-500',
    };
    return <Badge className={colors[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: 'bg-gray-400',
      [Priority.MEDIUM]: 'bg-blue-400',
      [Priority.HIGH]: 'bg-orange-400',
      [Priority.CRITICAL]: 'bg-red-500',
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Research Ideas</h2>
        <Button onClick={onCreateIdea}>
          <Plus className="mr-2 h-4 w-4" />
          New Idea
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-3"
        >
          <option value="">All Status</option>
          <option value={IdeaStatus.DRAFT}>Draft</option>
          <option value={IdeaStatus.SUBMITTED}>Submitted</option>
          <option value={IdeaStatus.UNDER_REVIEW}>Under Review</option>
          <option value={IdeaStatus.APPROVED}>Approved</option>
          <option value={IdeaStatus.REJECTED}>Rejected</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted by {idea.submitter?.name} on {new Date(idea.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(idea.status)}
                    {getPriorityBadge(idea.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 line-clamp-2">{idea.summary}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">{idea.research_category.replace('_', ' ')}</span>
                  <Button variant="outline" size="sm" onClick={() => onViewIdea(idea.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

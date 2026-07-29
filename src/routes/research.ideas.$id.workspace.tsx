import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import ResearchWorkspace from '@/components/research/ResearchWorkspace';
import { ResearchIdea } from '@/types/research';
import { getAuthToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/research/ideas/$id/workspace')({
  component: () => (
    <RequireAuth>
      <ResearchWorkspacePage />
    </RequireAuth>
  ),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || 'overview',
    };
  },
});

function ResearchWorkspacePage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [researchIdea, setResearchIdea] = useState<ResearchIdea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResearchIdea();
  }, [id]);

  const fetchResearchIdea = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/research-ideas/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      setResearchIdea(data.data);
    } catch (error) {
      console.error('Error fetching research idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    navigate({
      to: '/research/ideas/$id/workspace',
      params: { id },
      search: { tab: value },
      replace: true,
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-6">Loading...</div>
      </AppShell>
    );
  }

  if (!researchIdea) {
    return (
      <AppShell>
        <div className="p-6">Research idea not found</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <ResearchWorkspace 
          researchIdea={researchIdea} 
          onUpdate={fetchResearchIdea}
          activeTab={search.tab}
          onTabChange={handleTabChange}
        />
      </div>
    </AppShell>
  );
}

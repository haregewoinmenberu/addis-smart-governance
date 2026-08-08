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

  // Check if research can proceed to workflow
  const isApproved = researchIdea.status === 'approved';
  const hasDirector = !!researchIdea.assigned_to_director;
  const canAccessWorkflow = isApproved && hasDirector;

  if (!canAccessWorkflow) {
    return (
      <AppShell>
        <div className="container mx-auto p-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-amber-900 mb-2">
                    Workflow Not Available
                  </h3>
                  <p className="text-sm text-amber-800 mb-4">
                    This research request cannot proceed to workflow until the following conditions are met:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-amber-600">○</span>
                      )}
                      <span className={isApproved ? 'text-green-700' : 'text-amber-800'}>
                        Request must be <strong>approved</strong> 
                        {!isApproved && ` (Current status: ${researchIdea.status.replace(/_/g, ' ')})`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {hasDirector ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-amber-600">○</span>
                      )}
                      <span className={hasDirector ? 'text-green-700' : 'text-amber-800'}>
                        A <strong>research director</strong> must be assigned
                        {hasDirector && ` (Assigned to: ${researchIdea.assigned_director_name})`}
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-amber-200">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> The request must be reviewed and approved by authorized personnel before workflow stages can be initialized. 
                      Please contact the bureau head or sector head to approve this request and assign a research director.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Show basic request info */}
            <div className="mt-6 bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4">Request Details</h4>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-600">Title</dt>
                  <dd className="font-medium mt-1">{researchIdea.title}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Category</dt>
                  <dd className="font-medium mt-1">{researchIdea.research_category.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Submitted By</dt>
                  <dd className="font-medium mt-1">{researchIdea.submitter?.name || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Summary</dt>
                  <dd className="mt-1">{researchIdea.summary}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
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

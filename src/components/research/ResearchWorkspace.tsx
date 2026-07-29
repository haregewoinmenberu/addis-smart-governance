import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResearchOverviewTab from './ResearchOverviewTab';
import ResearchAssignmentTab from './ResearchAssignmentTab';
import ResearchWorkflowTab from './ResearchWorkflowTab';
import ResearchDocumentsTab from './ResearchDocumentsTab';
import ResearchHistoryTab from './ResearchHistoryTab';
import { ResearchIdea } from '@/types/research';
import { researchWorkflowAPI } from '@/lib/research-workflow-api';
import { useAuth } from '@/hooks/useAuth';

interface ResearchWorkspaceProps {
  researchIdea: ResearchIdea;
  onUpdate: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function ResearchWorkspace({ 
  researchIdea, 
  onUpdate,
  activeTab: controlledTab,
  onTabChange 
}: ResearchWorkspaceProps) {
  const { user } = useAuth();
  const [internalTab, setInternalTab] = useState('overview');
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const activeTab = controlledTab || internalTab;
  
  // Check user role
  const isResearchDirector = user?.roles?.some((role: any) => 
    role.name === 'research_director'
  );
  const isResearchTeamLeader = user?.roles?.some((role: any) => 
    role.name === 'research_team_leader'
  );
  const isResearchOfficer = user?.roles?.some((role: any) => 
    role.name === 'research_officer'
  );
  
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    } else {
      setInternalTab(value);
    }
  };

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await researchWorkflowAPI.getProgress(researchIdea.id.toString());
      if (response.success) {
        setProgress(response.data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [researchIdea.id]);

  const handleUpdate = () => {
    onUpdate();
    fetchProgress();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{researchIdea.title}</h1>
              <p className="text-sm text-gray-600">{researchIdea.research_category.replace(/_/g, ' ')}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(researchIdea.status)}>
                {researchIdea.status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">{researchIdea.priority}</Badge>
            </div>
          </div>
          
          {progress && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {researchIdea.assigned_director_name && (
            <div className="mt-4 text-sm text-gray-600">
              Assigned to: <span className="font-medium">{researchIdea.assigned_director_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className={`grid w-full ${isResearchTeamLeader || isResearchOfficer ? 'grid-cols-4' : 'grid-cols-5'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {(isResearchDirector || isResearchTeamLeader) && (
            <TabsTrigger value="assignment">
              {isResearchTeamLeader ? 'Team' : 'Assignment'}
            </TabsTrigger>
          )}
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ResearchOverviewTab researchIdea={researchIdea} />
        </TabsContent>

        {(isResearchDirector || isResearchTeamLeader) && (
          <TabsContent value="assignment">
            <ResearchAssignmentTab researchIdea={researchIdea} onUpdate={handleUpdate} />
          </TabsContent>
        )}

        <TabsContent value="workflow">
          <ResearchWorkflowTab 
            researchIdea={researchIdea} 
            progress={progress} 
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="documents">
          <ResearchDocumentsTab researchIdea={researchIdea} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="history">
          <ResearchHistoryTab researchIdea={researchIdea} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

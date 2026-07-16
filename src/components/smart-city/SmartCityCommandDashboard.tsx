import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ListChecks,
  Lightbulb,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { SmartCityResearchDashboard } from '@/components/research/SmartCityResearchDashboard';
import { SmartCityServiceRequestsDashboard } from './SmartCityServiceRequestsDashboard';

interface DashboardStats {
  research: {
    total: number;
    pending_review: number;
    assigned_to_director: number;
    in_research_review: number;
  };
  services: {
    total: number;
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

export function SmartCityCommandDashboard() {
  const [activeTab, setActiveTab] = useState('research'); // Start with research tab

  // Fetch combined stats only when on overview tab
  const { data: stats } = useQuery({
    queryKey: ['smart-city-combined-stats'],
    queryFn: async () => {
      try {
        const [researchData, servicesData] = await Promise.all([
          apiGet<{ success: boolean; data: { overview: any } }>('/smart-city/research/ideas/analytics'),
          apiGet<{ success: boolean; data: { overview: any } }>('/smart-city/service-requests/analytics'),
        ]);

        return {
          research: researchData.data.overview || {
            total: 0,
            pending_review: 0,
            assigned_to_director: 0,
            in_research_review: 0,
          },
          services: servicesData.data.overview || {
            total: 0,
            pending: 0,
            under_review: 0,
            approved: 0,
            rejected: 0,
          },
        };
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        return {
          research: {
            total: 0,
            pending_review: 0,
            assigned_to_director: 0,
            in_research_review: 0,
          },
          services: {
            total: 0,
            pending: 0,
            under_review: 0,
            approved: 0,
            rejected: 0,
          },
        };
      }
    },
    enabled: activeTab === 'overview', // Only fetch when overview tab is active
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ListChecks className="h-8 w-8" />
            Smart City Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Unified dashboard for research ideas and service requests management
          </p>
        </div>
      </div>

      {/* Overview Statistics */}
      {stats && activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Research Ideas Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Research Ideas
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.research.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.research.pending_review}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned to Director</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.research.assigned_to_director}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Research Review</CardTitle>
                  <Eye className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.research.in_research_review}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Service Requests Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Service Requests
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.services.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.services.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                  <Eye className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.services.under_review}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.services.approved}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.services.rejected}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => setActiveTab('research')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Manage Research Ideas</div>
                      <div className="text-xs text-muted-foreground">
                        Review and assign research ideas to directors
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => setActiveTab('services')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ClipboardCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Manage Service Requests</div>
                      <div className="text-xs text-muted-foreground">
                        Process service form submissions from institutions
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          {(stats.research.pending_review > 0 || stats.services.pending > 0) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {stats.research.pending_review > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800">
                        {stats.research.pending_review} research idea{stats.research.pending_review > 1 ? 's' : ''} awaiting review
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('research')}>
                        Review
                      </Button>
                    </div>
                  )}
                  {stats.services.pending > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800">
                        {stats.services.pending} service request{stats.services.pending > 1 ? 's' : ''} pending action
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('services')}>
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="research">Research Ideas</TabsTrigger>
          <TabsTrigger value="services">Service Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Content shown above */}
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <SmartCityResearchDashboard />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <SmartCityServiceRequestsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

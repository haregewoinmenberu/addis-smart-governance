import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResearchCategory, Priority } from '@/types/research';
import { useToast } from '@/hooks/use-toast';

interface ResearchIdeaFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export default function ResearchIdeaForm({ onSubmit, initialData, isEditing }: ResearchIdeaFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    problem_statement: initialData?.problem_statement || '',
    objectives: initialData?.objectives || '',
    expected_outcome: initialData?.expected_outcome || '',
    research_category: initialData?.research_category || '',
    government_sector: initialData?.government_sector || '',
    priority: initialData?.priority || 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: `Technology Request ${isEditing ? 'updated' : 'submitted'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit' : 'Submit'} Technology Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Request Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Smart Transport Management System Development"
              required
            />
          </div>

          <div>
            <Label htmlFor="summary">Executive Summary *</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              placeholder="High-level overview of the requested technology..."
              required
            />
          </div>

          <div>
            <Label htmlFor="problem_statement">Business Requirement & Justification *</Label>
            <Textarea
              id="problem_statement"
              value={formData.problem_statement}
              onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
              rows={4}
              placeholder="Detail current operational situation, pain points, and why this ICT request is needed..."
              required
            />
          </div>

          <div>
            <Label htmlFor="objectives">Expected Technical Scope & Objectives *</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={4}
              placeholder="Define specific technical objectives, modules, capacity, or deliverables..."
              required
            />
          </div>

          <div>
            <Label htmlFor="expected_outcome">Expected Business Impact & Deliverables *</Label>
            <Textarea
              id="expected_outcome"
              value={formData.expected_outcome}
              onChange={(e) => setFormData({ ...formData, expected_outcome: e.target.value })}
              rows={3}
              placeholder="Anticipated improvements, integration outcomes, and service metrics..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="research_category">Evaluation Category *</Label>
              <Select
                value={formData.research_category}
                onValueChange={(value) => setFormData({ ...formData, research_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Request Category" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 rounded-sm">
                    SYSTEM REQUESTS
                  </div>
                  <SelectItem value={ResearchCategory.SYSTEM_NEW}>New System Development Request</SelectItem>
                  <SelectItem value={ResearchCategory.SYSTEM_TRANSFER}>Existing System Transfer/Adoption Request</SelectItem>
                  <SelectItem value={ResearchCategory.SYSTEM_UPGRADE}>Existing System Upgrade Request</SelectItem>

                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 rounded-sm mt-1">
                    INFRASTRUCTURE REQUESTS
                  </div>
                  <SelectItem value={ResearchCategory.INFRASTRUCTURE_CLOUD}>Cloud Infrastructure Request</SelectItem>
                  <SelectItem value={ResearchCategory.INFRASTRUCTURE_SERVER}>Server Infrastructure Request</SelectItem>
                  <SelectItem value={ResearchCategory.INFRASTRUCTURE_NETWORK}>Network Infrastructure Request</SelectItem>
                  <SelectItem value={ResearchCategory.INFRASTRUCTURE_STORAGE}>Storage Infrastructure Request</SelectItem>
                  <SelectItem value={ResearchCategory.INFRASTRUCTURE_SECURITY}>Security Infrastructure Request</SelectItem>
                  <SelectItem value={ResearchCategory.INFRASTRUCTURE_DATA_CENTER}>Data Center Infrastructure Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Urgency & Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                  <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                  <SelectItem value={Priority.CRITICAL}>Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="government_sector">Requesting Entity / Sector</Label>
            <Input
              id="government_sector"
              value={formData.government_sector}
              onChange={(e) => setFormData({ ...formData, government_sector: e.target.value })}
              placeholder="e.g. Bureau of Health, Transport Authority"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : isEditing ? 'Update Technology Request' : 'Submit Technology Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


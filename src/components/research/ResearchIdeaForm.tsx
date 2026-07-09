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
        description: `Research idea ${isEditing ? 'updated' : 'created'} successfully`,
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
        <CardTitle>{isEditing ? 'Edit' : 'Submit'} Research Idea</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="problem_statement">Problem Statement *</Label>
            <Textarea
              id="problem_statement"
              value={formData.problem_statement}
              onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="objectives">Objectives *</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="expected_outcome">Expected Outcome *</Label>
            <Textarea
              id="expected_outcome"
              value={formData.expected_outcome}
              onChange={(e) => setFormData({ ...formData, expected_outcome: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="research_category">Research Category *</Label>
              <Select
                value={formData.research_category}
                onValueChange={(value) => setFormData({ ...formData, research_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResearchCategory.BASIC_RESEARCH}>Basic Research</SelectItem>
                  <SelectItem value={ResearchCategory.APPLIED_RESEARCH}>Applied Research</SelectItem>
                  <SelectItem value={ResearchCategory.EXPERIMENTAL_DEVELOPMENT}>Experimental Development</SelectItem>
                  <SelectItem value={ResearchCategory.INNOVATION}>Innovation</SelectItem>
                  <SelectItem value={ResearchCategory.PILOT_PROJECT}>Pilot Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
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
            <Label htmlFor="government_sector">Government Sector</Label>
            <Input
              id="government_sector"
              value={formData.government_sector}
              onChange={(e) => setFormData({ ...formData, government_sector: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Idea' : 'Submit Idea'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

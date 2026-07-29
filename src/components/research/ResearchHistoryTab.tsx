import { Card, CardContent } from '@/components/ui/card';
import { ResearchIdea } from '@/types/research';

interface ResearchHistoryTabProps {
  researchIdea: ResearchIdea;
}

export default function ResearchHistoryTab({ researchIdea }: ResearchHistoryTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-500 text-center">Activity history coming soon...</p>
      </CardContent>
    </Card>
  );
}

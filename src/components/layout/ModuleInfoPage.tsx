import { useQuery } from "@tanstack/react-query";
import { ModuleStub } from "@/components/layout/ModuleStub";
import { getModule } from "@/lib/api";

type ModuleInfoPageProps = {
  moduleKey: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackPoints: string[];
};

export function ModuleInfoPage({
  moduleKey,
  fallbackTitle,
  fallbackSubtitle,
  fallbackPoints,
}: ModuleInfoPageProps) {
  const moduleQuery = useQuery({
    queryKey: ["module", moduleKey],
    queryFn: async () => (await getModule(moduleKey)).data,
  });

  const title = moduleQuery.data?.title ?? fallbackTitle;
  const subtitle = moduleQuery.data?.subtitle ?? fallbackSubtitle;
  const points = moduleQuery.data?.points ?? fallbackPoints;

  return <ModuleStub title={title} subtitle={subtitle} points={points} />;
}

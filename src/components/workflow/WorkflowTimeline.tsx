import { Check, Clock, X, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkflowInstance, WorkflowStage } from "@/types/rbac";
import { formatDistanceToNow } from "date-fns";

interface WorkflowTimelineProps {
  instance: WorkflowInstance;
}

/**
 * Workflow Timeline Component
 * Displays the progress of a workflow instance through its stages
 */
export function WorkflowTimeline({ instance }: WorkflowTimelineProps) {
  const stages = instance.definition?.stages || [];
  const currentIndex = instance.current_stage_index;

  const getStageStatus = (index: number) => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) {
      if (instance.status === "rejected") return "rejected";
      if (instance.status === "revision_requested") return "revision";
      return "current";
    }
    return "pending";
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-green-600" />;
      case "current":
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case "rejected":
        return <X className="w-5 h-5 text-red-600" />;
      case "revision":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-300";
      case "current":
        return "bg-blue-100 border-blue-300";
      case "rejected":
        return "bg-red-100 border-red-300";
      case "revision":
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getApprovalForStage = (stageName: string) => {
    return instance.approvals?.find((a) => a.stage_name === stageName);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Workflow Progress</h3>

      <div className="space-y-4">
        {stages.map((stage: WorkflowStage, index: number) => {
          const status = getStageStatus(index);
          const approval = getApprovalForStage(stage.name);

          return (
            <div key={stage.name} className="relative">
              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-16 ${
                    status === "completed" ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}

              {/* Stage Card */}
              <div className={`flex gap-4 p-4 rounded-lg border-2 ${getStageColor(status)}`}>
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">{getStageIcon(status)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{stage.display_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                    </div>

                    <Badge
                      variant={status === "completed" ? "default" : "outline"}
                      className="flex-shrink-0"
                    >
                      Step {index + 1}
                    </Badge>
                  </div>

                  {/* Stage Details */}
                  <div className="mt-3 space-y-2">
                    {stage.required_role && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Required Role:</span>{" "}
                        {stage.required_role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                    )}

                    {approval && (
                      <div className="mt-2 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {approval.approver?.name || "System"}
                          </span>
                          {approval.actioned_at && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(approval.actioned_at), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>

                        {approval.comments && (
                          <p className="text-sm text-gray-600 italic">"{approval.comments}"</p>
                        )}

                        <Badge
                          variant={
                            approval.action === "approved"
                              ? "default"
                              : approval.action === "rejected"
                                ? "destructive"
                                : "outline"
                          }
                          className="mt-2"
                        >
                          {approval.action.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <Badge variant="outline" className="ml-2">
              {instance.status.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </div>
          <div>
            <span className="text-gray-600">Started:</span>
            <span className="ml-2 font-medium">
              {instance.started_at
                ? formatDistanceToNow(new Date(instance.started_at), { addSuffix: true })
                : "Not started"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

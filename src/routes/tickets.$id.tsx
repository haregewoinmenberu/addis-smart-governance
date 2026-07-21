import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  MessageSquare,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  User,
  Calendar,
  Tag,
  AlertTriangle,
} from "lucide-react";
import {
  getTicket,
  acceptTicket,
  resolveTicket,
  closeTicket,
  addTicketMessage,
  updateTicket,
  type SupportTicket,
} from "@/lib/api/tickets";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/tickets/$id")({
  component: () => (
    <RequireAuth>
      <AppShell>
        <TicketDetailPage />
      </AppShell>
    </RequireAuth>
  ),
});

function TicketDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [resolution, setResolution] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);

  const canManageTickets = hasPermission("accept_ticket") || hasPermission("update_ticket");

  const {
    data: ticket,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(Number(id)),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptTicket(Number(id)),
    onSuccess: () => {
      toast({ title: "Success", description: "Ticket accepted successfully" });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-statistics"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to accept ticket",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (resolutionText: string) => resolveTicket(Number(id), resolutionText),
    onSuccess: () => {
      toast({ title: "Success", description: "Ticket resolved successfully" });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-statistics"] });
      setShowResolveForm(false);
      setResolution("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to resolve ticket",
        variant: "destructive",
      });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeTicket(Number(id)),
    onSuccess: () => {
      toast({ title: "Success", description: "Ticket closed successfully" });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-statistics"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to close ticket",
        variant: "destructive",
      });
    },
  });

  const messageMutation = useMutation({
    mutationFn: (message: string) => addTicketMessage(Number(id), message, false),
    onSuccess: () => {
      toast({ title: "Success", description: "Message sent successfully" });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setNewMessage("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; priority?: string }) => updateTicket(Number(id), data),
    onSuccess: () => {
      toast({ title: "Success", description: "Ticket updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-statistics"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update ticket",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    messageMutation.mutate(newMessage);
  };

  const handleResolve = () => {
    if (!resolution.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a resolution description",
        variant: "destructive",
      });
      return;
    }
    resolveMutation.mutate(resolution);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "resolved":
        return "outline";
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "secondary";
      case "high":
        return "default";
      case "critical":
        return "destructive";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Loading ticket details...</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Ticket not found</div>
          <Button onClick={() => navigate({ to: "/tickets" })} className="mt-4" variant="outline">
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/tickets" })}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              #{ticket.ticket_number}
            </h1>
            <h2 className="text-xl text-muted-foreground">{ticket.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(ticket.status)} className="gap-1">
              {getStatusIcon(ticket.status)}
              {ticket.status.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge variant={getPriorityColor(ticket.priority)}>
              {ticket.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.resolution && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Resolution
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{ticket.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages/Conversation */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                {ticket.messages?.length || 0} message{ticket.messages?.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages && ticket.messages.length > 0 ? (
                <div className="space-y-4">
                  {ticket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.user_id === user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div
                        className={`flex-1 space-y-1 ${
                          message.user_id === user?.id ? "text-right" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          {message.user_id === user?.id ? (
                            <>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                              <span className="font-medium">You</span>
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{message.user?.name || "Support"}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </>
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.user_id === user?.id
                              ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                              : "bg-muted max-w-[80%]"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              )}

              {/* Add Message Form */}
              {ticket.status !== "closed" && (
                <div className="pt-4 border-t space-y-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    disabled={messageMutation.isPending}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={messageMutation.isPending || !newMessage.trim()}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {messageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Requester</p>
                  <p className="text-sm text-muted-foreground">{ticket.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{ticket.user?.email}</p>
                </div>
              </div>

              {ticket.assignedTo && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">{ticket.assignedTo.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground capitalize">{ticket.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.created_at), "PPp")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions - Support Officers */}
          {canManageTickets && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage this ticket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Update Priority */}
                {hasPermission("update_ticket") && ticket.status !== "closed" && (
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={ticket.priority}
                      onValueChange={(value) => updateMutation.mutate({ priority: value })}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Accept Ticket */}
                {hasPermission("accept_ticket") &&
                  ticket.status === "open" &&
                  !ticket.assigned_to && (
                    <Button
                      onClick={() => acceptMutation.mutate()}
                      disabled={acceptMutation.isPending}
                      className="w-full gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {acceptMutation.isPending ? "Accepting..." : "Accept Ticket"}
                    </Button>
                  )}

                {/* Resolve Ticket */}
                {hasPermission("resolve_ticket") && ticket.status === "in_progress" && (
                  <>
                    {!showResolveForm ? (
                      <Button
                        onClick={() => setShowResolveForm(true)}
                        className="w-full gap-2"
                        variant="default"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Resolve Ticket
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Describe the resolution..."
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleResolve}
                            disabled={resolveMutation.isPending}
                            className="flex-1"
                            size="sm"
                          >
                            {resolveMutation.isPending ? "Resolving..." : "Confirm"}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowResolveForm(false);
                              setResolution("");
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Close Ticket */}
                {hasPermission("close_ticket") && ticket.status === "resolved" && (
                  <Button
                    onClick={() => closeMutation.mutate()}
                    disabled={closeMutation.isPending}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4" />
                    {closeMutation.isPending ? "Closing..." : "Close Ticket"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

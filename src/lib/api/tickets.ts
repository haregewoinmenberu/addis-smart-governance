import { apiGet, apiPost, apiPut } from '../api';

export interface SupportTicket {
  id: number;
  ticket_number: string;
  user_id: number;
  assigned_to: number | null;
  title: string;
  category: 'technical' | 'account' | 'request' | 'training' | 'general' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  resolution: string | null;
  accepted_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  };
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTicketData {
  title: string;
  category: string;
  priority: string;
  description: string;
}

export interface TicketStatistics {
  total: number;
  open: number;
  assigned?: number;
  in_progress: number;
  resolved: number;
  closed?: number;
  my_tickets?: number;
}

/**
 * Get list of tickets
 */
export async function getTickets(params?: {
  status?: string;
  priority?: string;
  category?: string;
}) {
  return apiGet<{ data: SupportTicket[] }>('/support-tickets', params);
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(id: number) {
  return apiGet<SupportTicket>(`/support-tickets/${id}`);
}

/**
 * Create a new support ticket
 */
export async function createTicket(data: CreateTicketData) {
  return apiPost<{ message: string; ticket: SupportTicket }>('/support-tickets', data);
}

/**
 * Update ticket status or priority
 */
export async function updateTicket(id: number, data: { status?: string; priority?: string }) {
  return apiPut<{ message: string; ticket: SupportTicket }>(`/support-tickets/${id}`, data);
}

/**
 * Accept a ticket (support officers)
 */
export async function acceptTicket(id: number) {
  return apiPost<{ message: string; ticket: SupportTicket }>(`/support-tickets/${id}/accept`, {});
}

/**
 * Resolve a ticket
 */
export async function resolveTicket(id: number, resolution: string) {
  return apiPost<{ message: string; ticket: SupportTicket }>(`/support-tickets/${id}/resolve`, {
    resolution,
  });
}

/**
 * Close a ticket
 */
export async function closeTicket(id: number) {
  return apiPost<{ message: string; ticket: SupportTicket }>(`/support-tickets/${id}/close`, {});
}

/**
 * Add a message to a ticket
 */
export async function addTicketMessage(id: number, message: string, isInternal = false) {
  return apiPost<{ message: string; data: TicketMessage }>(
    `/support-tickets/${id}/messages`,
    { message, is_internal: isInternal }
  );
}

/**
 * Get ticket statistics
 */
export async function getTicketStatistics() {
  return apiGet<TicketStatistics>('/support-tickets/statistics');
}

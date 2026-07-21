<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SupportTicketController extends Controller
{
    /**
     * Display a listing of tickets
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        $query = SupportTicket::with(['user', 'assignedTo', 'messages']);

        // Filter based on user role
        if ($user->user_type === 'INSTITUTIONAL') {
            // Institutions see only their tickets
            $query->where('user_id', $user->id);
        } elseif ($user->hasPermission('accept_ticket')) {
            // Support officers see assigned tickets or unassigned tickets
            $query->where(function($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhereNull('assigned_to');
            });
        } else {
            // Other internal staff see their own tickets
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $tickets = $query->latest()->paginate(20);

        return response()->json($tickets);
    }

    /**
     * Store a newly created ticket
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|in:technical,account,request,training,general,other',
            'priority' => 'required|in:low,medium,high,critical',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $ticket = SupportTicket::create([
                'ticket_number' => $this->generateTicketNumber(),
                'user_id' => Auth::id(),
                'title' => $request->title,
                'category' => $request->category,
                'priority' => $request->priority,
                'description' => $request->description,
                'status' => 'open',
            ]);

            // Create initial message
            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'message' => $request->description,
                'is_internal' => false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Support ticket created successfully',
                'ticket' => $ticket->load(['user', 'messages'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified ticket
     */
    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'assignedTo', 'messages.user'])->findOrFail($id);
        
        $user = Auth::user();
        
        // Check access
        if ($user->user_type === 'INSTITUTIONAL' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->hasPermission('accept_ticket') && 
            $ticket->assigned_to !== $user->id && 
            $ticket->assigned_to !== null) {
            // Support officers can only see their assigned tickets
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($ticket);
    }

    /**
     * Update the specified ticket
     */
    public function update(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:open,assigned,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,critical',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket->update($request->only(['status', 'priority']));

        return response()->json([
            'message' => 'Ticket updated successfully',
            'ticket' => $ticket->load(['user', 'assignedTo', 'messages'])
        ]);
    }

    /**
     * Accept a ticket (support officer)
     */
    public function accept($id)
    {
        if (!Auth::user()->hasPermission('accept_ticket')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket = SupportTicket::findOrFail($id);

        if ($ticket->assigned_to !== null) {
            return response()->json(['message' => 'Ticket already assigned'], 400);
        }

        $ticket->update([
            'assigned_to' => Auth::id(),
            'status' => 'assigned',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Ticket accepted successfully',
            'ticket' => $ticket->load(['user', 'assignedTo'])
        ]);
    }

    /**
     * Resolve a ticket
     */
    public function resolve(Request $request, $id)
    {
        if (!Auth::user()->hasPermission('resolve_ticket')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'resolution' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'status' => 'resolved',
            'resolution' => $request->resolution,
            'resolved_at' => now(),
        ]);

        // Add resolution message
        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => "Resolution: " . $request->resolution,
            'is_internal' => false,
        ]);

        return response()->json([
            'message' => 'Ticket resolved successfully',
            'ticket' => $ticket->load(['user', 'assignedTo', 'messages'])
        ]);
    }

    /**
     * Close a ticket
     */
    public function close($id)
    {
        if (!Auth::user()->hasPermission('close_ticket')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Ticket closed successfully',
            'ticket' => $ticket->load(['user', 'assignedTo'])
        ]);
    }

    /**
     * Add a message to ticket
     */
    public function addMessage(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = SupportTicket::findOrFail($id);
        
        // Check access
        $user = Auth::user();
        if ($user->user_type === 'INSTITUTIONAL' && $ticket->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message,
            'is_internal' => $request->is_internal ?? false,
        ]);

        // Update ticket status if needed
        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'in_progress']);
        }

        return response()->json([
            'message' => 'Message added successfully',
            'data' => $message->load('user')
        ], 201);
    }

    /**
     * Generate unique ticket number
     */
    private function generateTicketNumber()
    {
        $year = date('Y');
        $lastTicket = SupportTicket::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastTicket ? ((int) substr($lastTicket->ticket_number, -5)) + 1 : 1;

        return 'TKT-' . $year . '-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get ticket statistics
     */
    public function statistics()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        if ($user->hasPermission('accept_ticket')) {
            // Support officer stats
            $stats = [
                'total' => SupportTicket::count(),
                'open' => SupportTicket::where('status', 'open')->count(),
                'assigned' => SupportTicket::where('assigned_to', $user->id)->count(),
                'in_progress' => SupportTicket::where('assigned_to', $user->id)->where('status', 'in_progress')->count(),
                'resolved' => SupportTicket::where('assigned_to', $user->id)->where('status', 'resolved')->count(),
                'my_tickets' => SupportTicket::where('assigned_to', $user->id)->count(),
            ];
        } else {
            // Regular user stats
            $stats = [
                'total' => SupportTicket::where('user_id', $user->id)->count(),
                'open' => SupportTicket::where('user_id', $user->id)->where('status', 'open')->count(),
                'in_progress' => SupportTicket::where('user_id', $user->id)->where('status', 'in_progress')->count(),
                'resolved' => SupportTicket::where('user_id', $user->id)->where('status', 'resolved')->count(),
                'closed' => SupportTicket::where('user_id', $user->id)->where('status', 'closed')->count(),
            ];
        }

        return response()->json($stats);
    }
}

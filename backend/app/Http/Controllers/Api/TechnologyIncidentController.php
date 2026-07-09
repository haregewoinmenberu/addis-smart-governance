<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TechnologyIncident;
use App\Models\TechnologyAuditLog;
use Illuminate\Http\Request;

class TechnologyIncidentController extends Controller
{
    public function index(Request $request)
    {
        $query = TechnologyIncident::with(['registry', 'reporter', 'assignee']);

        if ($request->severity) {
            $query->where('severity', $request->severity);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->incident_type) {
            $query->where('incident_type', $request->incident_type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'technology_registry_id' => 'required|exists:technology_registry,id',
            'incident_type' => 'required|string',
            'severity' => 'required|string',
            'title' => 'required|string',
            'description' => 'required|string',
            'impact' => 'nullable|string',
        ]);

        $validated['reported_by'] = auth()->id();
        $validated['reported_at'] = now();
        $validated['status'] = 'reported';

        $incident = TechnologyIncident::create($validated);

        TechnologyAuditLog::log('incident_created', $incident, null, $validated);

        return response()->json($incident->load('registry'), 201);
    }

    public function show(TechnologyIncident $technologyIncident)
    {
        return response()->json($technologyIncident->load(['registry', 'reporter', 'assignee', 'actions']));
    }

    public function update(Request $request, TechnologyIncident $technologyIncident)
    {
        $validated = $request->validate([
            'status' => 'sometimes|string',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution' => 'nullable|string',
        ]);

        $oldValues = $technologyIncident->toArray();
        $technologyIncident->update($validated);

        TechnologyAuditLog::log('updated', $technologyIncident, $oldValues, $validated);

        return response()->json($technologyIncident);
    }

    public function acknowledge(TechnologyIncident $technologyIncident)
    {
        $technologyIncident->update([
            'status' => 'investigating',
            'acknowledged_at' => now(),
        ]);

        return response()->json($technologyIncident);
    }

    public function resolve(Request $request, TechnologyIncident $technologyIncident)
    {
        $validated = $request->validate([
            'resolution' => 'required|string',
        ]);

        $technologyIncident->update([
            'status' => 'resolved',
            'resolution' => $validated['resolution'],
            'resolved_at' => now(),
        ]);

        return response()->json($technologyIncident);
    }
}

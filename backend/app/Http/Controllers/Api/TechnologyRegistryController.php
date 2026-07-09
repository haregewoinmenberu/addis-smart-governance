<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TechnologyRegistry;
use App\Models\TechnologyRequest;
use App\Models\TechnologyAuditLog;
use Illuminate\Http\Request;

class TechnologyRegistryController extends Controller
{
    public function index(Request $request)
    {
        $query = TechnologyRegistry::with(['technologyRequest', 'ownerDepartment']);

        if ($request->technology_status) {
            $query->where('technology_status', $request->technology_status);
        }

        if ($request->compliance_status) {
            $query->where('compliance_status', $request->compliance_status);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('registry_number', 'like', "%{$request->search}%")
                  ->orWhereHas('technologyRequest', function($subQ) use ($request) {
                      $subQ->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'technology_request_id' => 'required|exists:technology_requests,id',
            'license_type' => 'required|string',
            'license_expiration' => 'nullable|date',
            'owner_department_id' => 'nullable|exists:institutions,id',
            'government_sector' => 'nullable|string',
            'support_contact' => 'required|string',
        ]);

        $validated['registered_by'] = auth()->id();
        $validated['registered_at'] = now();
        $validated['technology_status'] = 'active';

        $registry = TechnologyRegistry::create($validated);

        TechnologyAuditLog::log('registered', $registry, null, $validated);

        return response()->json($registry->load('technologyRequest'), 201);
    }

    public function show(TechnologyRegistry $technologyRegistry)
    {
        return response()->json($technologyRegistry->load([
            'technologyRequest', 'ownerDepartment', 'licenses', 'deployments', 'monitoring', 'incidents'
        ]));
    }

    public function update(Request $request, TechnologyRegistry $technologyRegistry)
    {
        $validated = $request->validate([
            'license_type' => 'sometimes|string',
            'compliance_status' => 'sometimes|string',
            'technology_status' => 'sometimes|string',
        ]);

        $oldValues = $technologyRegistry->toArray();
        $technologyRegistry->update($validated);

        TechnologyAuditLog::log('updated', $technologyRegistry, $oldValues, $validated);

        return response()->json($technologyRegistry);
    }

    public function search(Request $request)
    {
        $query = $request->input('q');
        
        $results = TechnologyRegistry::whereHas('technologyRequest', function($q) use ($query) {
            $q->where('name', 'like', "%{$query}%");
        })->orWhere('registry_number', 'like', "%{$query}%")
          ->with('technologyRequest')
          ->limit(10)
          ->get();

        return response()->json($results);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchProject;
use App\Models\TechnologyTransfer;
use App\Models\ResearchActivityLog;
use Illuminate\Http\Request;

class TechnologyTransferController extends Controller
{
    public function index(Request $request)
    {
        $query = TechnologyTransfer::with(['researchProject', 'transferredBy']);

        if ($request->deployment_status) {
            $query->where('deployment_status', $request->deployment_status);
        }

        if ($request->commercialization_status) {
            $query->where('commercialization_status', $request->commercialization_status);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('receiving_organization', 'like', "%{$request->search}%")
                  ->orWhereHas('researchProject', function($subQ) use ($request) {
                      $subQ->where('title', 'like', "%{$request->search}%");
                  });
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'transfer_package' => 'required|string',
            'receiving_organization' => 'required|string',
            'deployment_plan' => 'required|string',
            'training_plan' => 'required|string',
            'documentation' => 'required|string',
            'intellectual_property' => 'nullable|string',
            'commercialization_status' => 'required|string',
            'deployment_status' => 'required|string',
            'transferred_at' => 'nullable|date',
        ]);

        $validated['transferred_by'] = auth()->id();

        $transfer = TechnologyTransfer::create($validated);

        ResearchActivityLog::log('transferred', $transfer->researchProject, null, $validated, 'Technology transfer initiated');

        return response()->json($transfer->load(['researchProject', 'transferredBy']), 201);
    }

    public function show(TechnologyTransfer $technologyTransfer)
    {
        return response()->json($technologyTransfer->load([
            'researchProject.projectLead',
            'transferredBy'
        ]));
    }

    public function update(Request $request, TechnologyTransfer $technologyTransfer)
    {
        $validated = $request->validate([
            'transfer_package' => 'sometimes|string',
            'receiving_organization' => 'sometimes|string',
            'deployment_plan' => 'sometimes|string',
            'training_plan' => 'sometimes|string',
            'documentation' => 'sometimes|string',
            'intellectual_property' => 'nullable|string',
            'commercialization_status' => 'sometimes|string',
            'deployment_status' => 'sometimes|string',
            'transferred_at' => 'nullable|date',
        ]);

        $oldValues = $technologyTransfer->toArray();
        $technologyTransfer->update($validated);

        ResearchActivityLog::log('updated', $technologyTransfer, $oldValues, $validated, 'Technology transfer updated');

        return response()->json($technologyTransfer->load(['researchProject', 'transferredBy']));
    }

    public function destroy(TechnologyTransfer $technologyTransfer)
    {
        ResearchActivityLog::log('deleted', $technologyTransfer, $technologyTransfer->toArray(), null, 'Technology transfer deleted');
        
        $technologyTransfer->delete();

        return response()->json(['message' => 'Technology transfer deleted successfully']);
    }

    public function byProject(ResearchProject $researchProject)
    {
        $transfers = $researchProject->technologyTransfers()
            ->with('transferredBy')
            ->latest()
            ->get();

        return response()->json($transfers);
    }

    public function updateStatus(Request $request, TechnologyTransfer $technologyTransfer)
    {
        $validated = $request->validate([
            'deployment_status' => 'sometimes|string',
            'commercialization_status' => 'sometimes|string',
        ]);

        $technologyTransfer->update($validated);

        return response()->json($technologyTransfer);
    }

    public function statistics()
    {
        $stats = [
            'total_transfers' => TechnologyTransfer::count(),
            'by_deployment_status' => TechnologyTransfer::selectRaw('deployment_status, count(*) as count')
                ->groupBy('deployment_status')
                ->get(),
            'by_commercialization_status' => TechnologyTransfer::selectRaw('commercialization_status, count(*) as count')
                ->groupBy('commercialization_status')
                ->get(),
            'recent_transfers' => TechnologyTransfer::with(['researchProject', 'transferredBy'])
                ->latest()
                ->take(10)
                ->get(),
            'success_rate' => $this->calculateSuccessRate(),
        ];

        return response()->json($stats);
    }

    protected function calculateSuccessRate()
    {
        $total = TechnologyTransfer::count();
        if ($total === 0) return 0;

        $successful = TechnologyTransfer::whereIn('deployment_status', ['completed'])
            ->whereIn('commercialization_status', ['commercial', 'scaled'])
            ->count();

        return round(($successful / $total) * 100, 2);
    }
}

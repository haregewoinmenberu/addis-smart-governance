<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Technology;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class TechnologyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Technology::query()->orderByDesc('created_at');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('owner_office', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by classification
        if ($classification = $request->input('classification')) {
            $query->where('classification', $classification);
        }

        // Filter by owner office
        if ($office = $request->input('owner_office')) {
            $query->where('owner_office', $office);
        }

        // Filter by user's sub-city (for Sub-City Admins)
        $user = auth()->user();
        if ($user && $user->isSubCityAdministrator() && $user->sub_city) {
            $query->where('owner_office', $user->sub_city);
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $data = $query->paginate($perPage);

        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'owner_office' => ['required', 'string'],
            'status' => ['required', 'in:Active,Inactive,In review,Paused,Pending'],
            'classification' => ['required', 'in:Tier-1,Tier-2,Tier-3'],
            'location' => ['required', 'string'],
            'deployed_at' => ['nullable', 'date'],
        ]);

        $technology = Technology::create($data);

        ActivityLog::log('create', 'technologies', $technology, null, $data);

        return response()->json([
            'message' => 'Technology created successfully',
            'data' => $technology,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $technology = Technology::findOrFail($id);

        return response()->json(['data' => $technology]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $technology = Technology::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string'],
            'owner_office' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:Active,Inactive,In review,Paused,Pending'],
            'classification' => ['sometimes', 'in:Tier-1,Tier-2,Tier-3'],
            'location' => ['sometimes', 'string'],
            'deployed_at' => ['nullable', 'date'],
        ]);

        $oldValues = $technology->toArray();
        $technology->update($data);

        ActivityLog::log('update', 'technologies', $technology, $oldValues, $technology->toArray());

        return response()->json([
            'message' => 'Technology updated successfully',
            'data' => $technology,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $technology = Technology::findOrFail($id);

        ActivityLog::log('delete', 'technologies', $technology, $technology->toArray(), null);

        $technology->delete();

        return response()->json(['message' => 'Technology deleted successfully']);
    }

    /**
     * Get technology statistics.
     */
    public function statistics()
    {
        $user = auth()->user();
        $query = Technology::query();

        // Filter by sub-city for Sub-City Admins
        if ($user->isSubCityAdministrator() && $user->sub_city) {
            $query->where('owner_office', $user->sub_city);
        }

        $total = $query->count();
        $active = (clone $query)->where('status', 'Active')->count();
        $inactive = (clone $query)->where('status', 'Inactive')->count();
        $pending = (clone $query)->where('status', 'Pending')->count();

        $byCategory = Technology::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get();

        return response()->json([
            'data' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'pending' => $pending,
                'by_category' => $byCategory,
            ],
        ]);
    }
}

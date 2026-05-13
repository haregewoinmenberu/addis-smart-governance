<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Vendor::orderByDesc('score')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'status' => ['required', 'string'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'active_projects' => ['nullable', 'integer', 'min:0'],
            'sla_breaches' => ['nullable', 'integer', 'min:0'],
            'last_reviewed_at' => ['nullable', 'date'],
        ]);

        $vendor = Vendor::create($data);

        return response()->json(['data' => $vendor], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Vendor::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $vendor = Vendor::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'active_projects' => ['nullable', 'integer', 'min:0'],
            'sla_breaches' => ['nullable', 'integer', 'min:0'],
            'last_reviewed_at' => ['nullable', 'date'],
        ]);

        $vendor->update($data);

        return response()->json(['data' => $vendor]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

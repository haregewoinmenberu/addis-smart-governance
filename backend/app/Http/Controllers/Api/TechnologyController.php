<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Technology;
use Illuminate\Http\Request;

class TechnologyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Technology::orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'category' => ['required', 'string'],
            'owner_office' => ['required', 'string'],
            'status' => ['required', 'string'],
            'classification' => ['required', 'string'],
            'location' => ['required', 'string'],
            'deployed_at' => ['nullable', 'date'],
        ]);

        $technology = Technology::create($data);

        return response()->json(['data' => $technology], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Technology::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $technology = Technology::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string'],
            'owner_office' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'classification' => ['sometimes', 'string'],
            'location' => ['sometimes', 'string'],
            'deployed_at' => ['nullable', 'date'],
        ]);

        $technology->update($data);

        return response()->json(['data' => $technology]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $technology = Technology::findOrFail($id);
        $technology->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

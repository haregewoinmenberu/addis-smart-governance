<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeasibilityStudy;
use Illuminate\Http\Request;

class FeasibilityStudyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => FeasibilityStudy::orderByDesc('reviewed_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'office' => ['required', 'string'],
            'status' => ['required', 'string'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'reviewed_at' => ['nullable', 'date'],
        ]);

        $study = FeasibilityStudy::create($data);

        return response()->json(['data' => $study], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => FeasibilityStudy::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $study = FeasibilityStudy::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'office' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'reviewed_at' => ['nullable', 'date'],
        ]);

        $study->update($data);

        return response()->json(['data' => $study]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $study = FeasibilityStudy::findOrFail($id);
        $study->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

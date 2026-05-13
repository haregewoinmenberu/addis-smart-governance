<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DuplicationCase;
use Illuminate\Http\Request;

class DuplicationCaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => DuplicationCase::orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'systems' => ['required', 'array'],
            'systems.*' => ['string'],
            'similarity_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'status' => ['required', 'string'],
            'recommendation' => ['nullable', 'string'],
        ]);

        $case = DuplicationCase::create($data);

        return response()->json(['data' => $case], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => DuplicationCase::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $case = DuplicationCase::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'systems' => ['sometimes', 'array'],
            'systems.*' => ['string'],
            'similarity_score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'status' => ['sometimes', 'string'],
            'recommendation' => ['nullable', 'string'],
        ]);

        $case->update($data);

        return response()->json(['data' => $case]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $case = DuplicationCase::findOrFail($id);
        $case->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

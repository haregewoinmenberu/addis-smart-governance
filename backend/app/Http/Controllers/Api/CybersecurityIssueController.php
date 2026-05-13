<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CybersecurityIssue;
use Illuminate\Http\Request;

class CybersecurityIssueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => CybersecurityIssue::orderByDesc('detected_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'system' => ['required', 'string'],
            'severity' => ['required', 'string'],
            'status' => ['required', 'string'],
            'detected_at' => ['required', 'date'],
            'resolved_at' => ['nullable', 'date'],
        ]);

        $issue = CybersecurityIssue::create($data);

        return response()->json(['data' => $issue], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => CybersecurityIssue::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $issue = CybersecurityIssue::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'system' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'detected_at' => ['sometimes', 'date'],
            'resolved_at' => ['nullable', 'date'],
        ]);

        $issue->update($data);

        return response()->json(['data' => $issue]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $issue = CybersecurityIssue::findOrFail($id);
        $issue->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

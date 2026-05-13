<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Report::orderByDesc('generated_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'type' => ['required', 'string'],
            'period' => ['required', 'string'],
            'status' => ['required', 'string'],
            'generated_at' => ['nullable', 'date'],
        ]);

        $report = Report::create($data);

        return response()->json(['data' => $report], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Report::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $report = Report::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'type' => ['sometimes', 'string'],
            'period' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'generated_at' => ['nullable', 'date'],
        ]);

        $report->update($data);

        return response()->json(['data' => $report]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $report = Report::findOrFail($id);
        $report->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

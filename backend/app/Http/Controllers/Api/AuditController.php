<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Audit::orderByDesc('due_date')->get(),
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
            'due_date' => ['nullable', 'date'],
            'started_at' => ['nullable', 'date'],
        ]);

        $audit = Audit::create($data);

        return response()->json(['data' => $audit], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Audit::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $audit = Audit::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'office' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'due_date' => ['nullable', 'date'],
            'started_at' => ['nullable', 'date'],
        ]);

        $audit->update($data);

        return response()->json(['data' => $audit]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $audit = Audit::findOrFail($id);
        $audit->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

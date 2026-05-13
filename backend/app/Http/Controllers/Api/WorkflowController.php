<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Workflow::orderByDesc('updated_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'stages' => ['required', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
            'owner_office' => ['required', 'string'],
            'last_run_at' => ['nullable', 'date'],
        ]);

        $workflow = Workflow::create($data);

        return response()->json(['data' => $workflow], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Workflow::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $workflow = Workflow::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string'],
            'stages' => ['sometimes', 'integer', 'min:1'],
            'active' => ['nullable', 'boolean'],
            'owner_office' => ['sometimes', 'string'],
            'last_run_at' => ['nullable', 'date'],
        ]);

        $workflow->update($data);

        return response()->json(['data' => $workflow]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $workflow = Workflow::findOrFail($id);
        $workflow->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

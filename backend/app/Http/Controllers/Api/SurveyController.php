<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Survey;
use Illuminate\Http\Request;

class SurveyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Survey::orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'responses' => ['nullable', 'integer', 'min:0'],
            'sentiment' => ['required', 'string'],
            'status' => ['required', 'string'],
            'created_by' => ['nullable', 'string'],
        ]);

        $survey = Survey::create($data);

        return response()->json(['data' => $survey], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Survey::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $survey = Survey::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'responses' => ['nullable', 'integer', 'min:0'],
            'sentiment' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'created_by' => ['nullable', 'string'],
        ]);

        $survey->update($data);

        return response()->json(['data' => $survey]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $survey = Survey::findOrFail($id);
        $survey->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

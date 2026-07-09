<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profession;
use App\Models\Specialization;
use Illuminate\Http\Request;

class ProfessionController extends Controller
{
    /**
     * Get all professions
     */
    public function index(Request $request)
    {
        $query = Profession::with('specializations');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $professions = $query->get();

        return response()->json($professions);
    }

    /**
     * Create profession
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:professions,code',
            'description' => 'nullable|string',
            'requires_exam' => 'boolean',
            'license_validity_years' => 'required|integer|min:1',
            'renewal_grace_period_days' => 'required|integer|min:0',
            'continuing_education_hours' => 'required|integer|min:0',
        ]);

        $profession = Profession::create($validated);

        return response()->json([
            'message' => 'Profession created successfully',
            'profession' => $profession,
        ], 201);
    }

    /**
     * Get single profession
     */
    public function show($id)
    {
        $profession = Profession::with([
            'specializations',
            'applications',
            'licenses',
            'examinations'
        ])->findOrFail($id);

        return response()->json($profession);
    }

    /**
     * Update profession
     */
    public function update(Request $request, $id)
    {
        $profession = Profession::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'requires_exam' => 'boolean',
            'license_validity_years' => 'sometimes|integer|min:1',
            'renewal_grace_period_days' => 'sometimes|integer|min:0',
            'continuing_education_hours' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $profession->update($validated);

        return response()->json([
            'message' => 'Profession updated successfully',
            'profession' => $profession,
        ]);
    }

    /**
     * Get specializations for profession
     */
    public function specializations($id)
    {
        $profession = Profession::findOrFail($id);
        $specializations = $profession->specializations()->where('is_active', true)->get();

        return response()->json($specializations);
    }

    /**
     * Add specialization
     */
    public function addSpecialization(Request $request, $id)
    {
        $profession = Profession::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $validated['profession_id'] = $profession->id;

        $specialization = Specialization::create($validated);

        return response()->json([
            'message' => 'Specialization added successfully',
            'specialization' => $specialization,
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\SubCity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SubCityController extends Controller
{
    /**
     * Display a listing of sub-cities.
     */
    public function index(Request $request)
    {
        $query = SubCity::query();

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $subCities = $query->with(['administrator', 'users'])->paginate($perPage);

        // Add statistics to each sub-city
        $subCities->getCollection()->transform(function ($subCity) {
            $subCity->statistics = $subCity->getStatistics();
            return $subCity;
        });

        return response()->json($subCities);
    }

    /**
     * Store a newly created sub-city.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sub_cities',
            'code' => 'required|string|max:50|unique:sub_cities',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|max:2048',
            
            // Administrator details
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_phone' => 'nullable|string|max:20',
            'admin_password' => 'required|string|min:8',
            
            // Settings
            'settings' => 'nullable|array',
            'metadata' => 'nullable|array',
            'subscription_tier' => 'nullable|string|in:basic,standard,premium',
        ]);

        DB::beginTransaction();
        try {
            // Handle logo upload
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('sub-cities/logos', 'public');
                $validated['logo'] = $logoPath;
            }

            // Create sub-city
            $subCity = SubCity::create([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
                'address' => $validated['address'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'website' => $validated['website'] ?? null,
                'logo' => $validated['logo'] ?? null,
                'admin_name' => $validated['admin_name'],
                'admin_email' => $validated['admin_email'],
                'admin_phone' => $validated['admin_phone'] ?? null,
                'settings' => $validated['settings'] ?? [],
                'metadata' => $validated['metadata'] ?? [],
                'subscription_tier' => $validated['subscription_tier'] ?? 'basic',
                'is_active' => true,
                'activated_at' => now(),
            ]);

            // Create administrator user
            $adminUser = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'phone' => $validated['admin_phone'] ?? null,
                'sub_city' => $validated['name'],
                'sub_city_id' => $subCity->id,
                'department' => 'Administration',
                'is_active' => true,
            ]);

            // Assign sub-city admin role
            $adminRole = Role::where('name', 'sub_city_admin')->first();
            if (!$adminRole) {
                // Create the role if it doesn't exist
                $adminRole = Role::create([
                    'name' => 'sub_city_admin',
                    'display_name' => 'Sub-City Administrator',
                    'description' => 'Administrator for a specific sub-city organization',
                ]);
            }
            $adminUser->roles()->attach($adminRole->id);

            // Log activity
            ActivityLog::log('create', 'sub_city', $request->user(), $subCity->id, [
                'sub_city_name' => $subCity->name,
                'admin_email' => $adminUser->email,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Sub-city registered successfully',
                'sub_city' => $subCity->load('administrator'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Delete uploaded logo if exists
            if (isset($logoPath)) {
                Storage::disk('public')->delete($logoPath);
            }

            return response()->json([
                'message' => 'Failed to register sub-city',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified sub-city.
     */
    public function show($id)
    {
        $subCity = SubCity::with(['administrator', 'users'])->findOrFail($id);
        $subCity->statistics = $subCity->getStatistics();

        return response()->json(['sub_city' => $subCity]);
    }

    /**
     * Update the specified sub-city.
     */
    public function update(Request $request, $id)
    {
        $subCity = SubCity::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('sub_cities')->ignore($id)],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('sub_cities')->ignore($id)],
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|max:2048',
            'admin_name' => 'sometimes|string|max:255',
            'admin_email' => 'sometimes|email|max:255',
            'admin_phone' => 'nullable|string|max:20',
            'settings' => 'nullable|array',
            'metadata' => 'nullable|array',
            'subscription_tier' => 'nullable|string|in:basic,standard,premium',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($subCity->logo) {
                Storage::disk('public')->delete($subCity->logo);
            }
            $validated['logo'] = $request->file('logo')->store('sub-cities/logos', 'public');
        }

        $subCity->update($validated);

        // Log activity
        ActivityLog::log('update', 'sub_city', $request->user(), $subCity->id, [
            'sub_city_name' => $subCity->name,
        ]);

        return response()->json([
            'message' => 'Sub-city updated successfully',
            'sub_city' => $subCity->fresh()->load('administrator'),
        ]);
    }

    /**
     * Activate a sub-city.
     */
    public function activate(Request $request, $id)
    {
        $subCity = SubCity::findOrFail($id);
        $subCity->activate();

        // Log activity
        ActivityLog::log('activate', 'sub_city', $request->user(), $subCity->id, [
            'sub_city_name' => $subCity->name,
        ]);

        return response()->json([
            'message' => 'Sub-city activated successfully',
            'sub_city' => $subCity,
        ]);
    }

    /**
     * Deactivate a sub-city.
     */
    public function deactivate(Request $request, $id)
    {
        $subCity = SubCity::findOrFail($id);
        $subCity->deactivate();

        // Log activity
        ActivityLog::log('deactivate', 'sub_city', $request->user(), $subCity->id, [
            'sub_city_name' => $subCity->name,
        ]);

        return response()->json([
            'message' => 'Sub-city deactivated successfully',
            'sub_city' => $subCity,
        ]);
    }

    /**
     * Remove the specified sub-city.
     */
    public function destroy(Request $request, $id)
    {
        $subCity = SubCity::findOrFail($id);
        
        // Delete logo if exists
        if ($subCity->logo) {
            Storage::disk('public')->delete($subCity->logo);
        }

        $subCityName = $subCity->name;
        $subCity->delete();

        // Log activity
        ActivityLog::log('delete', 'sub_city', $request->user(), $id, [
            'sub_city_name' => $subCityName,
        ]);

        return response()->json(['message' => 'Sub-city deleted successfully']);
    }

    /**
     * Get statistics for a sub-city.
     */
    public function statistics($id)
    {
        $subCity = SubCity::findOrFail($id);
        return response()->json(['statistics' => $subCity->getStatistics()]);
    }

    /**
     * Get users for a sub-city.
     */
    public function users(Request $request, $id)
    {
        $subCity = SubCity::findOrFail($id);
        
        $query = $subCity->users()->with('roles');

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Update sub-city administrator.
     */
    public function updateAdministrator(Request $request, $id)
    {
        $subCity = SubCity::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $newAdmin = User::findOrFail($validated['user_id']);

        // Check if user belongs to this sub-city
        if ($newAdmin->sub_city_id != $subCity->id) {
            return response()->json([
                'message' => 'User does not belong to this sub-city',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Remove admin role from current administrator
            $currentAdmin = $subCity->administrator;
            if ($currentAdmin) {
                $adminRole = Role::where('name', 'sub_city_admin')->first();
                $currentAdmin->roles()->detach($adminRole->id);
            }

            // Assign admin role to new administrator
            $adminRole = Role::where('name', 'sub_city_admin')->first();
            $newAdmin->roles()->syncWithoutDetaching([$adminRole->id]);

            // Update sub-city admin details
            $subCity->update([
                'admin_name' => $newAdmin->name,
                'admin_email' => $newAdmin->email,
                'admin_phone' => $newAdmin->phone,
            ]);

            // Log activity
            ActivityLog::log('update_administrator', 'sub_city', $request->user(), $subCity->id, [
                'sub_city_name' => $subCity->name,
                'new_admin' => $newAdmin->email,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Administrator updated successfully',
                'sub_city' => $subCity->fresh()->load('administrator'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update administrator',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

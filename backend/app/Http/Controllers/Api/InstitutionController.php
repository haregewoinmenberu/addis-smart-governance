<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\User;
use App\Models\SubCity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class InstitutionController extends Controller
{
    /**
     * Display a listing of institutions.
     */
    public function index(Request $request)
    {
        $query = Institution::with(['subCity', 'verifier']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%");
            });
        }

        $institutions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $institutions,
        ]);
    }

    /**
     * Register a new institution with initial admin user.
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                // Institution details
                'institution_name' => 'required|string|max:255',
                'institution_amharic_name' => 'nullable|string|max:255',
                'institution_type' => ['required', Rule::in(array_keys(Institution::TYPES))],
                'registration_number' => 'nullable|string|max:255|unique:institutions,registration_number',
                'tin_number' => 'nullable|string|max:255',
                'email' => 'required|email|unique:institutions,email',
                'phone' => 'required|string|max:255',
                'alternative_phone' => 'nullable|string|max:255',
                'address' => 'nullable|string',
                'sub_city_id' => 'nullable|exists:sub_cities,id',
                'woreda' => 'nullable|string|max:255',
                'website' => 'nullable|url|max:255',
                'description' => 'nullable|string',
                
                // Primary contact / admin user details
                'contact_name' => 'required|string|max:255',
                'contact_email' => 'required|email|unique:users,email',
                'contact_phone' => 'required|string|max:255',
                'contact_position' => 'required|string|max:255',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            // Create institution
            $institution = Institution::create([
                'name' => $request->institution_name,
                'amharic_name' => $request->institution_amharic_name,
                'type' => $request->institution_type,
                'registration_number' => $request->registration_number,
                'tin_number' => $request->tin_number,
                'email' => $request->email,
                'phone' => $request->phone,
                'alternative_phone' => $request->alternative_phone,
                'address' => $request->address,
                'city' => 'Addis Ababa',
                'sub_city_id' => $request->sub_city_id,
                'woreda' => $request->woreda,
                'website' => $request->website,
                'description' => $request->description,
                'status' => Institution::STATUS_PENDING,
            ]);

            // Create primary contact user (institution admin)
            $user = User::create([
                'name' => $request->contact_name,
                'email' => $request->contact_email,
                'phone' => $request->contact_phone,
                'position' => $request->contact_position,
                'password' => Hash::make($request->password),
                'institution_id' => $institution->id,
                'user_type' => 'INSTITUTIONAL',
                'is_primary_contact' => true,
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Institution registered successfully. Your account is pending verification.',
                'data' => [
                    'institution_id' => $institution->id,
                    'institution_name' => $institution->name,
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                ],
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            
            \Log::error('Institution registration - Database error', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'sql' => $e->getSql() ?? 'N/A',
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage(),
                'error_code' => $e->getCode(),
            ], 500);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Institution registration failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
                'error_details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Display the specified institution.
     */
    public function show($id)
    {
        $institution = Institution::with(['subCity', 'verifier', 'users'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $institution,
        ]);
    }

    /**
     * Update the specified institution.
     */
    public function update(Request $request, $id)
    {
        $institution = Institution::findOrFail($id);

        // Check permission (only institution users or admins can update)
        if (auth()->user()->institution_id !== $institution->id && !auth()->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'amharic_name' => 'nullable|string|max:255',
            'phone' => 'sometimes|string|max:255',
            'alternative_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'sub_city_id' => 'nullable|exists:sub_cities,id',
            'woreda' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $institution->update($request->only([
            'name', 'amharic_name', 'phone', 'alternative_phone',
            'address', 'sub_city_id', 'woreda', 'website', 'description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Institution updated successfully',
            'data' => $institution,
        ]);
    }

    /**
     * Verify an institution (admin only).
     */
    public function verify($id)
    {
        $institution = Institution::findOrFail($id);

        if (!auth()->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $institution->verify(auth()->user());

        return response()->json([
            'success' => true,
            'message' => 'Institution verified successfully',
            'data' => $institution,
        ]);
    }

    /**
     * Change institution status (admin only).
     */
    public function changeStatus(Request $request, $id)
    {
        $institution = Institution::findOrFail($id);

        if (!auth()->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in([
                Institution::STATUS_PENDING,
                Institution::STATUS_ACTIVE,
                Institution::STATUS_SUSPENDED,
                Institution::STATUS_INACTIVE,
            ])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $institution->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Institution status updated successfully',
            'data' => $institution,
        ]);
    }

    /**
     * Get institution types.
     */
    public function types()
    {
        return response()->json([
            'success' => true,
            'data' => Institution::TYPES,
        ]);
    }

    /**
     * Get institution statistics.
     */
    public function statistics()
    {
        $stats = [
            'total' => Institution::count(),
            'active' => Institution::where('status', Institution::STATUS_ACTIVE)->count(),
            'pending' => Institution::where('status', Institution::STATUS_PENDING)->count(),
            'suspended' => Institution::where('status', Institution::STATUS_SUSPENDED)->count(),
            'by_type' => Institution::select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get current user's institution.
     */
    public function myInstitution()
    {
        $user = auth()->user();

        if (!$user->institution_id) {
            return response()->json([
                'success' => false,
                'message' => 'User is not associated with any institution',
            ], 404);
        }

        $institution = Institution::with(['subCity', 'users'])->findOrFail($user->institution_id);

        return response()->json([
            'success' => true,
            'data' => $institution,
        ]);
    }

    /**
     * Get institution's service requests.
     */
    public function requests($id)
    {
        $institution = Institution::findOrFail($id);

        // Check permission
        if (auth()->user()->institution_id !== $institution->id && !auth()->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $requests = $institution->serviceFormSubmissions()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }
}

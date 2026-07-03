<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstitutionDocument;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InstitutionDocumentController extends Controller
{
    /**
     * Get all documents for an institution.
     */
    public function index(Request $request, $institutionId)
    {
        $user = $request->user();
        
        // Check if user belongs to this institution
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to institution documents',
            ], 403);
        }

        $query = InstitutionDocument::where('institution_id', $institutionId)
            ->with('uploader:id,name,email');

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Search by name
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $documents = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Upload a new document.
     */
    public function store(Request $request, $institutionId)
    {
        $user = $request->user();
        
        // Check if user belongs to this institution
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to institution',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'max:10240'], // 10MB max
            'category' => ['required', Rule::in([
                'license', 'certificate', 'report', 'contract', 
                'policy', 'compliance', 'other'
            ])],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('file');
        $fileName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                    . '_' . time() 
                    . '.' . $file->getClientOriginalExtension();

        // Store file in institution's folder
        $path = $file->storeAs(
            'institutions/' . $institutionId . '/documents',
            $fileName,
            'public'
        );

        $document = InstitutionDocument::create([
            'institution_id' => $institutionId,
            'uploaded_by' => $user->id,
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
        ]);

        $document->load('uploader:id,name,email');

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $document,
        ], 201);
    }

    /**
     * Get a single document.
     */
    public function show(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $document = InstitutionDocument::where('institution_id', $institutionId)
            ->with('uploader:id,name,email')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $document,
        ]);
    }

    /**
     * Download a document.
     */
    public function download(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $document = InstitutionDocument::where('institution_id', $institutionId)
            ->findOrFail($id);

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->name);
    }

    /**
     * Delete a document.
     */
    public function destroy(Request $request, $institutionId, $id)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $document = InstitutionDocument::where('institution_id', $institutionId)
            ->findOrFail($id);

        // Delete file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Get document statistics.
     */
    public function statistics(Request $request, $institutionId)
    {
        $user = $request->user();
        
        if ($user->user_type === 'INSTITUTIONAL' && $user->institution_id != $institutionId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $totalDocuments = InstitutionDocument::where('institution_id', $institutionId)->count();
        $totalSize = InstitutionDocument::where('institution_id', $institutionId)->sum('file_size');
        
        $byCategory = InstitutionDocument::where('institution_id', $institutionId)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category');

        return response()->json([
            'success' => true,
            'data' => [
                'total_documents' => $totalDocuments,
                'total_size' => $totalSize,
                'total_size_formatted' => $this->formatBytes($totalSize),
                'by_category' => $byCategory,
            ],
        ]);
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes($bytes, $precision = 2)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, $precision) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, $precision) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, $precision) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}

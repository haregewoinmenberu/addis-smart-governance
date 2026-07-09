<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchIdea;
use App\Models\ResearchActivityLog;
use App\Enums\IdeaStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResearchIdeaController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchIdea::with(['submitter', 'subCity', 'attachments']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->category) {
            $query->where('research_category', $request->category);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('summary', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'problem_statement' => 'required|string',
            'objectives' => 'required|string',
            'expected_outcome' => 'required|string',
            'research_category' => 'required|string',
            'government_sector' => 'nullable|string',
            'priority' => 'nullable|string',
            'sub_city_id' => 'nullable|exists:sub_cities,id',
        ]);

        $validated['submitted_by'] = auth()->id();
        $validated['status'] = IdeaStatus::DRAFT;

        $idea = ResearchIdea::create($validated);

        ResearchActivityLog::log('created', $idea, null, $validated, 'Research idea created');

        return response()->json($idea->load('submitter', 'subCity'), 201);
    }

    public function show(ResearchIdea $researchIdea)
    {
        return response()->json($researchIdea->load([
            'submitter',
            'subCity',
            'attachments',
            'screenings.evaluator',
            'project'
        ]));
    }

    public function update(Request $request, ResearchIdea $researchIdea)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'summary' => 'sometimes|string',
            'problem_statement' => 'sometimes|string',
            'objectives' => 'sometimes|string',
            'expected_outcome' => 'sometimes|string',
            'research_category' => 'sometimes|string',
            'government_sector' => 'nullable|string',
            'priority' => 'nullable|string',
        ]);

        $oldValues = $researchIdea->toArray();
        $researchIdea->update($validated);

        ResearchActivityLog::log('updated', $researchIdea, $oldValues, $validated, 'Research idea updated');

        return response()->json($researchIdea->load('submitter', 'subCity'));
    }

    public function destroy(ResearchIdea $researchIdea)
    {
        ResearchActivityLog::log('deleted', $researchIdea, $researchIdea->toArray(), null, 'Research idea deleted');
        
        $researchIdea->delete();

        return response()->json(['message' => 'Research idea deleted successfully']);
    }

    public function submit(ResearchIdea $researchIdea)
    {
        $researchIdea->update([
            'status' => IdeaStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);

        ResearchActivityLog::log('submitted', $researchIdea, null, null, 'Research idea submitted for review');

        return response()->json($researchIdea);
    }

    public function uploadAttachment(Request $request, ResearchIdea $researchIdea)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('research-ideas/' . $researchIdea->id, 'public');

        $attachment = $researchIdea->attachments()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json($attachment, 201);
    }

    public function deleteAttachment(ResearchIdea $researchIdea, $attachmentId)
    {
        $attachment = $researchIdea->attachments()->findOrFail($attachmentId);
        
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully']);
    }
}

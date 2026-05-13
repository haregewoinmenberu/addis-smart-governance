<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequestItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RequestItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = RequestItem::query()->orderByDesc('submitted_at');

        if ($search = request('search')) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        if ($status = request('status')) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:request_items,code'],
            'title' => ['required', 'string'],
            'office' => ['required', 'string'],
            'status' => ['required', 'string'],
            'step' => ['required', 'integer', 'min:0'],
            'total_steps' => ['required', 'integer', 'min:1'],
            'budget' => ['nullable', 'numeric'],
            'submitted_at' => ['required', 'date'],
            'priority' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $item = RequestItem::create($data);

        return response()->json(['data' => $item], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => RequestItem::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = RequestItem::findOrFail($id);
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('request_items', 'code')->ignore($item->id)],
            'title' => ['sometimes', 'string'],
            'office' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'step' => ['sometimes', 'integer', 'min:0'],
            'total_steps' => ['sometimes', 'integer', 'min:1'],
            'budget' => ['nullable', 'numeric'],
            'submitted_at' => ['sometimes', 'date'],
            'priority' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $item->update($data);

        return response()->json(['data' => $item]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = RequestItem::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

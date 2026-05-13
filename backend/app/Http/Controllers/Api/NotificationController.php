<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => Notification::orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'message' => ['required', 'string'],
            'channel' => ['required', 'string'],
            'priority' => ['required', 'string'],
            'recipient' => ['nullable', 'string'],
            'read_at' => ['nullable', 'date'],
        ]);

        $notification = Notification::create($data);

        return response()->json(['data' => $notification], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'data' => Notification::findOrFail($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $notification = Notification::findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes', 'string'],
            'message' => ['sometimes', 'string'],
            'channel' => ['sometimes', 'string'],
            'priority' => ['sometimes', 'string'],
            'recipient' => ['nullable', 'string'],
            'read_at' => ['nullable', 'date'],
        ]);

        $notification->update($data);

        return response()->json(['data' => $notification]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

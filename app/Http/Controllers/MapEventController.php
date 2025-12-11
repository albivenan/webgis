<?php

namespace App\Http\Controllers;

use App\Models\MapEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MapEventController extends Controller
{
    public function index()
    {
        // This could be used for the management page
        return Inertia::render('ManajemenData/Events/Index', [
            'events' => MapEvent::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_type' => 'required|in:traffic,accident,hazard,location',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'level' => 'nullable|in:low,medium,high',
            'hazard_type' => 'nullable|in:banjir,longsor,kriminal,kebakaran',
            'radius' => 'nullable|integer',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image_path'] = $path;
        }

        MapEvent::create($validated);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    public function update(Request $request, MapEvent $event)
    {
        $validated = $request->validate([
            'event_type' => 'required|in:traffic,accident,hazard,location',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'level' => 'nullable|in:low,medium,high',
            'hazard_type' => 'nullable|in:banjir,longsor,kriminal,kebakaran',
            'radius' => 'nullable|integer',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($event->image_path) {
                Storage::disk('public')->delete($event->image_path);
            }
            $path = $request->file('image')->store('events', 'public');
            $validated['image_path'] = $path;
        }

        $event->update($validated);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    public function destroy(MapEvent $event)
    {
        if ($event->image_path) {
            Storage::disk('public')->delete($event->image_path);
        }
        
        $event->delete();

        return redirect()->back()->with('success', 'Event deleted successfully.');
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Check if user is registered for this event
        $isUserRegistered = false;
        $userRegistration = null;

        if ($request->user()) {
            $userRegistration = $this->eventParticipants()
                ->where('participant_id', $request->user()->id)
                ->first();
            $isUserRegistered = $userRegistration !== null;
        }
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date->format('Y-m-d'),
            'start_time' => $this->start_time ? $this->start_time->format('H:i') : null,
            'end_time' => $this->end_time ? $this->end_time->format('H:i') : null,
            'location' => $this->location,
            'image' => $this->getImageUrl(),
            'max_participants' => $this->max_participants,
            'current_participants' => $this->current_participants ?? 0,
            'is_active' => $this->is_active,
            'registration_deadline' => $this->registration_deadline->format('Y-m-d H:i:s'),
            'creator' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            // Certificate fields
            'has_certificate' => $this->has_certificate ?? false,
            'certificate_required' => $this->certificate_required ?? false,
            'certificate_template_path' => $this->certificate_template_path,
            // Organizer fields
            'organizer_type' => $this->organizer_type ?? 'admin',
            'organizer_name' => $this->organizer_name,
            'organizer_email' => $this->organizer_email,
            'organizer_contact' => $this->organizer_contact,
            'category' => $this->category,
            'price' => $this->price ? (float) $this->price : 0,
            'registration_date' => $this->registration_date ? $this->registration_date->format('Y-m-d H:i:s') : null,
            'submitted_at' => $this->submitted_at ? $this->submitted_at->format('Y-m-d H:i:s') : null,
            'approved_at' => $this->approved_at ? $this->approved_at->format('Y-m-d H:i:s') : null,
            'rejected_at' => $this->rejected_at ? $this->rejected_at->format('Y-m-d H:i:s') : null,
            'approved_by' => $this->approved_by,
            'rejection_reason' => $this->rejection_reason,
            'created_by' => $this->user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Computed attributes
            'is_registration_open' => $this->is_registration_open,
            'is_past_event' => $this->is_past_event,
            'full_date_time' => $this->full_date_time,
            'current_participants_count' => $this->current_participants_count,
            'can_admin_create' => $this->can_admin_create,
            'is_event_day' => $this->is_event_day,
            'is_attendance_open' => $this->is_attendance_open,
            // Event status
            'status' => $this->getEventStatus(),
            // User registration status
            'is_user_registered' => $isUserRegistered,
            'user_registration' => $userRegistration ? [
                'id' => $userRegistration->id,
                'registration_number' => $userRegistration->registration_number,
                'attendance_status' => $userRegistration->attendance_status,
                'is_attendance_verified' => $userRegistration->is_attendance_verified,
                'attendance_verified_at' => $userRegistration->attendance_verified_at,
                'attendance_token' => $userRegistration->attendance_token,
                'can_attend' => $userRegistration->canAttend(),
                'registered_at' => $userRegistration->created_at,
            ] : null,
        ];
    }

    /**
     * Get image URL with fallback logic
     */
    private function getImageUrl(): ?string
    {
        // Priority 1: External image URL (for organizer events)
        if (isset($this->image_url) && !empty($this->image_url)) {
            return $this->image_url;
        }

        // Priority 2: Uploaded flyer path
        if ($this->flyer_path) {
            return url('storage/' . $this->flyer_path) . '?v=' . time();
        }

        return null;
    }
}

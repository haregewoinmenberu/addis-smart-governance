<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'position' => $this->position,
            'department' => $this->department,
            'user_type' => $this->user_type,
            'institution_id' => $this->institution_id,
            'sub_city_id' => $this->sub_city_id,
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            
            // Relationships
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'permissions' => $this->when(
                $this->relationLoaded('roles'),
                fn() => $this->getAllPermissions()
            ),
            'sub_city' => $this->whenLoaded('subCity', function () {
                return [
                    'id' => $this->subCity->id,
                    'name' => $this->subCity->name,
                    'code' => $this->subCity->code,
                ];
            }),
            'institution' => $this->whenLoaded('institution', function () {
                return [
                    'id' => $this->institution->id,
                    'name' => $this->institution->name,
                    'type' => $this->institution->type,
                ];
            }),
        ];
    }
}

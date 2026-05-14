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
            'department' => $this->department,
            'is_active' => $this->is_active,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'display_name' => $role->display_name,
                    ];
                });
            }),
            'sub_city' => $this->when($this->relationLoaded('subCity'), function () {
                return [
                    'id' => $this->subCity->id,
                    'name' => $this->subCity->name,
                    'code' => $this->subCity->code,
                ];
            }),
            'hierarchy_level' => $this->getHierarchyLevel(),
            'permissions' => $this->when($request->input('include_permissions'), function () {
                return $this->getAllPermissions()->pluck('name');
            }),
            'timestamps' => [
                'last_login_at' => $this->last_login_at?->toISOString(),
                'created_at' => $this->created_at->toISOString(),
                'updated_at' => $this->updated_at->toISOString(),
            ],
        ];
    }
}

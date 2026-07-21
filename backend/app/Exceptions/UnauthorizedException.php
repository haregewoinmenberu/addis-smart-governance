<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class UnauthorizedException extends Exception
{
    /**
     * The required permission or role.
     */
    protected $requiredPermission;

    /**
     * Create a new exception instance.
     */
    public function __construct(string $message = 'Unauthorized action', $requiredPermission = null)
    {
        parent::__construct($message);
        $this->requiredPermission = $requiredPermission;
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        $response = [
            'message' => $this->getMessage(),
            'error' => 'Unauthorized',
        ];

        if ($this->requiredPermission) {
            $response['required'] = $this->requiredPermission;
        }

        return response()->json($response, 403);
    }

    /**
     * Set the required permission or role.
     */
    public function setRequired($required): self
    {
        $this->requiredPermission = $required;
        return $this;
    }
}

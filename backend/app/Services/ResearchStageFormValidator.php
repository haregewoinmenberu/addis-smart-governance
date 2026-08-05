<?php

namespace App\Services;

use App\Models\ResearchWorkflowStage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Validates and normalizes stage_data submitted for a workflow stage against
 * that stage's dynamic form_fields schema. Prior to this, submitStage()
 * accepted any array with no per-field validation at all.
 */
class ResearchStageFormValidator
{
    /**
     * @return array Normalized data safe to persist as stage_data.
     * @throws ValidationException When any field fails validation.
     */
    public static function validate(ResearchWorkflowStage $stage, array $stageData): array
    {
        $fields = $stage->form_fields ?? [];
        $normalized = $stageData;
        $errors = [];

        foreach ($fields as $field) {
            $name = $field['name'] ?? null;
            if (!$name) {
                continue;
            }

            $label = $field['label'] ?? $name;
            $required = (bool) ($field['required'] ?? false);
            $value = $stageData[$name] ?? null;

            switch ($field['type'] ?? 'text') {
                case 'checkbox':
                    $normalized[$name] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
                    if ($required && $normalized[$name] !== true) {
                        $errors[$name][] = "{$label} must be checked.";
                    }
                    break;

                case 'number':
                    if ($value === null || $value === '') {
                        $normalized[$name] = null;
                        if ($required) {
                            $errors[$name][] = "{$label} is required.";
                        }
                        break;
                    }
                    if (!is_numeric($value)) {
                        $errors[$name][] = "{$label} must be a number.";
                        break;
                    }
                    $normalized[$name] = $value + 0;
                    break;

                case 'select':
                    if ($value === null || $value === '') {
                        if ($required) {
                            $errors[$name][] = "{$label} is required.";
                        }
                        break;
                    }
                    $options = collect($field['options'] ?? [])->pluck('value')->all();
                    if (!in_array($value, $options, true)) {
                        $errors[$name][] = "{$label} must be one of: " . implode(', ', $options) . '.';
                    }
                    break;

                case 'file':
                    if (empty($value)) {
                        if ($required) {
                            $errors[$name][] = "{$label} is required.";
                        }
                        break;
                    }
                    $path = is_array($value) ? ($value['path'] ?? null) : $value;
                    if (!$path || !Storage::disk('public')->exists($path)) {
                        $errors[$name][] = "{$label} must be a valid uploaded file.";
                    }
                    break;

                case 'text':
                case 'textarea':
                default:
                    if ($required && (!isset($value) || trim((string) $value) === '')) {
                        $errors[$name][] = "{$label} is required.";
                    }
                    break;
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return $normalized;
    }
}

<?php

namespace Tests\Unit;

use App\Models\ResearchWorkflowStage;
use App\Services\ResearchStageFormValidator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * Covers ResearchStageFormValidator in isolation — no database access, so
 * this is safe to run in any environment (this project has no isolated
 * test database configured; RefreshDatabase-based tests would run
 * migrate:fresh against whatever DB_DATABASE points at).
 */
class ResearchStageFormValidatorTest extends TestCase
{
    private function stageWithFields(array $fields): ResearchWorkflowStage
    {
        return new ResearchWorkflowStage(['form_fields' => $fields]);
    }

    public function test_select_field_rejects_value_not_in_options(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'decision', 'label' => 'Decision', 'type' => 'select', 'required' => true,
                'options' => [['value' => 'acceptable', 'label' => 'Acceptable']]],
        ]);

        $this->expectException(ValidationException::class);

        ResearchStageFormValidator::validate($stage, ['decision' => 'banana']);
    }

    public function test_select_field_accepts_a_valid_option(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'decision', 'label' => 'Decision', 'type' => 'select', 'required' => true,
                'options' => [['value' => 'acceptable', 'label' => 'Acceptable']]],
        ]);

        $result = ResearchStageFormValidator::validate($stage, ['decision' => 'acceptable']);

        $this->assertSame('acceptable', $result['decision']);
    }

    public function test_number_field_is_coerced_to_numeric(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'trl', 'label' => 'TRL', 'type' => 'number', 'required' => true],
        ]);

        $result = ResearchStageFormValidator::validate($stage, ['trl' => '7']);

        $this->assertSame(7, $result['trl']);
    }

    public function test_number_field_rejects_non_numeric_value(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'trl', 'label' => 'TRL', 'type' => 'number', 'required' => true],
        ]);

        $this->expectException(ValidationException::class);

        ResearchStageFormValidator::validate($stage, ['trl' => 'not-a-number']);
    }

    public function test_checkbox_field_is_coerced_to_boolean(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'confirm', 'label' => 'Confirm', 'type' => 'checkbox', 'required' => false],
        ]);

        $result = ResearchStageFormValidator::validate($stage, ['confirm' => '1']);

        $this->assertTrue($result['confirm']);
    }

    public function test_required_checkbox_must_be_checked(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'confirm', 'label' => 'Confirm', 'type' => 'checkbox', 'required' => true],
        ]);

        $this->expectException(ValidationException::class);

        ResearchStageFormValidator::validate($stage, ['confirm' => false]);
    }

    public function test_file_field_requires_an_existing_stored_file(): void
    {
        Storage::fake('public');

        $stage = $this->stageWithFields([
            ['name' => 'document', 'label' => 'Document', 'type' => 'file', 'required' => true],
        ]);

        $this->expectException(ValidationException::class);

        ResearchStageFormValidator::validate($stage, ['document' => 'research-workflow/1/document/does-not-exist.pdf']);
    }

    public function test_file_field_accepts_a_path_that_exists_on_disk(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('research-workflow/1/document/report.pdf', 'contents');

        $stage = $this->stageWithFields([
            ['name' => 'document', 'label' => 'Document', 'type' => 'file', 'required' => true],
        ]);

        $result = ResearchStageFormValidator::validate($stage, ['document' => 'research-workflow/1/document/report.pdf']);

        $this->assertSame('research-workflow/1/document/report.pdf', $result['document']);
    }

    public function test_required_text_field_cannot_be_blank(): void
    {
        $stage = $this->stageWithFields([
            ['name' => 'note', 'label' => 'Note', 'type' => 'textarea', 'required' => true],
        ]);

        $this->expectException(ValidationException::class);

        ResearchStageFormValidator::validate($stage, ['note' => '   ']);
    }
}

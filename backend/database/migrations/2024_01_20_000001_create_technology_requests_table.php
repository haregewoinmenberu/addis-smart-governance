<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->string('name');
            $table->string('category');
            $table->string('type');
            $table->text('description');
            $table->text('purpose');
            $table->text('business_problem');
            $table->text('expected_benefits');
            $table->string('innovation_level');
            $table->integer('trl_level')->nullable();
            $table->unsignedBigInteger('owner_organization_id')->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('vendor_contact')->nullable();
            $table->string('contact_person');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->string('source_type');
            $table->unsignedBigInteger('research_project_id')->nullable();
            $table->text('technical_documentation')->nullable();
            $table->text('architecture_diagram')->nullable();
            $table->text('api_documentation')->nullable();
            $table->text('licenses')->nullable();
            $table->text('source_code_repository')->nullable();
            $table->text('required_infrastructure')->nullable();
            $table->text('deployment_requirements')->nullable();
            $table->text('dependencies')->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->integer('expected_users')->nullable();
            $table->string('current_stage')->default('submission');
            $table->string('status')->default('draft');
            $table->foreignId('submitted_by')->constrained('users');
            $table->unsignedBigInteger('sub_city_id')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['current_stage', 'status']);
            $table->index('request_number');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technology_requests');
    }
};

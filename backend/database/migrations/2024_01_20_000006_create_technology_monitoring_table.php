<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technology_monitoring', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade');
            $table->string('monitoring_type');
            $table->string('status')->default('active');
            $table->integer('compliance_score')->nullable();
            $table->integer('risk_score')->nullable();
            $table->integer('performance_score')->nullable();
            $table->decimal('availability_percentage', 5, 2)->nullable();
            $table->integer('usage_count')->default(0);
            $table->integer('support_tickets')->default(0);
            $table->date('last_check_date');
            $table->date('next_check_date');
            $table->timestamps();
            
            $table->index(['technology_registry_id', 'monitoring_type'], 'tech_mon_reg_type_idx');
        });

        Schema::create('monitoring_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_monitoring_id')->constrained('technology_monitoring')->onDelete('cascade');
            $table->string('metric_name');
            $table->string('metric_value');
            $table->string('unit')->nullable();
            $table->string('status')->default('normal');
            $table->timestamp('recorded_at');
            $table->timestamps();
            
            $table->index(['technology_monitoring_id', 'recorded_at'], 'tech_mon_metrics_idx');
        });

        Schema::create('monitoring_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technology_monitoring_id')->constrained('technology_monitoring')->onDelete('cascade');
            $table->string('alert_type');
            $table->string('severity');
            $table->string('message');
            $table->text('details')->nullable();
            $table->boolean('is_acknowledged')->default(false);
            $table->foreignId('acknowledged_by')->nullable()->constrained('users');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('triggered_at');
            $table->timestamps();
            
            $table->index(['severity', 'is_acknowledged']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_alerts');
        Schema::dropIfExists('monitoring_metrics');
        Schema::dropIfExists('technology_monitoring');
    }
};

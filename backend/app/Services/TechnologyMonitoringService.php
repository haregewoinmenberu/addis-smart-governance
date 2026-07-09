<?php

namespace App\Services;

use App\Models\TechnologyRegistry;
use App\Models\TechnologyMonitoring;
use App\Models\MonitoringAlert;
use App\Models\TechnologyIncident;
use App\Enums\IncidentSeverity;

class TechnologyMonitoringService
{
    public function performCheck(TechnologyRegistry $registry, string $monitoringType): void
    {
        $monitoring = TechnologyMonitoring::firstOrCreate(
            ['technology_registry_id' => $registry->id, 'monitoring_type' => $monitoringType],
            ['status' => 'active', 'last_check_date' => now(), 'next_check_date' => now()->addDays(30)]
        );

        switch ($monitoringType) {
            case 'security':
                $this->checkSecurity($monitoring);
                break;
            case 'performance':
                $this->checkPerformance($monitoring);
                break;
            case 'license':
                $this->checkLicense($monitoring);
                break;
            case 'compliance':
                $this->checkCompliance($monitoring);
                break;
        }

        $monitoring->update(['last_check_date' => now()]);
    }

    protected function checkSecurity(TechnologyMonitoring $monitoring): void
    {
        $score = rand(70, 100);
        $monitoring->update(['compliance_score' => $score]);

        if ($score < 80) {
            $this->createAlert($monitoring, 'security', $score < 70 ? 'high' : 'medium', 'Security score below threshold');
        }
    }

    protected function checkPerformance(TechnologyMonitoring $monitoring): void
    {
        $score = rand(60, 100);
        $availability = rand(95, 100);
        
        $monitoring->update([
            'performance_score' => $score,
            'availability_percentage' => $availability
        ]);

        if ($availability < 98) {
            $this->createAlert($monitoring, 'availability', 'medium', 'Availability below 98%');
        }
    }

    protected function checkLicense(TechnologyMonitoring $monitoring): void
    {
        $registry = $monitoring->registry;
        $license = $registry->licenses()->where('is_active', true)->first();

        if ($license && $license->expiration_date) {
            $daysRemaining = now()->diffInDays($license->expiration_date, false);

            if ($daysRemaining < 30 && $daysRemaining > 0) {
                $this->createAlert($monitoring, 'license_expiring', 'medium', "License expires in {$daysRemaining} days");
            } elseif ($daysRemaining <= 0) {
                $this->createAlert($monitoring, 'license_expired', 'critical', 'License has expired');
            }
        }
    }

    protected function checkCompliance(TechnologyMonitoring $monitoring): void
    {
        $score = rand(80, 100);
        $monitoring->update(['compliance_score' => $score]);

        if ($score < 85) {
            $this->createAlert($monitoring, 'compliance', 'high', 'Compliance score below threshold');
        }
    }

    protected function createAlert(TechnologyMonitoring $monitoring, string $type, string $severity, string $message): void
    {
        MonitoringAlert::create([
            'technology_monitoring_id' => $monitoring->id,
            'alert_type' => $type,
            'severity' => $severity,
            'message' => $message,
            'triggered_at' => now(),
        ]);

        if (in_array($severity, ['high', 'critical'])) {
            $this->createIncidentFromAlert($monitoring, $type, $severity, $message);
        }
    }

    protected function createIncidentFromAlert(TechnologyMonitoring $monitoring, string $type, string $severity, string $message): void
    {
        TechnologyIncident::create([
            'technology_registry_id' => $monitoring->technology_registry_id,
            'incident_type' => $type,
            'severity' => $severity,
            'status' => 'reported',
            'title' => "Automated: {$message}",
            'description' => "Auto-generated from monitoring alert",
            'reported_by' => 1,
            'reported_at' => now(),
        ]);
    }
}

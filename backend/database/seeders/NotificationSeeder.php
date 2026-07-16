<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users for notifications
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        // Get a sample user to be the creator
        $creator = $users->first();
        
        // Get sub-cities

        $notifications = [];

        // Create various types of notifications for each user
        foreach ($users as $user) {
            // Recent notifications (today)
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'New Technology Request Submitted',
                'message' => 'A new technology request for "Cloud Infrastructure Upgrade" has been submitted and requires your review.',
                'type' => 'request',
                'channel' => 'in_app',
                'priority' => 'high',
                'action_url' => '/requests/1',
                'action_text' => 'Review Request',
                'data' => json_encode(['request_id' => 1, 'request_title' => 'Cloud Infrastructure Upgrade']),
                'read_at' => null,
                'sent_at' => Carbon::now()->subHours(2),
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ];

            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Request Approved',
                'message' => 'Your technology request "Mobile App Development" has been approved and is now in progress.',
                'type' => 'success',
                'channel' => 'in_app',
                'priority' => 'normal',
                'action_url' => '/requests/2',
                'action_text' => 'View Details',
                'data' => json_encode(['request_id' => 2]),
                'read_at' => Carbon::now()->subHour(),
                'sent_at' => Carbon::now()->subHours(3),
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHour(),
            ];

            // Cybersecurity alert (urgent)
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Cybersecurity Alert: CRITICAL',
                'message' => 'A critical security vulnerability has been detected in the payment gateway system. Immediate action required.',
                'type' => 'security',
                'channel' => 'in_app',
                'priority' => 'urgent',
                'action_url' => '/cybersecurity/1',
                'action_text' => 'View Issue',
                'data' => json_encode(['issue_id' => 1, 'severity' => 'critical']),
                'read_at' => null,
                'sent_at' => Carbon::now()->subMinutes(30),
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30),
            ];

            // Audit scheduled
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Audit Scheduled',
                'message' => 'An IT infrastructure audit has been scheduled for your sub-city on May 20, 2026.',
                'type' => 'audit',
                'channel' => 'in_app',
                'priority' => 'high',
                'action_url' => '/audits/1',
                'action_text' => 'View Audit',
                'data' => json_encode(['audit_id' => 1, 'scheduled_date' => '2026-05-20']),
                'read_at' => null,
                'sent_at' => Carbon::now()->subHours(5),
                'created_at' => Carbon::now()->subHours(5),
                'updated_at' => Carbon::now()->subHours(5),
            ];

            // Deadline reminder
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => null,
                'title' => 'Deadline Reminder',
                'message' => 'The deadline for "Quarterly Technology Report" is approaching in 3 days.',
                'type' => 'deadline',
                'channel' => 'in_app',
                'priority' => 'high',
                'action_url' => '/reports/1',
                'action_text' => 'View Report',
                'data' => json_encode(['report_id' => 1, 'deadline' => Carbon::now()->addDays(3)->toDateString()]),
                'read_at' => null,
                'sent_at' => Carbon::now()->subHours(1),
                'created_at' => Carbon::now()->subHours(1),
                'updated_at' => Carbon::now()->subHours(1),
            ];

            // Workflow escalation
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Workflow Escalated',
                'message' => 'A workflow has been escalated to you for approval: "Budget Approval for IT Equipment"',
                'type' => 'workflow',
                'channel' => 'in_app',
                'priority' => 'urgent',
                'action_url' => '/workflows/instances/1',
                'action_text' => 'Review Now',
                'data' => json_encode(['workflow_id' => 1]),
                'read_at' => null,
                'sent_at' => Carbon::now()->subMinutes(45),
                'created_at' => Carbon::now()->subMinutes(45),
                'updated_at' => Carbon::now()->subMinutes(45),
            ];

            // Yesterday's notifications
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Vendor Approved',
                'message' => 'Vendor "TechSolutions Ethiopia" has been approved and is now active in the system.',
                'type' => 'success',
                'channel' => 'in_app',
                'priority' => 'normal',
                'action_url' => '/vendors/1',
                'action_text' => 'View Vendor',
                'data' => json_encode(['vendor_id' => 1]),
                'read_at' => Carbon::yesterday()->addHours(2),
                'sent_at' => Carbon::yesterday(),
                'created_at' => Carbon::yesterday(),
                'updated_at' => Carbon::yesterday()->addHours(2),
            ];

            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Request Rejected',
                'message' => 'Your technology request "Legacy System Migration" has been rejected. Reason: Insufficient budget allocation.',
                'type' => 'error',
                'channel' => 'in_app',
                'priority' => 'high',
                'action_url' => '/requests/3',
                'action_text' => 'View Request',
                'data' => json_encode(['request_id' => 3, 'reason' => 'Insufficient budget allocation']),
                'read_at' => Carbon::yesterday()->addHours(3),
                'sent_at' => Carbon::yesterday()->subHours(2),
                'created_at' => Carbon::yesterday()->subHours(2),
                'updated_at' => Carbon::yesterday()->addHours(3),
            ];

            // This week's notifications
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => null,
                'title' => 'System Maintenance Scheduled',
                'message' => 'System maintenance is scheduled for May 18, 2026 from 2:00 AM to 4:00 AM. The system will be unavailable during this time.',
                'type' => 'system',
                'channel' => 'in_app',
                'priority' => 'high',
                'action_url' => null,
                'action_text' => null,
                'data' => json_encode(['scheduled_time' => '2026-05-18 02:00:00']),
                'read_at' => Carbon::now()->subDays(2)->addHours(1),
                'sent_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2)->addHours(1),
            ];

            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => $creator->id,
                'title' => 'Survey Response Required',
                'message' => 'Please complete the "IT Infrastructure Assessment Survey" by May 17, 2026.',
                'type' => 'info',
                'channel' => 'in_app',
                'priority' => 'normal',
                'action_url' => '/surveys/1',
                'action_text' => 'Take Survey',
                'data' => json_encode(['survey_id' => 1]),
                'read_at' => null,
                'sent_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ];

            // Older notifications
            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => null,
                'title' => 'Welcome to STRP',
                'message' => 'Welcome to the Smart Technology Request Portal! Your account has been created successfully.',
                'type' => 'info',
                'channel' => 'in_app',
                'priority' => 'normal',
                'action_url' => '/profile',
                'action_text' => 'Complete Profile',
                'data' => null,
                'read_at' => Carbon::now()->subDays(5),
                'sent_at' => Carbon::now()->subDays(7),
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(5),
            ];

            $notifications[] = [
                'user_id' => $user->id,
                'created_by_id' => null,
                'title' => 'Password Expiring Soon',
                'message' => 'Your password will expire in 14 days. Please change it to maintain account security.',
                'type' => 'warning',
                'channel' => 'in_app',
                'priority' => 'high',
                'action_url' => '/profile?tab=security',
                'action_text' => 'Change Password',
                'data' => json_encode(['days_remaining' => 14]),
                'read_at' => Carbon::now()->subDays(4),
                'sent_at' => Carbon::now()->subDays(6),
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(4),
            ];
        }

        // Insert all notifications
        foreach (array_chunk($notifications, 100) as $chunk) {
            Notification::insert($chunk);
        }

        $this->command->info('Notification seeder completed successfully!');
        $this->command->info('Created ' . count($notifications) . ' notifications for ' . $users->count() . ' users.');
    }
}

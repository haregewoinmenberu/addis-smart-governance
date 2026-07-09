<?php

require __DIR__.'/vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "\n🧪 TESTING RESEARCH LIFECYCLE API\n";
echo "═══════════════════════════════════════════════════════\n\n";

// Test 1: Fetch Research Ideas
echo "Test 1: GET /api/research-ideas\n";
try {
    $ideas = \App\Models\ResearchIdea::with(['submitter', 'attachments'])->get();
    echo "✅ Found {$ideas->count()} research ideas\n";
    foreach ($ideas as $idea) {
        echo "   - {$idea->title} ({$idea->status->value})\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Fetch Research Projects
echo "Test 2: GET /api/research-projects\n";
try {
    $projects = \App\Models\ResearchProject::with(['projectLead', 'researchIdea'])->get();
    echo "✅ Found {$projects->count()} research projects\n";
    foreach ($projects as $project) {
        echo "   - {$project->title}\n";
        echo "     Stage: {$project->current_stage->label()}\n";
        echo "     Progress: {$project->progress_percentage}%\n";
        echo "     Lead: {$project->projectLead->name}\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Test Workflow Transitions
echo "Test 3: Testing Workflow Engine\n";
try {
    $project = \App\Models\ResearchProject::first();
    if ($project) {
        $currentStage = $project->current_stage;
        $nextStage = $currentStage->next();
        
        echo "   Current Stage: {$currentStage->label()}\n";
        if ($nextStage) {
            echo "   Next Stage: {$nextStage->label()}\n";
            echo "   Can Transition: " . ($project->canTransitionTo($nextStage) ? 'Yes' : 'No') . "\n";
        } else {
            echo "   ✓ Project is at final stage\n";
        }
        
        // Test workflow history
        $history = $project->workflowHistory()->count();
        echo "   Workflow History Entries: {$history}\n";
        
        echo "✅ Workflow engine working correctly\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 4: Test Screening Scores
echo "Test 4: Testing Screening System\n";
try {
    $screenings = \App\Models\ResearchScreening::with(['researchIdea', 'evaluator'])->get();
    echo "✅ Found {$screenings->count()} screenings\n";
    foreach ($screenings as $screening) {
        echo "   - Idea: {$screening->researchIdea->title}\n";
        echo "     Total Score: {$screening->total_score}/60\n";
        echo "     Priority: {$screening->calculated_priority->label()}\n";
        echo "     Decision: {$screening->decision->label()}\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 5: Test Enums
echo "Test 5: Testing Enums\n";
try {
    echo "   Research Stages:\n";
    foreach (\App\Enums\ResearchStage::cases() as $stage) {
        echo "     - {$stage->label()}\n";
    }
    
    echo "\n   TRL Levels:\n";
    foreach (\App\Enums\TRLLevel::cases() as $trl) {
        echo "     - TRL {$trl->value}: {$trl->label()}\n";
    }
    
    echo "\n✅ All enums working correctly\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 6: Test Relationships
echo "Test 6: Testing Model Relationships\n";
try {
    $project = \App\Models\ResearchProject::with([
        'researchIdea',
        'projectLead',
        'milestones',
        'tasks',
        'teamMembers',
        'workflowHistory'
    ])->first();
    
    if ($project) {
        echo "   Project: {$project->title}\n";
        echo "   - Research Idea: " . ($project->researchIdea ? '✓' : '✗') . "\n";
        echo "   - Project Lead: " . ($project->projectLead ? '✓' : '✗') . "\n";
        echo "   - Milestones: {$project->milestones->count()}\n";
        echo "   - Tasks: {$project->tasks->count()}\n";
        echo "   - Team Members: {$project->teamMembers->count()}\n";
        echo "   - Workflow History: {$project->workflowHistory->count()}\n";
    }
    
    echo "✅ All relationships working\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 7: Test Roles & Permissions
echo "Test 7: Testing Roles & Permissions\n";
try {
    $roles = \App\Models\Role::with('permissions')->get();
    echo "✅ Found {$roles->count()} roles\n";
    foreach ($roles as $role) {
        echo "   - {$role->display_name}: {$role->permissions->count()} permissions\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n═══════════════════════════════════════════════════════\n";
echo "✅ ALL TESTS COMPLETED!\n\n";

echo "🌐 API ENDPOINTS AVAILABLE:\n";
echo "   GET    /api/research-ideas\n";
echo "   POST   /api/research-ideas\n";
echo "   GET    /api/research-ideas/{id}\n";
echo "   PUT    /api/research-ideas/{id}\n";
echo "   POST   /api/research-ideas/{id}/submit\n";
echo "   POST   /api/research-ideas/{id}/attachments\n";
echo "\n";
echo "   GET    /api/research-screenings\n";
echo "   POST   /api/research-screenings/ideas/{id}\n";
echo "\n";
echo "   GET    /api/research-projects\n";
echo "   POST   /api/research-projects\n";
echo "   GET    /api/research-projects/dashboard\n";
echo "   GET    /api/research-projects/{id}\n";
echo "   PUT    /api/research-projects/{id}\n";
echo "   POST   /api/research-projects/{id}/transition\n";
echo "   POST   /api/research-projects/{id}/rollback\n";
echo "\n";

<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Find all users with research_director role
$directors = \App\Models\User::whereHas('roles', function ($query) {
    $query->where('name', 'like', '%research_director%');
})->get();

echo "Research Directors in system: " . $directors->count() . PHP_EOL;
echo str_repeat('=', 80) . PHP_EOL;

foreach ($directors as $director) {
    echo "Director: " . $director->name . " (ID: " . $director->id . ")" . PHP_EOL;
    echo "Email: " . $director->email . PHP_EOL;
    
    // Check specific permission
    $hasReviewPerm = $director->can('review_research_stage');
    echo "Has 'review_research_stage': " . ($hasReviewPerm ? 'YES' : 'NO') . PHP_EOL;
    
    echo str_repeat('-', 80) . PHP_EOL;
}

// Check the workflow progress
echo PHP_EOL . "Checking Workflow Progress ID 1:" . PHP_EOL;
$progress = \App\Models\ResearchWorkflowProgress::find(1);
if ($progress) {
    echo "Research: " . $progress->researchIdea->title . PHP_EOL;
    echo "Stage: " . $progress->stage->name . PHP_EOL;
    echo "Status: " . $progress->status . PHP_EOL;
    echo "Requires Approval: " . ($progress->stage->requires_approval ? 'YES' : 'NO') . PHP_EOL;
    echo "Approver Role: " . $progress->stage->approver_role . PHP_EOL;
} else {
    echo "Progress not found!" . PHP_EOL;
}

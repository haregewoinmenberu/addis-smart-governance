<?php
// Simple script to check the latest Laravel error
$logFile = __DIR__ . '/storage/logs/laravel.log';

if (!file_exists($logFile)) {
    echo "No log file found at: $logFile\n";
    exit;
}

// Get last 100 lines
$lines = file($logFile);
$lastLines = array_slice($lines, -100);

echo "=== Last 100 Lines of Laravel Log ===\n\n";
echo implode("", $lastLines);

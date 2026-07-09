<?php

/**
 * Database Schema Generator from Laravel Migrations
 * 
 * This script parses Laravel migration files and generates a comprehensive
 * database schema documentation in Markdown format.
 */

$migrationsPath = __DIR__ . '/database/migrations';
$outputPath = __DIR__ . '/DATABASE_SCHEMA.md';

// Get all migration files
$migrationFiles = glob($migrationsPath . '/*.php');
sort($migrationFiles);

$schemaDoc = "# Addis Smart Governance - Database Schema\n\n";
$schemaDoc .= "**Generated:** " . date('Y-m-d H:i:s') . "\n\n";
$schemaDoc .= "This document describes the complete database schema for the Addis Smart Governance system.\n\n";
$schemaDoc .= "---\n\n";
$schemaDoc .= "## Table of Contents\n\n";

$tables = [];
$tablesByModule = [
    'Core System' => [],
    'Authentication & Authorization' => [],
    'Workflow Management' => [],
    'Technology Management' => [],
    'Professional Licensing' => [],
    'Research & Innovation' => [],
    'Institutions' => [],
    'OAuth & API' => [],
    'Other' => []
];

// Parse each migration file
foreach ($migrationFiles as $migrationFile) {
    $content = file_get_contents($migrationFile);
    $fileName = basename($migrationFile);
    
    // Extract table names using regex
    preg_match_all("/Schema::create\('([^']+)'/", $content, $createMatches);
    preg_match_all("/Schema::table\('([^']+)'/", $content, $alterMatches);
    
    $allTables = array_merge($createMatches[1] ?? [], $alterMatches[1] ?? []);
    
    foreach ($allTables as $tableName) {
        if (!isset($tables[$tableName])) {
            $tables[$tableName] = [
                'file' => $fileName,
                'content' => $content,
                'operations' => []
            ];
        }
        
        // Categorize table by module
        if (strpos($tableName, 'oauth_') === 0) {
            $tablesByModule['OAuth & API'][] = $tableName;
        } elseif (in_array($tableName, ['users', 'password_reset_tokens', 'sessions', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'activity_logs', 'user_sessions'])) {
            $tablesByModule['Core System'][] = $tableName;
        } elseif (strpos($tableName, 'role') !== false || strpos($tableName, 'permission') !== false) {
            $tablesByModule['Authentication & Authorization'][] = $tableName;
        } elseif (strpos($tableName, 'workflow') !== false || strpos($tableName, 'approval') !== false) {
            $tablesByModule['Workflow Management'][] = $tableName;
        } elseif (strpos($tableName, 'technology') !== false || strpos($tableName, 'deployment') !== false || strpos($tableName, 'committee') !== false || strpos($tableName, 'evaluation') !== false || strpos($tableName, 'request_items') !== false || strpos($tableName, 'vendors') !== false || strpos($tableName, 'duplication') !== false || strpos($tableName, 'feasibility') !== false || strpos($tableName, 'cybersecurity') !== false) {
            $tablesByModule['Technology Management'][] = $tableName;
        } elseif (strpos($tableName, 'profession') !== false || strpos($tableName, 'license') !== false || strpos($tableName, 'exam') !== false || strpos($tableName, 'disciplinary') !== false || strpos($tableName, 'complaint') !== false || strpos($tableName, 'hearing') !== false || strpos($tableName, 'sanction') !== false || strpos($tableName, 'appeal') !== false || strpos($tableName, 'continuing_education') !== false || strpos($tableName, 'educational_records') !== false || strpos($tableName, 'experience_records') !== false || strpos($tableName, 'verification_requests') !== false) {
            $tablesByModule['Professional Licensing'][] = $tableName;
        } elseif (strpos($tableName, 'research') !== false || strpos($tableName, 'proposal') !== false || strpos($tableName, 'experiment') !== false || strpos($tableName, 'prototype') !== false || strpos($tableName, 'trl_') !== false) {
            $tablesByModule['Research & Innovation'][] = $tableName;
        } elseif (strpos($tableName, 'institution') !== false) {
            $tablesByModule['Institutions'][] = $tableName;
        } else {
            $tablesByModule['Other'][] = $tableName;
        }
    }
}

// Remove duplicates from modules
foreach ($tablesByModule as $module => $tablesInModule) {
    $tablesByModule[$module] = array_unique($tablesInModule);
}

// Generate TOC
foreach ($tablesByModule as $module => $tablesInModule) {
    if (!empty($tablesInModule)) {
        $schemaDoc .= "- [{$module}](#" . slugify($module) . ")\n";
        foreach ($tablesInModule as $table) {
            $schemaDoc .= "  - [{$table}](#{$table})\n";
        }
    }
}

// Helper function for slugs
function slugify($text) {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9-]/', '-', $text);
    $text = preg_replace('/-+/', '-', $text);
    return trim($text, '-');
}

$schemaDoc .= "\n---\n\n";

// Generate detailed schema for each module
foreach ($tablesByModule as $module => $tablesInModule) {
    if (empty($tablesInModule)) continue;
    
    $schemaDoc .= "## {$module}\n\n";
    
    foreach ($tablesInModule as $tableName) {
        if (!isset($tables[$tableName])) continue;
        
        $tableData = $tables[$tableName];
        $content = $tableData['content'];
        
        $schemaDoc .= "### `{$tableName}`\n\n";
        $schemaDoc .= "**Migration File:** `{$tableData['file']}`\n\n";
        
        // Extract table definition
        if (preg_match("/Schema::create\('{$tableName}',\s*function\s*\(Blueprint\s*\\\$table\)\s*\{([^}]+)\}/s", $content, $match)) {
            $tableDefinition = $match[1];
            
            // Parse columns
            $schemaDoc .= "**Columns:**\n\n";
            $schemaDoc .= "| Column | Type | Attributes |\n";
            $schemaDoc .= "|--------|------|------------|\n";
            
            preg_match_all('/\$table->([a-zA-Z]+)\(([^\)]*)\)([^;]*);/', $tableDefinition, $columnMatches, PREG_SET_ORDER);
            
            foreach ($columnMatches as $colMatch) {
                $type = $colMatch[1];
                $params = $colMatch[2];
                $modifiers = trim($colMatch[3]);
                
                // Skip special methods
                if (in_array($type, ['index', 'unique', 'foreign', 'foreignId', 'morphs', 'timestamps', 'softDeletes'])) {
                    continue;
                }
                
                // Extract column name
                $columnName = trim($params, "'\"");
                if (strpos($params, ',') !== false) {
                    $parts = explode(',', $params);
                    $columnName = trim($parts[0], "'\" ");
                }
                
                // Build attributes string
                $attributes = [];
                if (strpos($modifiers, '->nullable()') !== false) {
                    $attributes[] = 'nullable';
                }
                if (strpos($modifiers, '->unique()') !== false) {
                    $attributes[] = 'unique';
                }
                if (strpos($modifiers, '->default(') !== false) {
                    preg_match('/->default\(([^\)]+)\)/', $modifiers, $defaultMatch);
                    $attributes[] = 'default: ' . $defaultMatch[1];
                }
                if (strpos($modifiers, '->unsigned()') !== false) {
                    $attributes[] = 'unsigned';
                }
                if (strpos($modifiers, '->index()') !== false) {
                    $attributes[] = 'indexed';
                }
                
                $attributesStr = !empty($attributes) ? implode(', ', $attributes) : '-';
                
                $schemaDoc .= "| `{$columnName}` | {$type} | {$attributesStr} |\n";
            }
            
            $schemaDoc .= "\n";
            
            // Extract indexes
            preg_match_all('/\$table->index\(([^\)]+)\)/', $tableDefinition, $indexMatches);
            if (!empty($indexMatches[1])) {
                $schemaDoc .= "**Indexes:**\n";
                foreach ($indexMatches[1] as $indexDef) {
                    $schemaDoc .= "- {$indexDef}\n";
                }
                $schemaDoc .= "\n";
            }
            
            // Extract unique constraints
            preg_match_all('/\$table->unique\(([^\)]+)\)/', $tableDefinition, $uniqueMatches);
            if (!empty($uniqueMatches[1])) {
                $schemaDoc .= "**Unique Constraints:**\n";
                foreach ($uniqueMatches[1] as $uniqueDef) {
                    $schemaDoc .= "- {$uniqueDef}\n";
                }
                $schemaDoc .= "\n";
            }
            
            // Extract foreign keys
            preg_match_all('/\$table->foreign(?:Id)?\([^\)]+\)(?:->constrained\([^\)]*\))?(?:->(?:onDelete|onUpdate|nullOnDelete|cascadeOnDelete)\([^\)]*\))*/', $tableDefinition, $foreignMatches);
            if (!empty($foreignMatches[0])) {
                $schemaDoc .= "**Foreign Keys:**\n";
                foreach ($foreignMatches[0] as $foreignDef) {
                    $schemaDoc .= "- `{$foreignDef}`\n";
                }
                $schemaDoc .= "\n";
            }
        }
        
        $schemaDoc .= "---\n\n";
    }
}

// Add statistics
$schemaDoc .= "## Database Statistics\n\n";
$schemaDoc .= "- **Total Tables:** " . count($tables) . "\n";
$schemaDoc .= "- **Total Migration Files:** " . count($migrationFiles) . "\n";
$schemaDoc .= "\n";
$schemaDoc .= "**Tables by Module:**\n";
foreach ($tablesByModule as $module => $tablesInModule) {
    if (!empty($tablesInModule)) {
        $schemaDoc .= "- {$module}: " . count($tablesInModule) . " tables\n";
    }
}

$schemaDoc .= "\n---\n\n";
$schemaDoc .= "*This schema documentation was automatically generated from Laravel migration files.*\n";

// Write to file
file_put_contents($outputPath, $schemaDoc);

echo "✓ Database schema documentation generated successfully!\n";
echo "  Output: {$outputPath}\n";
echo "  Total tables documented: " . count($tables) . "\n";

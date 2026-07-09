<?php

namespace Database\Factories;

use App\Models\ResearchIdea;
use App\Models\User;
use App\Enums\IdeaStatus;
use App\Enums\Priority;
use App\Enums\ResearchCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResearchIdeaFactory extends Factory
{
    protected $model = ResearchIdea::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'summary' => $this->faker->paragraph(),
            'problem_statement' => $this->faker->paragraphs(3, true),
            'objectives' => $this->faker->paragraphs(2, true),
            'expected_outcome' => $this->faker->paragraph(),
            'research_category' => $this->faker->randomElement(ResearchCategory::values()),
            'government_sector' => $this->faker->randomElement(['Health', 'Education', 'Infrastructure', 'Technology']),
            'priority' => $this->faker->randomElement(Priority::values()),
            'status' => $this->faker->randomElement(IdeaStatus::values()),
            'submitted_by' => User::factory(),
            'submitted_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}

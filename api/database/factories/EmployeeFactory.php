<?php

namespace Database\Factories;

use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Employee::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        return [
            'is_invite_accepted' => true,
            'background_color' => '2196F3',
            'text_color'       => 'ffffff',
            'verified_at' => Carbon::now(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Customer::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'firstname'  => $this->faker->firstName,
            'lastname'   => $this->faker->lastName,
            'email'      => $this->faker->email,
            'phone'      => $this->faker->numerify('##########'),
            'birth_date' => Carbon::now(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name'         => $this->faker->name,
            'duration'     => $this->faker->numberBetween(30, 90),
            'interval'     => $this->faker->numberBetween(30, 90),
            'payment_type' => Service::PAID_PAYMENT_TYPE,
            'price'        => 10.00,
        ];
    }
}

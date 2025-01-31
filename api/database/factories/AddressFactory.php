<?php

namespace Database\Factories;

use App\Models\Address;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Address::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        return [
            'address'     => $this->faker->address(),
            'l1'          => $this->faker->streetAddress(),
            'l2'          => $this->faker->secondaryAddress,
            'city'        => $this->faker->city(),
            'state'       => $this->faker->stateAbbr,
            'country'     => 'USA',
            'postal_code' => $this->faker->postcode(),
        ];
    }
}

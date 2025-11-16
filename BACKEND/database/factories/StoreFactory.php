<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    protected $model = Store::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company(),
            'branch_name' => fake()->city(),
            'address_line' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => substr(fake()->postcode(), 0, 20),
            'phone' => substr(fake()->phoneNumber(), 0, 50),
        ];
    }
}

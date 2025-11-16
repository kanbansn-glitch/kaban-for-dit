<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserOwnershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_index_scopes_results_to_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Store::factory()->count(2)->for($user)->create();
        Store::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/stores');

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_store_route_binding_blocks_cross_user_lookup(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $store = Store::factory()->for($user)->create();

        Sanctum::actingAs($otherUser);

        $this->getJson("/api/stores/{$store->id}")
            ->assertStatus(403);
    }
}

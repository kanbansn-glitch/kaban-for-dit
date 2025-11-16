<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_root_path_redirects_to_marketing_site(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('https://djafy.com');
    }
}

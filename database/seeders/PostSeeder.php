<?php
// database/seeders/PostSeeder.php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        // Create posts with random users
        Post::factory(15)->create([
            'user_id' => $users->random()->id,
        ]);
    }
}

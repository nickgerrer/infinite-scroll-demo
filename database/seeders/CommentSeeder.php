<?php
// database/seeders/CommentSeeder.php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $posts = Post::all();

        foreach ($posts as $post) {
            // Create 3-8 top-level comments per post
            $topLevelComments = Comment::factory(rand(3, 8))->create([
                'post_id' => $post->id,
                'user_id' => $users->random()->id,
                'parent_id' => null,
            ]);

            // Create replies to some top-level comments
            foreach ($topLevelComments as $comment) {
                if (rand(1, 100) <= 60) { // 60% chance of having replies
                    $replies = Comment::factory(rand(1, 4))->create([
                        'post_id' => $post->id,
                        'user_id' => $users->random()->id,
                        'parent_id' => $comment->id,
                    ]);

                    // Create replies to replies (nested comments)
                    foreach ($replies as $reply) {
                        if (rand(1, 100) <= 30) { // 30% chance of nested replies
                            Comment::factory(rand(1, 2))->create([
                                'post_id' => $post->id,
                                'user_id' => $users->random()->id,
                                'parent_id' => $reply->id,
                            ]);
                        }
                    }
                }
            }
        }
    }
}

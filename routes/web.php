<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/home', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/', function () {
    $posts = App\Models\Post::with([
        'user',
        'comments.user',
        'comments.replies.user',
        'comments.replies.replies.user'
    ])->get();

    return Inertia::render('posts', [
        'posts' => $posts
    ]);
})->name('posts');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

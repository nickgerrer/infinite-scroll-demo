<?php

namespace App\Http\Resources;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Comment */
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'user_id' => $this->user_id,
            'post_id' => $this->post_id,
            'parent_id' => $this->parent_id,

            'post' => new PostResource($this->whenLoaded('post')),
            'parent' => new CommentResource($this->whenLoaded('parent')),
        ];
    }
}

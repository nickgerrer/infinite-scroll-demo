import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@radix-ui/react-select';
import React, { useState } from 'react';
import { ChevronDown } from "lucide-react"
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppGuestHeaderLayout from '@/layouts/app/app-guest-header-layout';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

interface Comment {
    id: number;
    content: string;
    user_id: number;
    post_id: number;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
}

interface PostWithRelations extends Post {
    user: User;
    comments: CommentWithRelations[];
}

interface CommentWithRelations extends Comment {
    user: User;
    post?: Post;
    parent?: CommentWithRelations;
    replies: CommentWithRelations[];
}

export interface PaginatedPosts {
    current_page: number;
    data: PostWithRelations[];
    first_page_url: string | null;
    from: number;
    last_page: number;
    last_page_url: string | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[],
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Posts',
        href: '/posts',
    },
];
const CommentItem = ({ comment, depth = 0 }: { comment: CommentWithRelations; depth?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine sizing based on depth
    const avatarSize = depth === 0 ? "h-8 w-8" : depth === 1 ? "h-6 w-6" : "h-5 w-5";
    const textSize = depth === 0 ? "text-sm" : "text-xs";
    const nameSize = depth === 0 ? "text-sm" : "text-xs";
    const bgOpacity = depth === 0 ? "bg-muted" : depth === 1 ? "bg-muted/60" : "bg-muted/40";
    const padding = depth === 0 ? "p-3" : "p-2";
    const gap = depth === 0 ? "gap-3" : "gap-2";

    // Calculate consistent indentation: each level adds the avatar width + gap
    const indentationClass = depth === 0 ? "" :
        depth === 1 ? "ml-11" : // 32px (avatar) + 12px (gap) = 44px ≈ ml-11
            depth === 2 ? "ml-[68px]" : // Previous + 24px (avatar) + 8px (gap) = 68px
                `ml-[${68 + (depth - 2) * 28}px]`; // Each additional level adds ~28px

    return (
        <div className="space-y-2">
            {/* Comment */}
            <div className={`flex ${gap} ${indentationClass}`}>
                <Avatar className={`${avatarSize} mt-1 flex-shrink-0`}>
                    <AvatarFallback className="text-xs">
                        {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className={`${bgOpacity} rounded-lg ${padding}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${nameSize}`}>{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={textSize}>{comment.content}</p>
                    </div>

                    {/* Replies toggle button */}
                    {comment.replies && comment.replies.length > 0 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 mt-2 ml-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            </div>

            {/* Recursive Replies */}
            {comment.replies && comment.replies.length > 0 && isExpanded && (
                <div className="space-y-2">
                    {comment.replies.map((reply: CommentWithRelations) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PostCard = ({ post }: { post: PostWithRelations }) => {
    const [showComments, setShowComments] = useState(false);

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl font-semibold mb-2">{post.id}. {post.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                    {post.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span>{post.user.name}</span>
                            <Separator className="h-4" />
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                    <div className="border-t pt-4">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 font-medium mb-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform ${showComments ? 'rotate-180' : ''}`} />
                            Comments ({post.comments.length})
                        </button>

                        {showComments && (
                            <div className="space-y-4">
                                {post.comments.map((comment: CommentWithRelations) => (
                                    <CommentItem key={comment.id} comment={comment} depth={0} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface UnifiedLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export function UnifiedLayout({ children, breadcrumbs = [] }: UnifiedLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    const HeaderComponent = auth.user ? AppHeaderLayout : AppGuestHeaderLayout;

    return (
            <HeaderComponent breadcrumbs={breadcrumbs}>
                {children}
            </HeaderComponent>
    );
}

export default function Posts({ posts }: { posts: PostWithRelations[] }) {
    return (
        <UnifiedLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {posts.map((post: PostWithRelations) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </UnifiedLayout>
    );
}

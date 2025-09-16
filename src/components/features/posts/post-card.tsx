"use client";

import { Post } from "@/lib/api/posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, User, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { likePost } from "@/lib/api/posts";
import { toast } from "sonner";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  showActions?: boolean;
  onLikeChange?: () => void;
}

export function PostCard({ post, showActions = true, onLikeChange }: PostCardProps) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ""));
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      await likePost(post._id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      onLikeChange?.();
      toast.success(isLiked ? "Post unliked" : "Post liked");
    } catch {
      toast.error("Failed to like post");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.photo} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{post.author.username}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Title */}
          <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900">
            {post.title}
          </CardTitle>

          {/* Content */}
          <div className="leading-relaxed text-gray-700">
            <p className="line-clamp-3">{truncateContent(post.content)}</p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart
                className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
              />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-gray-400" />
              <span>{post.comments.length}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/community/${post._id}`}>Read More</Link>
              </Button>
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

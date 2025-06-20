import { PostList } from "@/components/features/posts/post-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vegan Community
            </h1>
            <p className="text-gray-600">
              Connect with fellow vegans, share experiences, and discover new insights
            </p>
          </div>
          <Button asChild>
            <Link href="/community/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>

        {/* Post List */}
        <PostList />
      </div>
    </div>
  );
} 
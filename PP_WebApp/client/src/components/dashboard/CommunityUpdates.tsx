import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ForumPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  commentCount: number;
  user: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

const PostItem = ({ post }: { post: ForumPost }) => {
  const createdAtDate = new Date(post.createdAt);
  const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  
  let badgeColor;
  let badgeText;
  
  if (post.category === 'discussion') {
    badgeColor = 'bg-primary-light text-primary';
    badgeText = 'Discussion';
  } else if (post.category === 'event') {
    badgeColor = 'bg-accent-light text-accent';
    badgeText = 'Event';
  } else if (post.category === 'success_story') {
    badgeColor = 'bg-secondary-light text-secondary';
    badgeText = 'Success Story';
  } else {
    badgeColor = 'bg-neutral-100 text-neutral-800';
    badgeText = post.category;
  }
  
  return (
    <li className="py-3">
      <Link href={`/community/posts/${post.id}`}>
        <a className="block hover:bg-neutral-50 rounded-lg p-2">
          <p className="text-sm font-medium text-neutral-900">{post.title}</p>
          <div className="mt-1 flex justify-between">
            <p className="text-xs text-neutral-500">{post.commentCount} comments • {timeAgo}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
        </a>
      </Link>
    </li>
  );
};

const CommunityUpdates = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/forum-posts'],
    retry: false,
  });
  
  // Take the 3 most recent posts
  const recentPosts = posts?.slice(0, 3);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">
          Community Updates
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Recent discussions and resources.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <ul className="divide-y divide-neutral-200">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="py-3">
                <div className="animate-pulse space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : recentPosts && recentPosts.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {recentPosts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">No community updates yet.</p>
          </div>
        )}
        <div className="mt-5">
          <Link href="/community">
            <a className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50">
              View Community
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityUpdates;

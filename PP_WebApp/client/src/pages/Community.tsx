import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

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

interface ForumComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  user: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

const PostCard = ({ post }: { post: ForumPost }) => {
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
    badgeText = post.category.charAt(0).toUpperCase() + post.category.slice(1).replace('_', ' ');
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">{post.title}</h3>
            <div className="flex items-center mt-1 text-sm text-neutral-500">
              <span>Posted by {post.user.firstName || post.user.username}</span>
              <span className="mx-2">•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
        
        <p className="mt-4 text-sm text-neutral-600 line-clamp-3">{post.content}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-500">
              <i className="fas fa-comment-alt mr-1"></i> {post.commentCount} comments
            </span>
          </div>
          <Button variant="outline" size="sm">Read More</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PostDetail = ({ postId }: { postId: number }) => {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  
  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: [`/api/forum-posts/${postId}`],
    retry: false,
  });
  
  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: [`/api/forum-posts/${postId}/comments`],
    retry: false,
  });
  
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/forum-posts/${postId}/comments`, {
        content: comment
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/forum-posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forum-posts/${postId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/forum-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Comment Failed",
        description: "There was an error posting your comment. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate();
    }
  };
  
  if (isPostLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
          <i className="fas fa-exclamation-circle text-neutral-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Post Not Found</h3>
        <p className="text-neutral-500">The post you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
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
    badgeText = post.category.charAt(0).toUpperCase() + post.category.slice(1).replace('_', ' ');
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-sm text-neutral-500">{timeAgo}</span>
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
            {post.user.firstName && post.user.lastName 
              ? `${post.user.firstName[0]}${post.user.lastName[0]}`
              : post.user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{post.user.firstName || post.user.username}</p>
            <p className="text-xs text-neutral-500">Community Member</p>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Comments ({post.commentCount})</h2>
        
        {isCommentsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border-b">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment: ForumComment) => {
              const commentTimeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
              
              return (
                <div key={comment.id} className="border-b border-neutral-200 pb-6">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                      {comment.user.firstName && comment.user.lastName 
                        ? `${comment.user.firstName[0]}${comment.user.lastName[0]}`
                        : comment.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{comment.user.firstName || comment.user.username}</p>
                      <p className="text-xs text-neutral-500">{commentTimeAgo}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-700 whitespace-pre-line">{comment.content}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
        
        {/* Add Comment Form */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Add a Comment</h3>
          <form onSubmit={handleAddComment}>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-32 mb-4"
              required
            />
            <Button 
              type="submit"
              disabled={addCommentMutation.isPending || !comment.trim()}
            >
              {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreatePostDialog = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("discussion");
  const { toast } = useToast();
  
  const createPostMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/forum-posts', {
        title,
        content,
        category
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your post has been created successfully.",
      });
      setTitle("");
      setContent("");
      setCategory("discussion");
      queryClient.invalidateQueries({ queryKey: ['/api/forum-posts'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Post Creation Failed",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate();
  };
  
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogDescription>
          Share your thoughts, questions, or experiences with the community.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Post Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            required
            maxLength={100}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="success_story">Success Story</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="resource">Resource</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            className="min-h-32"
            required
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            disabled={createPostMutation.isPending || !title.trim() || !content.trim()}
          >
            {createPostMutation.isPending ? "Creating..." : "Create Post"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const CommunityForum = () => {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/forum-posts'],
    retry: false,
  });
  
  // Apply filters
  const filteredPosts = posts 
    ? posts.filter((post: ForumPost) => {
        // Apply search filter
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply category filter
        const matchesCategory = filter === "all" || post.category === filter;
        
        return matchesSearch && matchesCategory;
      })
    : [];
  
  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
  };
  
  const handleBackToList = () => {
    setSelectedPostId(null);
  };
  
  return (
    <div>
      {selectedPostId ? (
        <div>
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Community
          </Button>
          
          <PostDetail postId={selectedPostId} />
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="flex-1 mb-4 md:mb-0 md:mr-4">
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="discussion">Discussions</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                    <SelectItem value="success_story">Success Stories</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="resource">Resources</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <i className="fas fa-plus mr-2"></i> Create Post
                    </Button>
                  </DialogTrigger>
                  <CreatePostDialog onClose={() => setIsDialogOpen(false)} />
                </Dialog>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post: ForumPost) => (
                <div key={post.id} onClick={() => handlePostClick(post.id)} className="cursor-pointer">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <i className="fas fa-comments text-neutral-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Posts Found</h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-6">
                {searchTerm || filter !== "all" 
                  ? "No posts match your current filters. Try adjusting your search or category filter."
                  : "There are no community posts yet. Be the first to start a discussion!"}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create First Post</Button>
                </DialogTrigger>
                <CreatePostDialog onClose={() => {}} />
              </Dialog>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EventsCalendar = () => {
  return (
    <div className="text-center py-12 bg-white shadow rounded-lg">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
        <i className="fas fa-calendar-alt text-neutral-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">Coming Soon!</h3>
      <p className="text-neutral-500 max-w-md mx-auto">
        The community events calendar is currently under development. Check back soon for networking events, webinars, and workshops.
      </p>
    </div>
  );
};

const MentorshipDirectory = () => {
  return (
    <div className="text-center py-12 bg-white shadow rounded-lg">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
        <i className="fas fa-users text-neutral-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">Coming Soon!</h3>
      <p className="text-neutral-500 max-w-md mx-auto">
        The mentorship directory is currently under development. Soon you'll be able to connect with experienced professionals who can guide your career transition.
      </p>
    </div>
  );
};

const Community = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-2">
          Community
        </h1>
        <p className="text-neutral-500">
          Connect with other gig workers, share experiences, and learn from each other.
        </p>
      </div>
      
      <Tabs defaultValue="forum" className="mb-6">
        <TabsList>
          <TabsTrigger value="forum">Discussion Forum</TabsTrigger>
          <TabsTrigger value="events">Events Calendar</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forum" className="mt-6">
          <CommunityForum />
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          <EventsCalendar />
        </TabsContent>
        
        <TabsContent value="mentorship" className="mt-6">
          <MentorshipDirectory />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Community;

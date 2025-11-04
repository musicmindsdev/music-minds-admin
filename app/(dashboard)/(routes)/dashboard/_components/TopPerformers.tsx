import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CardView from "@/components/svg icons/CardView";
import ListView from "@/components/svg icons/ListView";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Heart, Repeat2, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likes: Array<{
    id: string;
    userId: string;
    postId: string;
    createdAt: string;
  }>;
  reposts: Array<{
    id: string;
    userId: string;
    postId: string;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    authorId: string;
    postId: string;
    content: string;
    parentId: string | null;
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  media: Array<{
    id: string;
    postId: string;
    url: string;
    type: string;
    width: number;
    height: number;
    duration: number | null;
    size: number;
    format: string;
    thumbnail: string | null;
    aspectRatio: number;
    createdAt: string;
  }>;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
}

interface ProcessedPost {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  media: string[];
}

export default function TopPerformers() {
  const [isCardView, setIsCardView] = useState(false);
  const [posts, setPosts] = useState<ProcessedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopPosts();
  }, []);

  // Process the raw API data to calculate counts
  const processPostsData = (rawPosts: Post[]): ProcessedPost[] => {
    return rawPosts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      likesCount: post.likes?.length || 0,
      repostsCount: post.reposts?.length || 0,
      commentsCount: post.comments?.length || 0,
      author: post.author,
      media: post.media?.map(mediaItem => mediaItem.url) || []
    }));
  };

  const fetchTopPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/statistics/posts?limit=10');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch top posts');
      }

      const data = await response.json();

      // Debug: Log the API response to see its structure
      console.log('API Response:', data);

      // Handle the nested response structure
      let rawPosts: Post[] = [];

      if (data.posts && data.posts.data && Array.isArray(data.posts.data)) {
        // Structure: { posts: { data: [...] } }
        rawPosts = data.posts.data;
      } else if (data.posts && Array.isArray(data.posts)) {
        // Structure: { posts: [...] }
        rawPosts = data.posts;
      } else if (Array.isArray(data)) {
        // Structure: [...]
        rawPosts = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Structure: { data: [...] }
        rawPosts = data.data;
      }

      // Process the posts to calculate counts
      const processedPosts = processPostsData(rawPosts);
      setPosts(processedPosts);

    } catch (err) {
      console.error('Error fetching top posts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' -');
  };

  // Truncate text for table view
  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Generate avatar URL with fallback
  const getAvatarUrl = (author: ProcessedPost['author']) => {
    if (author?.avatar) return author.avatar;
    return `https://api.dicebear.com/6.x/initials/svg?seed=${author?.name || 'User'}`;
  };

  // Get author name with fallback
  const getAuthorName = (author: ProcessedPost['author']) => {
    return author?.name || 'Unknown User';
  };

  // Get username with fallback
  const getUsername = (author: ProcessedPost['author']) => {
    return author?.username || 'unknown';
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-light text-sm">TOP PERFORMING POSTS</h3>
          <div className="space-x-2">
            <Button variant="ghost" size="icon" disabled>
              <CardView className="h-5 w-5" color="#C3C3C3" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <ListView className="h-5 w-5" color="#C3C3C3" />
            </Button>
          </div>
        </div>
        {isCardView ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="ml-auto h-5 w-6" />
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-light text-sm">TOP PERFORMING POSTS</h3>
          <div className="space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsCardView(false)}>
              <CardView className="h-5 w-5" color={isCardView ? "#C3C3C3" : "#5243FE"} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsCardView(true)}>
              <ListView className="h-5 w-5" color={isCardView ? "#5243FE" : "#C3C3C3"} />
            </Button>
          </div>
        </div>
        <div className="text-center py-8 text-red-500">
          Error: {error}
          <Button
            onClick={fetchTopPosts}
            className="ml-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-light text-sm">TOP PERFORMING POSTS</h3>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCardView(false)}
          >
            <CardView
              className="h-5 w-5"
              color={isCardView ? "#C3C3C3" : "#5243FE"}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCardView(true)}
          >
            <ListView
              className="h-5 w-5"
              color={isCardView ? "#5243FE" : "#C3C3C3"}
            />
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No post data available
        </div>
      ) : isCardView ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post, index) => (
            <Card key={post.id || index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Image
                  src={getAvatarUrl(post.author)}
                  alt={getAuthorName(post.author)}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    // Fallback to dicebear if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${getAuthorName(post.author)}`;
                  }}
                />
                <div>
                  <div className="font-medium">{getAuthorName(post.author)}</div>
                  <div className="text-sm text-gray-500">@{getUsername(post.author)}</div>
                  <div className="text-xs text-gray-400">
                    Engagement: {post.likesCount + post.repostsCount + post.commentsCount}
                  </div>
                </div>
                <div className="ml-auto text-sm text-gray-500">#{index + 1}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4"/> {post.likesCount}</span>
                  <span className="flex items-center gap-2"><Repeat2 className="w-4 h-4"/> {post.repostsCount}</span>
                  <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4"/> {post.commentsCount}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Posted: {formatDate(post.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Post Content</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Reposts</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Posted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post, index) => (
              <TableRow key={post.id || index}>
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Image
                      src={getAvatarUrl(post.author)}
                      alt={getAuthorName(post.author)}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        // Fallback to dicebear if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${getAuthorName(post.author)}`;
                      }}
                    />
                    <div>
                      <div className="font-medium">{getAuthorName(post.author)}</div>
                      <div className="text-xs text-gray-500">@{getUsername(post.author)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{truncateText(post.content, 50)}</TableCell>
                <TableCell>{post.likesCount}</TableCell>
                <TableCell>{post.repostsCount}</TableCell>
                <TableCell>{post.commentsCount}</TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
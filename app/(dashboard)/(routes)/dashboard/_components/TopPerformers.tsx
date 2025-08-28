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

interface Post {
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopPosts();
  }, []);

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
      
      // Handle different possible response structures
      let postsData: Post[] = [];
      
      if (Array.isArray(data)) {
        // If the response is directly an array
        postsData = data;
      } else if (data && Array.isArray(data.posts)) {
        // If the response has a posts property that is an array
        postsData = data.posts;
      } else if (data && Array.isArray(data.data)) {
        // If the response has a data property that is an array
        postsData = data.data;
      } else if (data && data.data && Array.isArray(data.data.posts)) {
        // If the response has data.posts that is an array
        postsData = data.data.posts;
      }
      
      // Ensure we always have an array, even if empty
      setPosts(Array.isArray(postsData) ? postsData : []);
      
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

  // Ensure posts is always an array before mapping
  const displayPosts = Array.isArray(posts) ? posts : [];

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
      
      {displayPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No post data available
        </div>
      ) : isCardView ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayPosts.map((post, index) => (
            <Card key={post.id || index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <img
                  src={post.author?.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${post.author?.name || 'User'}`}
                  alt={post.author?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium">{post.author?.name || 'Unknown User'}</div>
                  <div className="text-sm text-gray-500">@{post.author?.username || 'unknown'}</div>
                  <div className="text-xs text-gray-400">
                    Engagement: {post.likesCount + post.repostsCount + post.commentsCount}
                  </div>
                </div>
                <div className="ml-auto text-sm text-gray-500">#{index + 1}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>❤️ {post.likesCount}</span>
                  <span>🔄 {post.repostsCount}</span>
                  <span>💬 {post.commentsCount}</span>
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
            {displayPosts.map((post, index) => (
              <TableRow key={post.id || index}>
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author?.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${post.author?.name || 'User'}`}
                      alt={post.author?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{post.author?.name || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">@{post.author?.username || 'unknown'}</div>
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
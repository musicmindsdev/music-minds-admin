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

interface ServiceProvider {
  id: string;
  username: string;
  name: string;
  avatar: string;
  completedBookingsCount: number;
  reviewsCount: number;
  recentBookings: string[];
}

export default function ServiceProviderTopPerformers() {
  const [isCardView, setIsCardView] = useState(false);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopProviders();
  }, []);

  const fetchTopProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/statistics/providers?limit=10');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch top providers');
      }
      
      const data = await response.json();
      
      console.log('API Response:', data);
      
      let providersData: ServiceProvider[] = [];
      
      if (Array.isArray(data)) {
        providersData = data;
      } else if (data && Array.isArray(data.providers)) {
        providersData = data.providers;
      } else if (data && Array.isArray(data.data)) {
        providersData = data.data;
      } else if (data && data.data && Array.isArray(data.data.providers)) {
        providersData = data.data.providers;
      }
      

      setProviders(Array.isArray(providersData) ? providersData : []);
      
    } catch (err) {
      console.error('Error fetching top providers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-light text-sm">TOP PERFORMERS</h3>
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
                  <Skeleton className="h-4 w-2/3" />
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
          <h3 className="font-light text-sm">TOP PERFORMERS</h3>
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
        </div>
      </div>
    );
  }

  // Ensure providers is always an array before mapping
  const displayProviders = Array.isArray(providers) ? providers : [];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-light text-sm">TOP SERVICE PROVIDERS</h3>
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
      
      {displayProviders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No provider data available
        </div>
      ) : isCardView ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayProviders.map((provider, index) => (
            <Card key={provider.id || index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <img
                  src={provider.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${provider.name}`}
                  alt={provider.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-500">@{provider.username}</div>
                  <div className="text-xs text-gray-400">
                    {provider.recentBookings && provider.recentBookings.length > 0 
                      ? `Recent: ${provider.recentBookings[0]}` 
                      : 'No recent bookings'}
                  </div>
                </div>
                <div className="ml-auto text-sm text-gray-500">#{index + 1}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-gray-700">
                  Completed Bookings: {provider.completedBookingsCount || 0}
                </div>
                <div className="text-sm text-gray-700">
                  Reviews: {provider.reviewsCount || 0}
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
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Completed Bookings</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Recent Booking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProviders.map((provider, index) => (
              <TableRow key={provider.id || index}>
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={provider.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${provider.name}`}
                      alt={provider.name}
                      className="w-6 h-6 rounded-full"
                    />
                    {provider.name}
                  </div>
                </TableCell>
                <TableCell>@{provider.username}</TableCell>
                <TableCell>{provider.completedBookingsCount || 0}</TableCell>
                <TableCell>{provider.reviewsCount || 0}</TableCell>
                <TableCell>
                  {provider.recentBookings && provider.recentBookings.length > 0 
                    ? provider.recentBookings[0] 
                    : 'None'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
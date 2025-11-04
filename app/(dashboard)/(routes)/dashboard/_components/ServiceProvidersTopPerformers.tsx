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

interface RawProvider {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  email: string;
  _count: {
    bookingInvitation: number;
    review: number;
  };
  bookingInvitation: Array<{
    id: string;
    booking: {
      id: string;
      title: string;
      description: string;
      status: string;
      createdAt: string;
    };
  }>;
}

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

  // Process the raw API data to match our frontend interface
  const processProvidersData = (rawProviders: RawProvider[]): ServiceProvider[] => {
    return rawProviders.map(provider => ({
      id: provider.id,
      username: provider.username,
      name: provider.name,
      avatar: provider.avatar || '',
      completedBookingsCount: provider._count?.bookingInvitation || 0,
      reviewsCount: provider._count?.review || 0,
      recentBookings: provider.bookingInvitation 
        ? provider.bookingInvitation
            .slice(0, 3)
            .map(invitation => invitation.booking.title)
        : []
    }));
  };

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
      
      let rawProviders: RawProvider[] = [];
      
      // Handle the nested response structure correctly
      if (data.providers && data.providers.data && Array.isArray(data.providers.data)) {
        // Structure: { providers: { data: [...] } }
        rawProviders = data.providers.data;
      } else if (data.providers && Array.isArray(data.providers)) {
        // Structure: { providers: [...] }
        rawProviders = data.providers;
      } else if (data.data && Array.isArray(data.data)) {
        // Structure: { data: [...] }
        rawProviders = data.data;
      } else if (Array.isArray(data)) {
        // Structure: [...]
        rawProviders = data;
      }
      
      console.log('Raw providers data:', rawProviders);
      
      // Process the raw data to match our frontend interface
      const processedProviders = processProvidersData(rawProviders);
      setProviders(processedProviders);
      
    } catch (err) {
      console.error('Error fetching top providers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for avatar handling
  const getAvatarUrl = (provider: ServiceProvider) => {
    const cleanName = provider.name?.trim() || 'Unknown Provider';
    return provider.avatar || `https://api.dicebear.com/6.x/initials/png?seed=${encodeURIComponent(cleanName)}`;
  };

  const getProviderName = (provider: ServiceProvider) => {
    return provider.name?.trim() || 'Unknown Provider';
  };

  const getUsername = (provider: ServiceProvider) => {
    return provider.username || 'unknown';
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
          <Button 
            onClick={fetchTopProviders} 
            className="ml-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
                <Image
                  src={getAvatarUrl(provider)}
                  alt={getProviderName(provider)}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const cleanName = getProviderName(provider);
                    target.src = `https://api.dicebear.com/6.x/initials/png?seed=${encodeURIComponent(cleanName)}`;
                  }}
                />
                <div>
                  <div className="font-medium">{getProviderName(provider)}</div>
                  <div className="text-sm text-gray-500">@{getUsername(provider)}</div>
                  <div className="text-xs text-gray-400">
                    Bookings: {provider.completedBookingsCount}
                  </div>
                </div>
                <div className="ml-auto text-sm text-gray-500">#{index + 1}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-gray-700 mb-2">
                  Reviews: {provider.reviewsCount}
                </div>
                {provider.recentBookings.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Recent: {provider.recentBookings[0]}
                  </div>
                )}
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
                    <Image
                      src={getAvatarUrl(provider)}
                      alt={getProviderName(provider)}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const cleanName = getProviderName(provider);
                        target.src = `https://api.dicebear.com/6.x/initials/png?seed=${encodeURIComponent(cleanName)}`;
                      }}
                    />
                    {getProviderName(provider)}
                  </div>
                </TableCell>
                <TableCell>@{getUsername(provider)}</TableCell>
                <TableCell>{provider.completedBookingsCount}</TableCell>
                <TableCell>{provider.reviewsCount}</TableCell>
                <TableCell>
                  {provider.recentBookings.length > 0 
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
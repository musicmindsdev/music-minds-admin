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

interface RawClient {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  email: string;
  _count: {
    booking: number;
    review: number;
  };
  booking: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
}

interface Client {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bookingsCount: number;
  reviewsCount: number;
  recentBookings: string[];
}

export default function ClientTopPerformers() {
  const [isCardView, setIsCardView] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopClients();
  }, []);

  // Process the raw API data to match our frontend interface
  const processClientsData = (rawClients: RawClient[]): Client[] => {
    return rawClients.map(client => ({
      id: client.id,
      username: client.username,
      name: client.name,
      avatar: client.avatar || '',
      bookingsCount: client._count?.booking || 0,
      reviewsCount: client._count?.review || 0,
      recentBookings: client.booking 
        ? client.booking.slice(0, 3).map(booking => booking.title)
        : []
    }));
  };

  const fetchTopClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/statistics/clients?limit=10');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch top clients');
      }
      
      const data = await response.json();
      
      console.log('API Response:', data);
      
      let rawClients: RawClient[] = [];
      
      // Handle the nested response structure correctly
      if (data.clients && data.clients.data && Array.isArray(data.clients.data)) {
        // Structure: { clients: { data: [...] } }
        rawClients = data.clients.data;
      } else if (data.clients && Array.isArray(data.clients)) {
        // Structure: { clients: [...] }
        rawClients = data.clients;
      } else if (data.data && Array.isArray(data.data)) {
        // Structure: { data: [...] }
        rawClients = data.data;
      } else if (Array.isArray(data)) {
        // Structure: [...]
        rawClients = data;
      }
      
      console.log('Raw clients data:', rawClients);
      
      // Process the raw data to match our frontend interface
      const processedClients = processClientsData(rawClients);
      setClients(processedClients);
      
    } catch (err) {
      console.error('Error fetching top clients:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for avatar handling
  const getAvatarUrl = (client: Client) => {
    return client.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${client.name}`;
  };

  const getClientName = (client: Client) => {
    return client.name || 'Unknown Client';
  };

  const getUsername = (client: Client) => {
    return client.username || 'unknown';
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-light text-sm">TOP CLIENTS</h3>
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
          <h3 className="font-light text-sm">TOP CLIENTS</h3>
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
            onClick={fetchTopClients} 
            className="ml-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const displayClients = Array.isArray(clients) ? clients : [];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-light text-sm">TOP CLIENTS</h3>
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
      
      {displayClients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No client data available
        </div>
      ) : isCardView ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayClients.map((client, index) => (
            <Card key={client.id || index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Image
                  src={getAvatarUrl(client)}
                  alt={getClientName(client)}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    // Fallback to dicebear if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${getClientName(client)}`;
                  }}
                />
                <div>
                  <div className="font-medium">{getClientName(client)}</div>
                  <div className="text-sm text-gray-500">@{getUsername(client)}</div>
                  <div className="text-xs text-gray-400">
                    Bookings: {client.bookingsCount}
                  </div>
                </div>
                <div className="ml-auto text-sm text-gray-500">#{index + 1}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-gray-700 mb-2">
                  Reviews: {client.reviewsCount}
                </div>
                {client.recentBookings.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Recent: {client.recentBookings[0]}
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
              <TableHead>Bookings</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Recent Booking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayClients.map((client, index) => (
              <TableRow key={client.id || index}>
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Image
                      src={getAvatarUrl(client)}
                      alt={getClientName(client)}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        // Fallback to dicebear if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${getClientName(client)}`;
                      }}
                    />
                    {getClientName(client)}
                  </div>
                </TableCell>
                <TableCell>@{getUsername(client)}</TableCell>
                <TableCell>{client.bookingsCount}</TableCell>
                <TableCell>{client.reviewsCount}</TableCell>
                <TableCell>
                  {client.recentBookings.length > 0 
                    ? client.recentBookings[0] 
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
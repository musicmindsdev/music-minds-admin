"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import UserDetailsView from "./_components/UserDetailsView";
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for API response data
interface ApiRole {
  id: string;
  name: string;
  permissions: string[];
}

interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: ApiRole[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  status: "Active" | "Suspended" | "Deactivated";
  verified: boolean;
  lastLogin: string;
  image: string;
  followers: number;
  following: number;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch user details');
      }
      
      const data = await response.json();
      
      // Handle different response structures
      let userData: ApiUser;
      
      if (data.user) {
        userData = data.user;
      } else if (data.data) {
        userData = data.data;
      } else {
        userData = data;
      }
      
      // Map API user to component user
      const mappedUser = {
        id: userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        profileType: userData.roles?.[0]?.name || "User",
        status: userData.roles?.some((role: ApiRole) => 
          role.name.toLowerCase().includes('blacklist') || 
          role.name.toLowerCase().includes('suspended')
        ) ? "Suspended" : "Active" as "Active" | "Suspended" | "Deactivated",
        verified: true,
        lastLogin: new Date(userData.updatedAt).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', ' • '),
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`,
        followers: 0,  
        following: 0
      };
      
      setUser(mappedUser);
      
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/user-management");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="flex items-center gap-1 text-sm text-gray-600">
            ← All Users
          </button>
        </div>
        <div className="text-center py-8 text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <UserDetailsView user={user} onClose={handleBack} />
    </div>
  );
}
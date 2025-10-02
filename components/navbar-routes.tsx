"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings, LogOut, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SearchInput } from "./search-input";
import { ModeToggle } from "./modetoggle";
import { transactionsData } from "@/lib/mockData";
import InviteAdminModal from "./invite-admin-modal";
import Modal from "./Modal";
import { RiAlertFill } from "react-icons/ri";
import NotificationsDropdown from "./notificationsDropdown";

interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  status: string;
  verified: boolean;
  lastLogin: string;
  image: string;
}

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  providerName: string;
  providerEmail: string;
  serviceOffered: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
  paymentAmount: string;
  platformFee: string;
  transactionId: string;
}

interface Transaction {
  id: string;
  bookingId: string;
  clientName: string;
  providerName: string;
  serviceOffered: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
  image: string;
}

// Helper function to get cookie value and decode it
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

export const NavbarRoutes = () => {
  const router = useRouter();
  const [isInviteAdminModalOpen, setIsInviteAdminModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@musicminds.com",
    role: "Administrator",
    lastLogin: "Apr 19, 2025 • 09:00 AM",
    image: "https://github.com/shadcn.png",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions] = useState<Transaction[]>(transactionsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data from cookies on mount
  useEffect(() => {
    setIsMounted(true);

    // Get email and role from cookies
    const userEmail = getCookie('userEmail');
    const userRole = getCookie('userRole');

    if (userEmail && userRole) {
      // Extract name from email (everything before @)
      const nameFromEmail = userEmail.split('@')[0];
      
      // Update user state with data from cookies
      setUser(prev => ({
        ...prev,
        email: userEmail,
        role: userRole,
        name: nameFromEmail,
      }));

      // Also save to localStorage for persistence
      localStorage.setItem("userData", JSON.stringify({
        ...user,
        email: userEmail,
        role: userRole,
        name: nameFromEmail,
      }));
    } else {
      // Fallback to localStorage if cookies aren't available
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Users
        const usersResponse = await fetch("/api/users?page=1&limit=10");
        if (!usersResponse.ok) {
          const errorData = await usersResponse.json();
          throw new Error(errorData.error || "Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData.users) ? usersData.users : []);

        // Fetch Bookings
        const bookingsResponse = await fetch("/api/bookings?page=1&limit=10");
        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse.json();
          throw new Error(errorData.error || "Failed to fetch bookings");
        }
        const bookingsData = await bookingsResponse.json();
        setBookings(Array.isArray(bookingsData.data) ? bookingsData.data : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setUsers([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleInviteAdmin = () => {
    setIsInviteAdminModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Clear cookies by setting them to expire
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Clear localStorage
      if (isMounted) {
        localStorage.removeItem("userData");
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-end gap-6 w-full p-4">
        <div className="hidden md:block max-w-md">
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-6 w-full p-4">
      <div className="hidden md:block max-w-md">
        {error ? (
          <p className="text-sm text-red-500">Error: {error}</p>
        ) : (
          <SearchInput
            users={users}
            bookings={bookings}
            transactions={transactions}
          />
        )}
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <NotificationsDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <MdKeyboardArrowDown className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem onClick={handleSettings} className="p-0">
              <div className="flex items-center gap-3 p-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </div>
            </DropdownMenuItem>

            <div className="px-3 py-2">
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm">{user.role}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500">Last Login</p>
              <p className="text-sm">{user.lastLogin}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleInviteAdmin} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Admin
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSettings} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={openLogoutModal} className="flex items-center gap-2 text-red-600">
              <LogOut className="h-4 w-4 text-red-600" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <InviteAdminModal
          isOpen={isInviteAdminModalOpen}
          onClose={() => setIsInviteAdminModalOpen(false)}
        />

        <Modal
          isOpen={isLogoutModalOpen}
          onClose={closeLogoutModal}
          title="Logout"
          icon={<RiAlertFill className="h-8 w-8 text-red-500" />}
          iconBgColor="#FEE2E2"
          message1="Already leaving?"
          message="Are you sure you want to logout?"
          cancelText="No, I'm staying"
          confirmText="Yes, logout"
          confirmButtonColor="#EF4444"
          onConfirm={handleSignOut}
        />
      </div>
    </div>
  );
};
"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoIosArrowBack } from "react-icons/io";
import { IoBanOutline } from "react-icons/io5";
import Calendar from "@/components/svg icons/Calendar";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/Modal";
import { PiWarningOctagonFill } from "react-icons/pi";
import { CheckCircle, UserRoundX } from "lucide-react";
import { FaTrash, FaUser } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
// import BookingTable from "../../dashboard/_components/BookingTable";
// import ReviewTable from "../../content-management/_components/ReviewTable";
import { Booking } from "../../dashboard/_components/BookingTable"; // Import Booking interface

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
  phone: string;
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

interface UserDetailsViewProps {
  user: User | null;
  onClose: () => void;
}

// Define interfaces for API response structure
interface ApiResponse {
  user?: ApiUser;
  data?: ApiUser;
}

// Define interface for Review
interface Review {
  id: string;
  rating: number;
  reviewText: string;
  reviewer: {
    name: string;
    email: string;
  };
  userName: string;
  serviceOffered: string;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapApiUserToComponentUser = (apiUser: any): User => {
  const userData = apiUser.user || apiUser.data || apiUser;

  const isSuspended = userData.isShadowBanned ||
    userData.role?.toLowerCase().includes('disabled') ||
    false;

  const status: "Active" | "Suspended" | "Deactivated" = isSuspended ? "Suspended" : "Active";

  const profileType = userData.role || "User";

  return {
    id: userData.id,
    name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
    email: userData.email,
    profileType,
    status,
    verified: userData.isVerified || false,
    lastLogin: new Date(userData.updatedAt || userData.createdAt).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' • '),
    image: userData.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${userData.name || userData.email}`,
    followers: userData.followers || 0,
    following: userData.following || 0
  };
};

export default function UserDetailsView({ user: initialUser, onClose }: UserDetailsViewProps) {
  // const [activeTab, setActiveTab] = useState<"Bookings" | "Reviews">("Bookings");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details if not provided
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch user details');
      }

      const data: ApiResponse = await response.json();

      // Handle different response structures
      let userData: ApiUser;

      if (data.user) {
        userData = data.user;
      } else if (data.data) {
        userData = data.data;
      } else {
        userData = data as ApiUser;
      }

      const mappedUser = mapApiUserToComponentUser(userData);
      setUser(mappedUser);

    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser && user?.id) {
      fetchUserDetails(user.id);
    }
  }, [initialUser, user?.id, fetchUserDetails]);

  // Mock data for bookings and reviews (replace with actual API calls)
  const userBookings: Booking[] = [];
  const userReviews: Review[] = [];

  const totalBookings = userBookings.length;
  const totalSpent = userBookings.reduce((sum, booking: Booking) => {
    const amount = parseFloat(booking.totalAmount?.replace("$", "") || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const totalReviews = userReviews.length;

  const handleDelete = async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      console.log("Deleted user:", user.id);
      setIsDeleteModalOpen(false);
      onClose(); // Close the details view after deletion
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSuspend = async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/users/${user.id}/blacklist`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      console.log("Suspended user:", user.id);
      setIsSuspendModalOpen(false);
      // Refresh user data to show updated status
      if (user.id) {
        fetchUserDetails(user.id);
      }
    } catch (err) {
      console.error('Error suspending user:', err);
      setError('Failed to suspend user');
    }
  };

  const openSuspendModal = () => {
    setIsSuspendModalOpen(true);
  };

  const closeSuspendModal = () => {
    setIsSuspendModalOpen(false);
  };

  const handleActivate = async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/users/${user.id}/unblacklist`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to activate user');
      }

      console.log("Activated user:", user.id);
      setIsActivateModalOpen(false);
      // Refresh user data to show updated status
      if (user.id) {
        fetchUserDetails(user.id);
      }
    } catch (err) {
      console.error('Error activating user:', err);
      setError('Failed to activate user');
    }
  };

  const openActivateModal = () => {
    setIsActivateModalOpen(true);
  };

  const closeActivateModal = () => {
    setIsActivateModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="p-6 rounded-lg shadow mb-6 bg-card">
          <div className="flex items-start gap-6 mb-6">
            <Skeleton className="h-35 w-35 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-600">
            <IoIosArrowBack className="mr-1" /> All Users
          </button>
        </div>
        <div className="text-center py-8 text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-600">
            <IoIosArrowBack className="mr-1" /> All Users
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          <button onClick={onClose} className="flex items-center gap-1">
            <IoIosArrowBack className="mr-1" /> All Users <span>/</span>{" "}
            <span className="font-semibold">{user.id}</span>
          </button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={openSuspendModal}>
            <IoBanOutline className="h-4 w-4" />
            Suspend
          </Button>
          <Button variant="outline" size="sm" onClick={openActivateModal}>
            <CheckCircle className="h-4 w-4" />
            Activate
          </Button>
          <Button variant="outline" size="sm" onClick={openDeleteModal} className="text-red-600">
            <UserRoundX className="h-4 w-4 text-red-600" />
            Delete
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 rounded-lg shadow mb-6 bg-card">
        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-35 w-35">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="text-2xl font-medium bg-gray-200 text-gray-700">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs mb-1">Username</p>
                <p className="text-xs font-semibold mb-1">@{user.name.toLowerCase().replace(/\s/g, "")}</p>
                <p className="text-xs font-light mb-1">Fullname</p>
                <p className="text-xs font-semibold mb-1">{user.name}</p>
                <p className="text-xs font-light mb-1">Email</p>
                <p className="text-xs font-semibold mb-1">{user.email}</p>
                <p className="text-xs font-light mb-1">Profile Type</p>
                <p className="text-xs font-semibold mb-1">{user.profileType}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs">Total Followers</p>
                  <p className="font-medium">{user.followers?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-xs">Total Following</p>
                  <p className="font-medium">{user.following?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-xs">Date Joined</p>
                  <p className="font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs">Last Activity</p>
                  <p className="font-medium">{user.lastLogin}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs">User Status</p>
                  <p className="flex items-center gap-1 font-medium text-xs">
                    <span className={`h-2 w-2 rounded-full ${user.status === "Active" ? "bg-green-500" :
                        user.status === "Suspended" ? "bg-yellow-500" :
                          "bg-gray-500"
                      }`} />
                    {user.status}
                  </p>
                </div>
                <Button variant={"outline"} className="text-xs">
                  Change Status
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-6 text-sm text-gray-600">
              <div>
                <p className="flex items-center gap-2">
                  <Calendar /> Total Bookings
                </p>
                <p className="font-medium">{totalBookings}</p>
              </div>
              <div>
                <p className="flex items-center gap-2">
                  <Calendar /> Total Spent
                </p>
                <p className="font-medium">{totalSpent}</p>
              </div>
              <div>
                <p className="flex items-center gap-2">
                  <Calendar /> Total Reviews
                </p>
                <p className="font-medium">{totalReviews}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      {/* <div className="flex space-x-2 border border-b-0 mb-0 px-2 pt-2 rounded-t-lg bg-card">
        <Button
          variant={"ghost"}
          className={`px-4 rounded-none ${activeTab === "Bookings" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("Bookings")}
        >
          Bookings
        </Button>
        <Button
          variant={"ghost"}
          className={`px-4 rounded-none ${activeTab === "Reviews" ? "border-b border-[#5243FE] text-[#5243FE]" : ""}`}
          onClick={() => setActiveTab("Reviews")}
        >
          Reviews
        </Button>
      </div> */}
      {/* <div className="rounded-none mt-0">
        <div className="p-6 shadow bg-card">
          {activeTab === "Bookings" ? (
            <BookingTable
              showCheckboxes={false}
              showPagination={true}
              showExportButton={false}
              headerText=""
            />
          ) : (
            <ReviewTable
              showCheckboxes={false}
              showPagination={true}
              headerText=""
            />
          )}
        </div>
      </div> */}

      <Modal
        isOpen={isSuspendModalOpen}
        onClose={closeSuspendModal}
        title="Suspension"
        icon={<PiWarningOctagonFill className="h-8 w-8 text-[#5243FE]" />}
        iconBgColor="#E3E0FF"
        message1="Suspending Account?"
        message="Are you sure you want to suspend this account?"
        cancelText="No, I don't"
        confirmText="Yes, suspend"
        confirmButtonColor="#5243FE"
        onConfirm={handleSuspend}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Deletion"
        icon={<FaTrash className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Deleting Account?"
        message="Are you sure you want to delete this account?"
        cancelText="No, I don't"
        confirmText="Yes, delete"
        confirmButtonColor="#EF4444"
        onConfirm={handleDelete}
      />
      <Modal
        isOpen={isActivateModalOpen}
        onClose={closeActivateModal}
        title="Activation"
        icon={<FaUser className="h-8 w-8 text-[#00A424]" />}
        iconBgColor="#D6FCE0"
        message1="Activating Account?"
        message="Are you sure you want to activate this account?"
        cancelText="No, I don't"
        confirmText="Yes, activate"
        confirmButtonColor="#00A424"
        onConfirm={handleActivate}
      />
    </div>
  );
}
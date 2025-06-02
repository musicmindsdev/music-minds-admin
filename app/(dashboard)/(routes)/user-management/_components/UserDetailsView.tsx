import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  bookingsData, reviewData } from "@/lib/mockData";
import BookingTable from "../../dashboard/_components/BookingTable";
import ReviewTable from "../../content-management/_components/ReviewTable";
import { IoIosArrowBack } from "react-icons/io";
import { IoBanOutline } from "react-icons/io5";
import Calendar from "@/components/svg icons/Calendar";
import { useState } from "react";
import Modal from "@/components/Modal";
import { PiWarningOctagonFill } from "react-icons/pi";
import { CheckCircle, UserRoundX } from "lucide-react";
import { FaTrash, FaUser } from "react-icons/fa";

interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  status: "Active" | "Suspended" | "Deactivated";
  verified: boolean;
  lastLogin: string;
  image: string;
}


interface UserDetailsViewProps {
  user: User | null;
  onClose: () => void;
}

export default function UserDetailsView({ user, onClose }: UserDetailsViewProps) {
    const [activeTab, setActiveTab] = useState("Bookings");
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    
  if (!user) return null;

  // Filter bookings and reviews for the selected user
  const userBookings = bookingsData.filter(
    (booking) => booking.clientName === user.name && booking.clientEmail === user.email
  );

  const userReviews = reviewData.filter(
    (review) => review.reviewer.name === user.name && review.reviewer.email === user.email
  );

  // Calculate dynamic metrics
  const totalBookings = userBookings.length;
  const totalSpent = userBookings.reduce((sum, booking) => {
    const amount = parseFloat(booking.totalAmount.replace("$", ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const totalReviews = userReviews.length;

  // State for tab toggling
 

  const handleDelete = () => {
    console.log("Deleting users:", selectedUsers);
    setSelectedUsers([]);
    setIsDeleteModalOpen(false);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSuspend = () => {
    console.log("Suspending users:", selectedUsers);
    setSelectedUsers([]);
    setIsSuspendModalOpen(false);
  };

  const openSuspendModal = () => {
    setIsSuspendModalOpen(true);
  };

  const closeSuspendModal = () => {
    setIsSuspendModalOpen(false);
  };

  const handleActivate = () => {
    console.log("Activating users:", selectedUsers);
    setSelectedUsers([]);
    setIsActivateModalOpen(false);
  };

  const openActivateModal = () => {
    setIsActivateModalOpen(true);
  };

  const closeActivateModal = () => {
    setIsActivateModalOpen(false);
  };

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
                <CheckCircle className="h-4 w-4 " />
                Activate
              </Button>
          <Button variant="outline" size="sm" onClick={openDeleteModal} className="text-red-600">
                <UserRoundX className="h-4 w-4  text-red-600" />
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
          <div className="">
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
                  <p className="font-medium">126,980</p>
                </div>
                <div>
                  <p className="text-xs">Total Following</p>
                  <p className="font-medium">1,589</p>
                </div>
                <div>
                  <p className="text-xs">Date Joined</p>
                  <p className="font-medium">Jan 15, 2024</p>
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
                    <span className="h-2 w-2 rounded-full bg-green-500" />
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
                <p className="flex">
                  <Calendar /> Total Bookings
                </p>
                <p className="font-medium">{totalBookings}</p>
              </div>
              <div>
                <p className="flex">
                  <Calendar /> Total Spent
                </p>
                <p className="font-medium">{totalSpent}</p>
              </div>
              <div>
                <p className="flex">
                  <Calendar /> Total Reviews
                </p>
                <p className="font-medium">{totalReviews}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="flex space-x-2 border border-b-0 mb-0 px-2 pt-2 rounded-t-lg bg-card">
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
      </div>
      <div className="rounded-none mt-0">
        <div className="p-6  shadow bg-card ">
          {activeTab === "Bookings" ? (
            <BookingTable
              bookings={userBookings}
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
      </div>
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
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
import { Bell, UserPlus, Settings, LogOut, ChevronRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SearchInput } from "./search-input";
import { ModeToggle } from "./modetoggle";
import { usersData, bookingsData, transactionsData } from "@/lib/mockData";
import InviteAdminModal from "./invite-admin-modal";

interface NavbarRoutesProps {
  users: typeof usersData;
  bookings: typeof bookingsData;
  transactions: typeof transactionsData;
}

export const NavbarRoutes = ({ users, bookings, transactions }: NavbarRoutesProps) => {
  const router = useRouter();
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isInviteAdminModalOpen, setIsInviteAdminModalOpen] = useState(false);

  // Mock user data to be replaced with actual API data later
  const user = {
    name: "Admin User",
    email: "admin@musicminds.com",
    role: "Administrator",
    lastLogin: "Apr 19, 2025 • 09:00 AM",
    image: userImage || "https://github.com/shadcn.png",
  };

  // Handlers for dropdown menu actions
  const handleSettings = () => {
    router.push("/settings");
  };

  const handleInviteAdmin = () => {
    setIsInviteAdminModalOpen(true); // Open the modal instead of navigating
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-end gap-6 w-full p-4">
      <div className="hidden md:block max-w-md ">
        <SearchInput users={usersData} bookings={bookingsData} transactions={transactionsData} />
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <DropdownMenu>   
          <DropdownMenuTrigger asChild>    
            <Button variant="ghost" size="icon">         
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent><Eye/></DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <MdKeyboardArrowDown className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {/* Header Section - Now Clickable */}
            <DropdownMenuItem onClick={handleSettings} className="p-0">
              <div className="flex items-center gap-3 p-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </div>
            </DropdownMenuItem>

            {/* Role and Last Login Section */}
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm">{user.role}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500">Last Login</p>
              <p className="text-sm">{user.lastLogin}</p>
            </div>

            <DropdownMenuSeparator />

            {/* Menu Items */}
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

            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
              <LogOut className="h-4 w-4 text-red-600" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Render the Invite Admin Modal */}
        <InviteAdminModal
          isOpen={isInviteAdminModalOpen}
          onClose={() => setIsInviteAdminModalOpen(false)}        />
      </div>
    </div>
  );
};
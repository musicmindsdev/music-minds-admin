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
import { usersData, bookingsData, transactionsData, supportData } from "@/lib/mockData";
import InviteAdminModal from "./invite-admin-modal";
import Modal from "./Modal";
import { RiAlertFill } from "react-icons/ri";
import NotificationsDropdown from "./notificationsDropdown";

interface NavbarRoutesProps {
  users: typeof usersData;
  bookings: typeof bookingsData;
  transactions: typeof transactionsData;
  supports: typeof supportData;
}

export const NavbarRoutes = ({
  supports,
}: NavbarRoutesProps) => {
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

  // Load user data from localStorage after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  // Sync user state with local storage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, [user, isMounted]);

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

  // Don't render anything until component is mounted (client-side)
  if (!isMounted) {
    return (
      <div className="flex items-center justify-end gap-6 w-full p-4">
        <div className="hidden md:block max-w-md">
          {/* Placeholder for search input */}
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          {/* Placeholder for mode toggle */}
          <div className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
          {/* Placeholder for notifications */}
          <div className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
          {/* Placeholder for user avatar */}
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-6 w-full p-4">
      <div className="hidden md:block max-w-md">
        <SearchInput
          users={usersData}
          bookings={bookingsData}
          transactions={transactionsData}
          supports={supports}
        />
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <NotificationsDropdown />

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
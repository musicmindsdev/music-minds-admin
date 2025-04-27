"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SearchInput } from "./search-input";
import { ModeToggle } from "./modetoggle";

export const NavbarRoutes = () => {
  const router = useRouter();
  const [userImage, setUserImage] = useState<string | null>(null); // Placeholder for admin image URL

  // Mock user data to be replaced with actual API data later
  const user = {
    name: "Admin",
    image: userImage || "https://github.com/shadcn.png", // Default image if userImage is null
  };

  // Handlers for dropdown menu actions
  const handleProfile = () => {
    router.push("/profile");
  };

  const handleInviteAdmin = () => {
    router.push("/invite-admin");
  };

  const handleSignOut = () => {
    // Clear any auth tokens (e.g., from localStorage)
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-end gap-6 w-full p-4">
      <div className="hidden md:block max-w-md">
        <SearchInput />
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <MdKeyboardArrowDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleProfile}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleInviteAdmin}>
              Invite Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
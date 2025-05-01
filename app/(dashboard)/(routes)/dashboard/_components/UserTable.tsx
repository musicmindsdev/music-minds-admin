"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Search, Calendar, CircleSlash, CheckCircle, Eye, UserRoundX, EllipsisVertical } from "lucide-react";
import { MdVerified } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersData } from "@/lib/mockData";

// Helper function to parse date string "dd/mm/yy • hh:mm AM/PM" to Date object
const parseUserDate = (dateString: any) => {
  const [datePart, timePart] = dateString.split(" • ");
  const [day, month, year] = datePart.split("/").map(Number);
  let [hours, minutes, period] = timePart.split(/[: ]/);
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return new Date(2000 + year, month - 1, day, hours, minutes);
};

export default function UserTable() {
  const [statusFilter, setStatusFilter] = useState({
    Active: false,
    Suspended: false,
    Deactivated: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [profileTypeFilter, setProfileTypeFilter] = useState("all");
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");

  // Filter the users based on the selected filters, including search query
  const filteredUsers = usersData.filter((user) => {
    // Search query match (case-insensitive)
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" || // If searchQuery is empty, match all users
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query);

    // Status filter match
    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[user.status as keyof typeof statusFilter];

    // Profile type filter match
    const profileTypeMatch =
      profileTypeFilter === "all" || user.profileType === profileTypeFilter;

    // Date range filter match
    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const userDate = parseUserDate(user.lastLogin);
      const fromDate = dateRangeFrom
        ? parseUserDate(dateRangeFrom + " • 12:00 AM")
        : null;
      const toDate = dateRangeTo
        ? parseUserDate(dateRangeTo + " • 11:59 PM")
        : null;
      if (fromDate && userDate < fromDate) dateMatch = false;
      if (toDate && userDate > toDate) dateMatch = false;
    }

    // Verification filter match
    const verificationMatch =
      verificationFilter === "all" ||
      (verificationFilter === "Verified" && user.verified) ||
      (verificationFilter === "Not Verified" && !user.verified);

    // User must match all filter conditions
    return searchMatch && statusMatch && profileTypeMatch && dateMatch && verificationMatch;
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="font-light text-sm">USER MANAGEMENT</p>
        <Button variant="link" className="text-blue-600 hover:text-blue-800">
          View all Users
        </Button>
      </div>
      <div className="relative mt-4 flex items-center">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for user by Name, Email or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 p-2 border rounded-lg w-full bg-background"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2">
              <Filter className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-94 p-4 shadow-lg border border-gray-200 rounded-lg"
          >
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Status Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Active ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Active: !prev.Active,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Suspended ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Suspended: !prev.Suspended,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Suspended
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Deactivated ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Deactivated: !prev.Deactivated,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-gray-500" />
                  Deactivated
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            {/* Profile Type Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Type</p>
              <Select onValueChange={setProfileTypeFilter} value={profileTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Musician">Musician</SelectItem>
                  <SelectItem value="Professional Studio">Professional Studio</SelectItem>
                  <SelectItem value="Talent Agency">Talent Agency</SelectItem>
                  <SelectItem value="Music Business Coa...">
                    Music Business Coa...
                  </SelectItem>
                  <SelectItem value="Producer">Producer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenuSeparator />
            {/* Date Range Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Date Range</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="dd/mm/yy"
                    value={dateRangeFrom}
                    onChange={(e) => setDateRangeFrom(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="dd/mm/yy"
                    value={dateRangeTo}
                    onChange={(e) => setDateRangeTo(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            {/* Verification Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Verification</p>
              <Select onValueChange={setVerificationFilter} value={verificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Not Verified">Not Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Profile Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Avatar>
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.profileType}</TableCell>
              <TableCell>
                <span
                  className={`flex items-center justify-center gap-1 rounded-full ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : user.status === "Suspended"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.status === "Active"
                        ? "bg-green-500"
                        : user.status === "Suspended"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  />
                  {user.status}
                </span>
              </TableCell>
              <TableCell>
                {user.verified ? (
                  <span className="text-blue-600 flex gap-2">
                    Verified <MdVerified />
                  </span>
                ) : (
                  "Not Verified"
                )}
              </TableCell>
              <TableCell>{user.lastLogin}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><EllipsisVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem>
                      <CircleSlash className="h-4 w-4 mr-2" />
                      Suspend User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem className="text-red-600">
                      <UserRoundX className="h-4 w-4 mr-2 text-red-600" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname, useRouter } from "next/navigation";
import { usersData } from "@/lib/mockData";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import Modal from "@/components/Modal";
import { FaTrash } from "react-icons/fa";
import { PiWarningOctagonFill } from "react-icons/pi";
import { FaUser } from "react-icons/fa6";
import ExportModal from "@/components/ExportModal";

const parseUserDate = (dateString: string): Date => {
  const [datePart, timePart] = dateString.split(" • ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hoursStr, minutesStr, period] = timePart.split(/[: ]/);
  let hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return new Date(2000 + year, month - 1, day, hours, minutes);
};

interface UserTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  showExportButton?: boolean;
  onExport?: () => void;
  headerText?: string;
}

export default function UserTable({
  showCheckboxes = false,
  showPagination = false,
  showExportButton = false,
  headerText = "USER MANAGEMENT",
}: UserTableProps) {
  const [statusFilter, setStatusFilter] = useState({
    Active: false,
    Suspended: false,
    Deactivated: false,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileTypeFilter, setProfileTypeFilter] = useState("all");
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const pathname = usePathname();
  const router = useRouter();

  const filteredUsers = usersData.filter((user) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query);

    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[user.status as keyof typeof statusFilter];

    const profileTypeMatch =
      profileTypeFilter === "all" || user.profileType === profileTypeFilter;

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

    const verificationMatch =
      verificationFilter === "all" ||
      (verificationFilter === "Verified" && user.verified) ||
      (verificationFilter === "Not Verified" && !user.verified);

    return searchMatch && statusMatch && profileTypeMatch && dateMatch && verificationMatch;
  });

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewAll = () => {
    if (pathname !== "/user-management") {
      router.push("/user-management");
    }
  };

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

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    roleFilter: string;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    console.log("Exporting user data:", data);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="font-light text-sm">{headerText}</p>
        <div className="flex space-x-2">
          {pathname !== "/user-management" && (
            <Button variant="link" className="text-blue-600 hover:text-blue-800" onClick={handleViewAll}>
              View all Users
            </Button>
          )}
          {showExportButton && (
            <Button className="text-white flex items-center space-x-2" onClick={() => setIsExportModalOpen(true)}>
              <CiExport className="mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
          )}
        </div>
      </div>
      <div className="relative mt-4 flex items-center pb-2">
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
            <div className="space-y-2">
              <p className="text-sm font-medium">User Role</p>
              <Select onValueChange={setProfileTypeFilter} value={profileTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Musician">Musician</SelectItem>
                  <SelectItem value="Professional Studio">Professional Studio</SelectItem>
                  <SelectItem value="Talent Agency">Talent Agency</SelectItem>
                  <SelectItem value="Music Business Coa...">Music Business Coa...</SelectItem>
                  <SelectItem value="Producer">Producer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Activity</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="mm/dd/yyyy"
                    value={dateRangeFrom}
                    onChange={(e) => setDateRangeFrom(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="mm/dd/yyyy"
                    value={dateRangeTo}
                    onChange={(e) => setDateRangeTo(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
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
      {selectedUsers.length > 0 && (
        <div className="flex justify-end space-x-2 mt-2 p-4">
          <Button variant="outline" size="sm" onClick={openDeleteModal} className="text-red-600">
            <UserRoundX className="h-4 w-4 mr-2 text-red-600" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={openActivateModal}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Activate
          </Button>
          <Button variant="outline" size="sm" onClick={openSuspendModal}>
            <CircleSlash className="h-4 w-4 mr-2" />
            Suspend
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>User Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id}>
              {showCheckboxes && (
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </TableCell>
              )}
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
                  "Unverified"
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openSuspendModal}>
                      <CircleSlash className="h-4 w-4 mr-2" />
                      Suspend User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openActivateModal}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={openDeleteModal}>
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
      {showPagination && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <IoIosArrowBack />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <IoIosArrowForward />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm">
              Showing {startIndex + 1} - {Math.min(startIndex + usersPerPage, totalUsers)} of {totalUsers}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm">Go to page</p>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-16"
              />
              <Button
                className="text-white"
                size="sm"
                onClick={() => goToPage(currentPage)}
              >
                Go
              </Button>
            </div>
          </div>
        </div>
      )}
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
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "Active", value: "Active" },
          { label: "Suspended", value: "Suspended" },
          { label: "Deactivated", value: "Deactivated" },
        ]}
        roleFilters={[
          { label: "Service Provider", value: "Service Provider" },
          { label: "Client", value: "Client" },
        ]}
        fieldOptions={[
          { label: "User ID", value: "User ID" },
          { label: "Name", value: "Name" },
          { label: "Email", value: "Email" },
          { label: "User Role", value: "User Role" },
          { label: "Status", value: "Status" },
          { label: "Last Activity", value: "Last Activity" },
        ]}
        onExport={handleExport}
      />
    </>
  );
}
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
import { Filter, Search, Calendar, EllipsisVertical, Eye, XCircle, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { kycData } from "@/lib/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import KYCDetailsModal from "./KycDetailsModal";
import Rectangle from "@/public/Rectangle 22482.png"

// Helper function to parse date string "MMM DD, YYYY" to Date object
const parseDate = (dateString: string): Date => {
  const [month, day, year] = dateString.split(/[\s,]+/);
  const monthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].indexOf(month);
  return new Date(parseInt(year), monthIndex, parseInt(day));
};

interface KYCTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
}

export default function KYCTable({
  showCheckboxes = false,
  showPagination = false,
}: KYCTableProps) {
  const [statusFilter, setStatusFilter] = useState({
    Approved: false,
    Submitted: false,
    Declined: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKYC, setSelectedKYC] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const kycPerPage = 10;
  const [selectedKYCId, setSelectedKYCId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const filteredKYC = kycData.filter((kyc) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      kyc.id.toLowerCase().includes(query) ||
      kyc.name.toLowerCase().includes(query) ||
      kyc.email.toLowerCase().includes(query);

    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[kyc.kycStatus as keyof typeof statusFilter];

    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const kycDate = parseDate(kyc.submittedDate);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate && kycDate < fromDate) dateMatch = false;
      if (toDate && kycDate > toDate) dateMatch = false;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const totalKYC = filteredKYC.length;
  const totalPages = Math.ceil(totalKYC / kycPerPage);
  const startIndex = (currentPage - 1) * kycPerPage;
  const paginatedKYC = filteredKYC.slice(startIndex, startIndex + kycPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKYC(paginatedKYC.map((kyc) => kyc.id));
    } else {
      setSelectedKYC([]);
    }
  };

  const handleSelectKYC = (kycId: string, checked: boolean) => {
    if (checked) {
      setSelectedKYC((prev) => [...prev, kycId]);
    } else {
      setSelectedKYC((prev) => prev.filter((id) => id !== kycId));
    }
  };

  useEffect(() => {
    setSelectedKYC([]);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (kycId: string) => {
    setSelectedKYCId(kycId);
  };

  const handleApprove = async (kycId: string) => {
    try {
      // Simulate API call to approve KYC (uncomment when backend is ready)
      /*
      await fetch(`/api/kyc/${kycId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      */
      // setKYCData((prev) =>
      //   prev.map((kyc) =>
      //     kyc.id === kycId ? { ...kyc, kycStatus: "Approved" } : kyc
      //   )
      // );
      console.log(kycId);
    } catch (err) {
      console.error("Failed to approve KYC:", err);
    }
  };

  const handleDecline = async (kycId: string) => {
    try {
      // Simulate API call to decline KYC (uncomment when backend is ready)
      /*
      await fetch(`/api/kyc/${kycId}/decline`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      */
      // setKYCData((prev) =>
      //   prev.map((kyc) =>
      //     kyc.id === kycId ? { ...kyc, kycStatus: "Declined" } : kyc
      //   )
      // );
      console.log(kycId);
    } catch (err) {
      console.error("Failed to decline KYC:", err);
    }
  };

  const handlePreview = () => {
    setIsPreviewModalOpen(true);
    setSelectedKYCId(null); 
  };

  // Mock function to update kycData (replace with actual state management or context)
  // const setKYCData = (newData: typeof kycData) => {
  //   This would typically update a global state or context
  //   console.log("KYC Data updated:", newData);
  // };

  return (
    <>
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
              <p className="text-sm font-medium">KYC Status</p>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Approved ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Approved: !prev.Approved,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Approved
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Submitted ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Submitted: !prev.Submitted,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Submitted
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Declined ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Declined: !prev.Declined,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Declined
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Submitted Date</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={dateRangeFrom}
                    onChange={(e) => setDateRangeFrom(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={dateRangeTo}
                    onChange={(e) => setDateRangeTo(e.target.value)}
                    className="pl-8"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {selectedKYC.length > 0 && (
        <div className="flex justify-end space-x-2 mt-2 p-4">
          <Button variant="outline" size="sm" className="text-green-600" disabled>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Approve
          </Button>
          <Button variant="outline" size="sm" className="text-red-600" disabled>
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            Reject
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedKYC.length === paginatedKYC.length && paginatedKYC.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>KYC Status</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedKYC.map((kyc) => (
            <TableRow key={kyc.id}>
              {showCheckboxes && (
                <TableCell>
                  <Checkbox
                    checked={selectedKYC.includes(kyc.id)}
                    onCheckedChange={(checked) => handleSelectKYC(kyc.id, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell>{kyc.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt={kyc.name} />
                    <AvatarFallback>{kyc.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {kyc.name}
                </div>
              </TableCell>
              <TableCell>{kyc.email}</TableCell>
              <TableCell>
                <span
                  className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 ${
                    kyc.kycStatus === "Approved"
                      ? "bg-green-100 text-green-600"
                      : kyc.kycStatus === "Submitted"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      kyc.kycStatus === "Approved"
                        ? "bg-green-500"
                        : kyc.kycStatus === "Submitted"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  {kyc.kycStatus}
                </span>
              </TableCell>
              <TableCell>{kyc.submittedDate}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><EllipsisVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(kyc.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
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
              Showing {startIndex + 1} - {Math.min(startIndex + kycPerPage, totalKYC)} of {totalKYC}
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
              <Button className="text-white" size="sm" onClick={() => goToPage(currentPage)}>
                Go
              </Button>
            </div>
          </div>
        </div>
      )}
      <KYCDetailsModal
        isOpen={!!selectedKYCId}
        onClose={() => setSelectedKYCId(null)}
        kycId={selectedKYCId}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onPreview={handlePreview}
        kycData={kycData} // Updated to use full kycData instead of paginatedKYC for modal
      />
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
      <DialogOverlay className="backdrop-blur-xs" />
        <DialogContent className="sm:max-w-[500px] rounded-tl-lg rounded-tr-lg shadow-lg border">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-medium">File Preview</DialogTitle>
           
            </div>
            <p className="text-sm text-gray-500 mt-2">certificate.jpg</p>
          </DialogHeader>
          <div className="flex justify-center p-6">
            <Image
              src={Rectangle}
              alt="Certificate Preview"
              width={400}
              height={400}
              className="rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
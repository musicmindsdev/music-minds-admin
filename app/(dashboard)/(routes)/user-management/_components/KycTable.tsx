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
import { Filter, Search, Calendar, EllipsisVertical, XCircle, CheckCircle } from "lucide-react";
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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import KYCDetailsModal from "./KycDetailsModal";
import Rectangle from "@/public/Rectangle 22482.png";
import { FaRegCircleCheck } from "react-icons/fa6";
import { GoCircleSlash } from "react-icons/go";
import { PiEye } from "react-icons/pi";
import Modal from "@/components/Modal";
import Slash from "@/components/svg icons/slash";
import Tick from "@/components/svg icons/tick";

interface KYC {
  id: string;
  name: string;
  email: string;
  role: string;
  studioName?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  kycStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedDate: string;
  type: "PERSONAL" | "BUSINESS";
}

interface KYCTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  onActionComplete?: () => void; // New prop to refresh data
}

export default function KYCTable({
  showCheckboxes = false,
  showPagination = true,
  onActionComplete,
}: KYCTableProps) {
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState({
    PENDING: false,
    UNDER_REVIEW: false,
    APPROVED: false,
    REJECTED: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKYC, setSelectedKYC] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [kycData, setKycData] = useState<KYC[]>([]);
  const [totalKYC, setTotalKYC] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKYCId, setSelectedKYCId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const kycPerPage = 10;

  // Fetch KYC submissions from API
  const fetchKYC = async () => {
    try {
      setLoading(true);
      setError(null);

      const status = Object.keys(statusFilter)
        .filter((key) => statusFilter[key as keyof typeof statusFilter])
        .join(",");
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: kycPerPage.toString(),
        ...(status && { status }),
        ...(searchQuery && { searchQuery }), // Note: Not supported by API; confirm with backend
        ...(dateRangeFrom && { fromDate: dateRangeFrom }), // Note: Not supported by API
        ...(dateRangeTo && { toDate: dateRangeTo }), // Note: Not supported by API
      }).toString();

      const response = await fetch(`/api/kyc?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch KYC submissions (Status: ${response.status})`
        );
      }

      const { data, meta } = await response.json();
      setKycData(
        Array.isArray(data)
          ? data.map((kyc: any) => ({
              id: kyc.id,
              name: kyc.user.username || "Unknown",
              email: kyc.user.email || "N/A",
              role: kyc.user.role || "User",
              studioName: kyc.studioName || undefined,
              website: kyc.website || undefined,
              phone: kyc.phone || undefined,
              address: kyc.address || undefined,
              city: kyc.city || undefined,
              province: kyc.province || undefined,
              kycStatus: kyc.status || "PENDING",
              submittedDate: kyc.createdAt || new Date().toISOString(),
              type: kyc.type || "PERSONAL",
            }))
          : []
      );
      setTotalKYC(meta?.total || data?.length || 0);
      setTotalPages(meta?.last_page || Math.ceil((meta?.total || data?.length || 0) / kycPerPage));
    } catch (err) {
      console.error("Error fetching KYC:", err);
      setError(
        err instanceof Error
          ? `${err.message}${err.message.includes("Status: 500") ? " - This may be due to a server issue. Please try again later or contact support." : ""}`
          : "An error occurred while fetching KYC submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, [currentPage, statusFilter, dateRangeFrom, dateRangeTo, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKYC(kycData.map((kyc) => kyc.id));
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

  const handleApprove = async (kycId: string) => {
    try {
      const response = await fetch(`/api/kyc/${kycId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to approve KYC");
      }

      toast.success("KYC approved successfully");
      fetchKYC();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to approve KYC:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while approving KYC");
    }
  };

  const handleDecline = async (kycId: string) => {
    try {
      const response = await fetch(`/api/kyc/${kycId}/decline`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to decline KYC");
      }

      toast.success("KYC declined successfully");
      fetchKYC();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to decline KYC:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while declining KYC");
    }
  };

  const handleViewDetails = (kycId: string) => {
    setSelectedKYCId(kycId);
  };

  const handleDeclineModal = () => {
    if (selectedKYCId) {
      handleDecline(selectedKYCId);
      setIsDeclineModalOpen(false);
      setSelectedKYCId(null);
    }
  };

  const openDeclineModal = () => {
    setIsDeclineModalOpen(true);
  };

  const closeDeclineModal = () => {
    setIsDeclineModalOpen(false);
  };

  const handleApproveModal = () => {
    if (selectedKYCId) {
      handleApprove(selectedKYCId);
      setIsApproveModalOpen(false);
      setSelectedKYCId(null);
    }
  };

  const openApproveModal = () => {
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
  };

  const handlePreview = () => {
    setIsPreviewModalOpen(true);
    setSelectedKYCId(null);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchKYC}>
          Retry
        </Button>
      </div>
    );
  }

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
              <div className="flex space-x-2 flex-wrap">
                {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      statusFilter[status as keyof typeof statusFilter] ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setStatusFilter((prev) => ({
                        ...prev,
                        [status]: !prev[status as keyof typeof statusFilter],
                      }))
                    }
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "APPROVED"
                          ? "bg-green-500"
                          : status === "PENDING" || status === "UNDER_REVIEW"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {status}
                  </Button>
                ))}
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
          <Button
            variant="outline"
            size="sm"
            className="text-green-600"
            onClick={() => selectedKYC.forEach((id) => handleApprove(id))}
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => selectedKYC.forEach((id) => handleDecline(id))}
          >
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
                  checked={selectedKYC.length === kycData.length && kycData.length > 0}
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
          {kycData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCheckboxes ? 6 : 5} className="text-center">
                No KYC submissions available
              </TableCell>
            </TableRow>
          ) : (
            kycData.map((kyc) => (
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
                      kyc.kycStatus === "APPROVED"
                        ? "bg-green-100 text-green-600"
                        : kyc.kycStatus === "PENDING" || kyc.kycStatus === "UNDER_REVIEW"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        kyc.kycStatus === "APPROVED"
                          ? "bg-green-500"
                          : kyc.kycStatus === "PENDING" || kyc.kycStatus === "UNDER_REVIEW"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    {kyc.kycStatus}
                  </span>
                </TableCell>
                <TableCell>{new Date(kyc.submittedDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost"><EllipsisVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(kyc.id)}>
                        <PiEye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {kyc.kycStatus === "PENDING" || kyc.kycStatus === "UNDER_REVIEW" ? (
                        <>
                          <DropdownMenuItem onClick={openApproveModal}>
                            <FaRegCircleCheck className="h-4 w-4 mr-2" />
                            Approve KYC
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={openDeclineModal} className="text-red-600">
                            <GoCircleSlash className="h-4 w-4 mr-2 text-red-600" />
                            Decline KYC
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
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
              Showing {Math.min((currentPage - 1) * kycPerPage + 1, totalKYC)} -{" "}
              {Math.min(currentPage * kycPerPage, totalKYC)} of {totalKYC}
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
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={closeDeclineModal}
        title="Decline KYC"
        icon={<Slash className="" />}
        iconBgColor="#FEE2E2"
        message1="Declining KYC?"
        message="Are you sure you want to decline this user's KYC?"
        cancelText="No, I don't"
        confirmText="Yes, decline"
        confirmButtonColor="#EF4444"
        onConfirm={handleDeclineModal}
      />
      <Modal
        isOpen={isApproveModalOpen}
        onClose={closeApproveModal}
        title="Approve KYC"
        icon={<Tick className="" />}
        iconBgColor="#D6FCE0"
        message1="Approving KYC?"
        message="Are you sure you want to approve this user's KYC?"
        cancelText="No, I don't"
        confirmText="Yes, approve"
        confirmButtonColor="#00A424"
        onConfirm={handleApproveModal}
      />
      <KYCDetailsModal
        isOpen={!!selectedKYCId}
        onClose={() => setSelectedKYCId(null)}
        kycId={selectedKYCId}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onPreview={handlePreview}
        kycData={kycData}
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
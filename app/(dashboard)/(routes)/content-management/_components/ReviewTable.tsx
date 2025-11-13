"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Search, Calendar, EllipsisVertical, Eye, CheckCircle, XCircle, Star, Trash } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReviewDetailsModal from "./ReviewDetailsModal";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import Pending from "@/public/pending.png";
import Image from "next/image";

// Raw API response type
export interface ApiReview {
  id: string;
  userName?: string;
  email?: string;
  serviceOffered?: string;
  rating?: number;
  reviewText?: string;
  date?: string;
  status?: string;
  flagged?: string;
  reviewer?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export interface Reviewer {
  name: string;
  email: string;
  role: string;
}

export interface Review {
  id: string;
  userName: string;
  email: string;
  serviceOffered: string;
  rating: number;
  reviewText: string;
  date: string;
  status: string;
  flagged: string;
  reviewer: Reviewer;
}

interface ReviewTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
  onExportData?: (reviews: Review[]) => void; 
  onFetchAllData?: (dateRangeFrom: string, dateRangeTo: string) => Promise<Review[]>;
}

export default function ReviewTable({
  showCheckboxes = false,
  showPagination = true,
  onExportData,
}: ReviewTableProps) {
  const [flaggedFilter, setFlaggedFilter] = useState({ Yes: false, No: false });
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reviewsPerPage = 10;

  // ✅ Strongly typed + wrapped in useCallback
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: reviewsPerPage.toString(),
        ...(searchQuery && { searchQuery }),
        ...(ratingMin && { minRating: ratingMin }),
        ...(ratingMax && { maxRating: ratingMax }),
        ...(dateRangeFrom && { fromDate: dateRangeFrom }),
        ...(dateRangeTo && { toDate: dateRangeTo }),
        ...(flaggedFilter.Yes && !flaggedFilter.No && { flagged: "Yes" }),
        ...(flaggedFilter.No && !flaggedFilter.Yes && { flagged: "No" }),
        ...(serviceTypeFilter !== "all" && { serviceOffered: serviceTypeFilter }),
      }).toString();

      const response = await fetch(`/api/reviews?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to fetch reviews (Status: ${response.status})`
        );
      }

      const { reviews: apiReviews, total, pages } = await response.json();

      const mappedReviews: Review[] = Array.isArray(apiReviews)
        ? apiReviews.map((review: ApiReview) => ({
            id: review.id,
            userName: review.userName || "Unknown",
            email: review.email || "",
            serviceOffered: review.serviceOffered || "Unknown",
            rating: review.rating ?? 0,
            reviewText: review.reviewText || "",
            date: review.date || new Date().toISOString(),
            status: review.status || "Pending",
            flagged: review.flagged || "No",
            reviewer: {
              name: review.reviewer?.name || "Unknown",
              email: review.reviewer?.email || "",
              role: review.reviewer?.role || "User",
            },
          }))
        : [];

      setReviews(mappedReviews);
      setTotalReviews(total || mappedReviews.length);
      setTotalPages(pages || Math.ceil((total || mappedReviews.length) / reviewsPerPage));
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(
        err instanceof Error
          ? `${err.message}${
              err.message.includes("Status: 500")
                ? " - This may be due to a server issue. Please try again later or contact support."
                : ""
            }`
          : "An error occurred while fetching reviews"
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    flaggedFilter,
    serviceTypeFilter,
    ratingMin,
    ratingMax,
    dateRangeFrom,
    dateRangeTo,
    searchQuery,
  ]);
  
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (onExportData) {
      onExportData(reviews);
    }
  }, [reviews, onExportData]);

  // Get unique service types from reviews
  const serviceTypes = [...new Set(reviews.map((review) => review.serviceOffered))];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((review) => review.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, reviewId]);
    } else {
      setSelectedReviews((prev) => prev.filter((id) => id !== reviewId));
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete review");
      }

      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while deleting the review");
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  // Loading state - using your custom Loading component
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchReviews}>
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
          placeholder="Search for review by ID, Provider Name, or Text"
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
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Flagged</p>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      flaggedFilter.Yes ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setFlaggedFilter((prev) => ({
                        ...prev,
                        Yes: !prev.Yes,
                        No: prev.Yes ? prev.No : false,
                      }))
                    }
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Yes
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      flaggedFilter.No ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setFlaggedFilter((prev) => ({
                        ...prev,
                        No: !prev.No,
                        Yes: prev.No ? prev.Yes : false,
                      }))
                    }
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    No
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Service Type</p>
                <Select
                  value={serviceTypeFilter}
                  onValueChange={setServiceTypeFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Rating Range</p>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Min"
                    value={ratingMin}
                    onChange={(e) => setRatingMin(e.target.value)}
                    className="w-1/2"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="Max"
                    value={ratingMax}
                    onChange={(e) => setRatingMax(e.target.value)}
                    className="w-1/2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Date Range</p>
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
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedReviews.length > 0 && (
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

      {/* Empty state - using the same pattern as admin table */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image src={Pending} alt="No reviews found" className="mx-auto mb-2" />
          <p>No reviews found.</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {showCheckboxes && (
                  <TableHead>
                    <Checkbox
                      checked={selectedReviews.length === reviews.length && reviews.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Review ID</TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Service Offered</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Flagged</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={(checked) => handleSelectReview(review.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{review.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="/placeholder-avatar.jpg" alt={review.userName} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {review.userName}
                    </div>
                  </TableCell>
                  <TableCell>{review.serviceOffered}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{review.rating.toFixed(1)}/5.0</span>
                      <Star className="h-4 w-4 text-[#0065FF] fill-[#0065FF]" />
                    </div>
                  </TableCell>
                  <TableCell>{truncateText(review.reviewText, 20)}</TableCell>
                  <TableCell>
                    <span
                      className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 ${
                        review.flagged === "Yes"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          review.flagged === "Yes" ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      {review.flagged}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(review.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost"><EllipsisVertical /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(review)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash className="h-4 w-4 mr-2 text-red-600" />
                          Delete
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
                  Showing {Math.min((currentPage - 1) * reviewsPerPage + 1, totalReviews)} -{" "}
                  {Math.min(currentPage * reviewsPerPage, totalReviews)} of {totalReviews}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm">Go to page</p>
                  <Input
                    type="number"
                    min="1"
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
        </>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-[35%] bg-card shadow-lg transform transition-transform duration-300 ease-in-out"
            style={{ transform: isModalOpen ? "translateX(0)" : "translateX(100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ReviewDetailsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              review={selectedReview}
            />
          </div>
        </div>
      )}
    </>
  );
}
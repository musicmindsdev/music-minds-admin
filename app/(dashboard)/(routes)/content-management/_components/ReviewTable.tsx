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
import { Filter, Search, Calendar, EllipsisVertical, Eye, CheckCircle, XCircle, Star } from "lucide-react";
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
import { reviewData } from "@/lib/mockData";

// Helper function to parse date string "DD/MM/YY - H:MM A.M./P.M." to Date object
const parseDate = (dateString: string): Date => {
  const [datePart, timePart] = dateString.split(" - ");
  const [day, month, year] = datePart.split("/");
  const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) throw new Error("Invalid time format");
  const [_, hour, minute, period] = match;
  let hours = parseInt(hour) % 12 + (period.toLowerCase().includes("p") ? 12 : 0);
  if (parseInt(hour) === 12 && period.toLowerCase().includes("a")) hours = 0;
  return new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day), hours, parseInt(minute));
};

interface ReviewTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
}

export default function ReviewTable({
  showCheckboxes = false,
  showPagination = false,
  headerText = "REVIEW MANAGEMENT",
}: ReviewTableProps) {
  const [statusFilter, setStatusFilter] = useState({
    Approved: false,
    Pending: false,
    Rejected: false,
  });
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const filteredReviews = reviewData.filter((review) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      review.id.toLowerCase().includes(query) ||
      review.userName.toLowerCase().includes(query) ||
      review.serviceOffered.toLowerCase().includes(query) ||
      (review.reviewText ?? "").toLowerCase().includes(query);

    const statusMatch =
      Object.values(statusFilter).every((val) => !val) ||
      statusFilter[review.status as keyof typeof statusFilter];

    let dateMatch = true;
    if (dateRangeFrom || dateRangeTo) {
      const reviewDate = parseDate(review.date);
      const fromDate = dateRangeFrom ? new Date(dateRangeFrom) : null;
      const toDate = dateRangeTo ? new Date(dateRangeTo) : null;
      if (fromDate && reviewDate < fromDate) dateMatch = false;
      if (toDate && reviewDate > toDate) dateMatch = false;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const totalReviews = filteredReviews.length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(paginatedReviews.map((review) => review.id));
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

  useEffect(() => {
    setSelectedReviews([]);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

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
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
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
                    statusFilter.Pending ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Pending: !prev.Pending,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </Button>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 rounded-full text-sm ${
                    statusFilter.Rejected ? "border border-gray-400 font-medium" : ""
                  }`}
                  onClick={() =>
                    setStatusFilter((prev) => ({
                      ...prev,
                      Rejected: !prev.Rejected,
                    }))
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Rejected
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Date</p>
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
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedReviews.length === paginatedReviews.length && paginatedReviews.length > 0}
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
          {paginatedReviews.map((review) => (
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
                  <span>{review.rating}/5.0</span>
                  <Star className={`h-4 w-4 text-[#0065FF] fill-[#0065FF]`} />
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
              <TableCell>{review.date}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><EllipsisVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log("View Details:", review.id)}>
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
              Showing {startIndex + 1} - {Math.min(startIndex + reviewsPerPage, totalReviews)} of {totalReviews}
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
    </>
  );
}
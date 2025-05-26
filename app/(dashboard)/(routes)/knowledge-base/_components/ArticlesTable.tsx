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
import { Search, EllipsisVertical, Filter, Calendar, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { articleData } from "@/lib/mockData";
import { CiBookmarkMinus } from "react-icons/ci";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { TbEdit } from "react-icons/tb";

// Helper function to parse date string "DD/MM/YY - H:MM A.M./P.M." to Date object
const parseDate = (dateString: string): Date => {
  if (dateString === "N/A") return new Date(0);
  const [datePart, timePart] = dateString.split(" - ");
  const [day, month, year] = datePart.split("/");
  const match = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) throw new Error("Invalid time format");
  const [, hour, minute, period] = match;
  let hours = parseInt(hour) % 12 + (period.toLowerCase().includes("p") ? 12 : 0);
  if (parseInt(hour) === 12 && period.toLowerCase().includes("a")) hours = 0;
  return new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day), hours, parseInt(minute));
};

interface ArticlesTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
}

export default function ArticlesTable({
  showCheckboxes = false,
  showPagination = false,
}: ArticlesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({
    status: { All: true, Draft: false, Published: false, Archived: false },
    dateRangeFrom: "",
    dateRangeTo: "",
  });
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  //removed setArticles to deploy on render must add back for backend integration
  const [articles, ] = useState(articleData);
  const articlesPerPage = 7;

  // Filter articles based on criteria
  const filteredArticles = articles.filter((article) => {
    const queryMatch =
      searchQuery === "" ||
      article.articleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch =
      filter.status.All ||
      (filter.status.Draft && article.status === "Draft") ||
      (filter.status.Published && article.status === "Published") ||
      (filter.status.Archived && article.status === "Archived");

    let dateMatch = true;
    if (filter.dateRangeFrom || filter.dateRangeTo) {
      const articleDate = parseDate(article.publishedDate);
      const fromDate = filter.dateRangeFrom ? new Date(filter.dateRangeFrom) : null;
      const toDate = filter.dateRangeTo ? new Date(filter.dateRangeTo) : null;
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        if (articleDate < fromDate) dateMatch = false;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        if (articleDate > toDate) dateMatch = false;
      }
    }

    return queryMatch && statusMatch && dateMatch;
  });

  const totalArticles = filteredArticles.length;
  const totalPages = Math.ceil(totalArticles / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(paginatedArticles.map((article) => article.articleId));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles((prev) => [...prev, articleId]);
    } else {
      setSelectedArticles((prev) => prev.filter((id) => id !== articleId));
    }
  };

  useEffect(() => {
    setSelectedArticles([]);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filter.status, filter.dateRangeFrom, filter.dateRangeTo, searchQuery]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-700";
      case "Archived": return "bg-blue-100 text-blue-700";
      case "Draft": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === "All") {
      setFilter((prev) => ({
        ...prev,
        status: { All: true, Draft: false, Published: false, Archived: false },
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        status: {
          All: false,
          Draft: status === "Draft" ? !prev.status.Draft : prev.status.Draft,
          Published: status === "Published" ? !prev.status.Published : prev.status.Published,
          Archived: status === "Archived" ? !prev.status.Archived : prev.status.Archived,
        },
      }));
    }
  };

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2 space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search for user by Name, Email or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 p-2 border rounded-lg w-full bg-[#F5F7FA] text-gray-700"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[#F5F7FA] text-gray-700">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-94 p-4 shadow-lg border border-gray-200 rounded-lg"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {["All", "Draft", "Published", "Archived"].map((status) => (
                    <Button
                      key={status}
                      variant={filter.status[status as keyof typeof filter.status] ? "default" : "outline"}
                      className={`flex items-center gap-1 rounded-md text-sm ${
                        filter.status[status as keyof typeof filter.status] ? "border border-gray-400 font-medium" : ""
                      }`}
                      onClick={() => handleStatusFilterChange(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Date Range</p>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={filter.dateRangeFrom}
                      onChange={(e) => setFilter((prev) => ({ ...prev, dateRangeFrom: e.target.value }))}
                      className="pl-8 w-full"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={filter.dateRangeTo}
                      onChange={(e) => setFilter((prev) => ({ ...prev, dateRangeTo: e.target.value }))}
                      className="pl-8 w-full"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead>
                <Checkbox
                  checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Article ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedArticles.map((article) => (
            <TableRow key={article.articleId}>
              {showCheckboxes && (
                <TableCell>
                  <Checkbox
                    checked={selectedArticles.includes(article.articleId)}
                    onCheckedChange={(checked) => handleSelectArticle(article.articleId, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell>{article.articleId}</TableCell>
              <TableCell>{truncateText(article.title, 20)}</TableCell>
              <TableCell>{article.category}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full ${getStatusColor(article.status)}`}>
                  {article.status}
                </span>
              </TableCell>
              <TableCell>{article.publishedDate}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt={article.createdBy} />
                    <AvatarFallback>{article.createdBy.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {truncateText(article.createdBy, 15)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><EllipsisVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log("Edit Article:", article.articleId)}>
                      <TbEdit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {article.status === "Published" && (
                      <>
                        <DropdownMenuItem onClick={() => console.log("Unpublish Article:", article.articleId)}>
                        <HiOutlineGlobeAlt className="h-4 w-4 mr-2"/>
                          Unpublish
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Archive Article:", article.articleId)}>
                        <CiBookmarkMinus className="h-4 w-4 mr-2"/>
                          Archive
                        </DropdownMenuItem>
                      </>
                    )}
                    {article.status === "Draft" && (
                      <>
                        <DropdownMenuItem onClick={() => console.log("Publish Article:", article.articleId)}>
                           <HiOutlineGlobeAlt className="h-4 w-4 mr-2"/>
                          Publish
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Archive Article:", article.articleId)}>
                            <CiBookmarkMinus className="h-4 w-4 mr-2"/>
                          Archive
                        </DropdownMenuItem>
                      </>
                    )}
                    {article.status === "Archived" && (
                      <>
                        <DropdownMenuItem onClick={() => console.log("Publish Article:", article.articleId)}>
                        <HiOutlineGlobeAlt className="h-4 w-4 mr-2"/>
                          Publish
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => console.log("Delete Article:", article.articleId)} className="text-[#FF3B30]">
                    <Trash2 className="h-4 w-4 mr-2 text-[#FF3B30]" />
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
              className="bg-[#F5F7FA] text-gray-700"
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
                className={currentPage === page ? "bg-[#5243FE] text-white" : "bg-[#F5F7FA] text-gray-700"}
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="bg-[#F5F7FA] text-gray-700"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <IoIosArrowForward />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700">
              Showing {startIndex + 1} - {Math.min(startIndex + articlesPerPage, totalArticles)} of {totalArticles}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">Go to page:</p>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-16 p-1 border rounded-lg bg-[#F5F7FA] text-gray-700"
              />
              <Button
                size="sm"
                className="bg-[#5243FE] text-white"
                onClick={() => goToPage(currentPage)}
              >
                Go
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
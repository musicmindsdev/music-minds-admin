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
import { Search, EllipsisVertical, Filter, Calendar, Trash2, Clock } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CiBookmarkMinus } from "react-icons/ci";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { TbEdit } from "react-icons/tb";
import Modal from "@/components/Modal";
import { FaTrash } from "react-icons/fa";
import Loading from "@/components/Loading";
import Pending from "@/public/pending.png";
import Image from "next/image";

// What the API returns
export interface ApiArticle {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category: string;
  status: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  publishedAt?: string;
  createdAt?: string;
  thumbnail?: string;
  tags?: string[];
  publishAt?: string;
}

// What our component uses
export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  createdBy: string;
  role: string;
  publishedDate: string;
  thumbnail?: string;
  tags?: string[];
  publishAt?: string;
}

interface ArticlesTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
  onEdit?: (article: Article) => void;
  onSchedule?: (article: Article) => void;
  onExportData?: (articles: Article[]) => void;
  onFetchAllData?: (dateRangeFrom: string, dateRangeTo: string) => Promise<Article[]>;
  refreshKey?: number;
}

export default function ArticlesTable({
  showCheckboxes = false,
  showPagination = false,
  onEdit,
  onSchedule,
  onExportData,
  refreshKey = 0,
}: ArticlesTableProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState({
    All: true,
    PUBLISHED: false,
    DRAFT: false,
    ARCHIVED: false,
    SCHEDULED: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeFrom, setDateRangeFrom] = useState("");
  const [dateRangeTo, setDateRangeTo] = useState("");
  const articlesPerPage = 10;

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Build query parameters - use the exact parameters the backend expects
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: articlesPerPage.toString(),
      });
  
      // Add search if provided
      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }
  
      // Add date filters if provided
      if (dateRangeFrom) {
        queryParams.append("fromDate", new Date(dateRangeFrom).toISOString());
      }
      if (dateRangeTo) {
        queryParams.append("toDate", new Date(dateRangeTo).toISOString());
      }
  
      // Add status filter (only if not "All")
      if (!statusFilter.All) {
        const selectedStatuses = [];
        if (statusFilter.PUBLISHED) selectedStatuses.push("PUBLISHED");
        if (statusFilter.DRAFT) selectedStatuses.push("DRAFT");
        if (statusFilter.ARCHIVED) selectedStatuses.push("ARCHIVED");
        if (statusFilter.SCHEDULED) selectedStatuses.push("SCHEDULED");
        
        if (selectedStatuses.length > 0) {
          selectedStatuses.forEach(status => queryParams.append("status", status));
        }
      }
      // Remove the else clause that defaults to PUBLISHED when "All" is selected
      // This way, when "All" is selected, no status filter is applied
  
      console.log("Fetching articles with params:", queryParams.toString());
  
      const response = await fetch(`/api/articles?${queryParams.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch articles");
      }
  
      const backendData = await response.json();
      console.log("Full backend response:", backendData);
  
      // Based on your API response structure, extract data and metadata
      let articlesData = [];
      let totalCount = 0;
      let totalPagesCount = 1;
  
      if (backendData.data && Array.isArray(backendData.data)) {
        // Your API returns { data: [], meta: { total, page, totalPages, ... } }
        articlesData = backendData.data;
        totalCount = backendData.meta?.total || 0;
        totalPagesCount = backendData.meta?.totalPages || 1;
        
        console.log(`Extracted ${articlesData.length} articles from backendData.data`);
        console.log(`Total count: ${totalCount}, Total pages: ${totalPagesCount}`);
      } else {
        // Fallback if structure is different
        console.warn("Unexpected API response structure:", backendData);
        articlesData = [];
        totalCount = 0;
        totalPagesCount = 1;
      }
  
      // Map the API data to your component's Article interface
      const mappedArticles: Article[] = articlesData.map((article: ApiArticle) => {
        console.log("Mapping article:", article);
        return {
          id: article.id,
          title: article.title,
          content: article.content,
          category: article.category,
          status: article.status,
          createdBy: article.author?.name || "Unknown Author",
          role: "Admin", // Default role since API doesn't provide this
          publishedDate: article.publishedAt || article.createdAt || new Date().toISOString(),
          thumbnail: article.thumbnail,
          tags: article.tags,
          publishAt: article.publishAt,
        };
      });
  
      console.log(`Mapped ${mappedArticles.length} articles`);
      setArticles(mappedArticles);
      setTotalArticles(totalCount);
      setTotalPages(totalPagesCount);
      
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, dateRangeFrom, dateRangeTo]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles, refreshKey]);
  useEffect(() => {
    if (onExportData) {
      onExportData(articles);
    }
  }, [articles, onExportData]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(articles.map((article) => article.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectArticle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles((prev) => [...prev, id]);
    } else {
      setSelectedArticles((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = async () => {
    try {
      for (const articleId of selectedArticles) {
        const response = await fetch(`/api/articles/${articleId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete article");
        }
      }

      setSelectedArticles([]);
      setIsDeleteModalOpen(false);
      fetchArticles(); // Refresh table
    } catch (error) {
      console.error("Error deleting article:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to publish article");
      }

      fetchArticles(); // Refresh table
    } catch (error) {
      console.error("Error publishing article:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      // For unpublishing, we'll change status to DRAFT via PUT
      const response = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "DRAFT"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unpublish article");
      }

      fetchArticles(); // Refresh table
    } catch (error) {
      console.error("Error unpublishing article:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}/archive`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive article");
      }

      fetchArticles(); // Refresh table
    } catch (error) {
      console.error("Error archiving article:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const openDeleteModal = () => {
    if (selectedArticles.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === "All") {
      setStatusFilter({
        All: true,
        DRAFT: false,
        PUBLISHED: false,
        ARCHIVED: false,
        SCHEDULED: false,
      });
    } else {
      setStatusFilter((prev) => ({
        All: false,
        DRAFT: status === "DRAFT" ? !prev.DRAFT : prev.DRAFT,
        PUBLISHED: status === "PUBLISHED" ? !prev.PUBLISHED : prev.PUBLISHED,
        ARCHIVED: status === "ARCHIVED" ? !prev.ARCHIVED : prev.ARCHIVED,
        SCHEDULED: status === "SCHEDULED" ? !prev.SCHEDULED : prev.SCHEDULED,
      }));
    }
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-100 text-green-700";
      case "ARCHIVED": return "bg-blue-100 text-blue-700";
      case "DRAFT": return "bg-gray-100 text-gray-700";
      case "SCHEDULED": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-500";
      case "ARCHIVED": return "bg-blue-500";
      case "DRAFT": return "bg-gray-500";
      case "SCHEDULED": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        <Button variant="outline" className="mt-4" onClick={fetchArticles}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2 space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search for article by ID, Title, Category, or Created By"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 p-2 border rounded-lg w-full bg-background text-gray-700"
          />
        </div>
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
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {["All", "DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"].map((status) => (
                    <Button
                      key={status}
                      variant="ghost"
                      className={`flex items-center gap-1 rounded-full text-sm ${statusFilter[status as keyof typeof statusFilter] ? "border border-gray-400 font-medium" : ""
                        }`}
                      onClick={() => handleStatusFilterChange(status)}
                    >
                      {status !== "All" && (
                        <span className={`h-2 w-2 rounded-full ${getStatusDotColor(status)}`} />
                      )}
                      {status === "PUBLISHED" ? "Published" :
                        status === "DRAFT" ? "Draft" :
                          status === "ARCHIVED" ? "Archived" :
                            status === "SCHEDULED" ? "Scheduled" : status}
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
                      value={dateRangeFrom}
                      onChange={(e) => setDateRangeFrom(e.target.value)}
                      className="pl-8 w-full"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={dateRangeTo}
                      onChange={(e) => setDateRangeTo(e.target.value)}
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

      {selectedArticles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg flex justify-between items-center">
          <span>{selectedArticles.length} article(s) selected</span>
          <Button variant="destructive" size="sm" onClick={openDeleteModal}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Empty state - using the same pattern as other tables */}
      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image src={Pending} alt="No articles found" className="mx-auto mb-2" />
          <p>No articles found.</p>
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
                      checked={selectedArticles.length === articles.length && articles.length > 0}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{article.id}</TableCell>
                  <TableCell>{truncateText(article.title, 20)}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <span className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 ${getStatusColor(article.status)}`}>
                      <span className={`h-2 w-2 rounded-full ${getStatusDotColor(article.status)}`} />
                      {article.status === "PUBLISHED" ? "Published" :
                        article.status === "DRAFT" ? "Draft" :
                          article.status === "ARCHIVED" ? "Archived" :
                            article.status === "SCHEDULED" ? "Scheduled" : article.status}
                      {article.publishAt && article.status === "SCHEDULED" && (
                        <Clock className="h-3 w-3 ml-1" />
                      )}
                    </span>
                    {article.publishAt && article.status === "SCHEDULED" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Scheduled for: {formatDate(article.publishAt)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(article.publishedDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
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
                        <DropdownMenuItem onClick={() => onEdit?.(article)}>
                          <TbEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        
                        {article.status === "DRAFT" && (
                          <>
                            <DropdownMenuItem onClick={() => handlePublish(article.id)}>
                              <HiOutlineGlobeAlt className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSchedule?.(article)}>
                              <Clock className="h-4 w-4 mr-2" />
                              Schedule
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {article.status === "PUBLISHED" && (
                          <DropdownMenuItem onClick={() => handleUnpublish(article.id)}>
                            <HiOutlineGlobeAlt className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        
                        {article.status !== "ARCHIVED" && (
                          <DropdownMenuItem onClick={() => handleArchive(article.id)}>
                            <CiBookmarkMinus className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => {
                          setSelectedArticles([article.id]);
                          openDeleteModal();
                        }} className="text-[#FF3B30]">
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
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <IoIosArrowBack />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
                  Showing {Math.min((currentPage - 1) * articlesPerPage + 1, totalArticles)} -{" "}
                  {Math.min(currentPage * articlesPerPage, totalArticles)} of {totalArticles}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Deletion"
        icon={<FaTrash className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Deleting Article?"
        message={`Are you sure you want to delete ${selectedArticles.length} article(s)? This action cannot be undone.`}
        cancelText="No, I don't"
        confirmText="Yes, delete"
        confirmButtonColor="#EF4444"
        onConfirm={handleDelete}
      />
    </>
  );
}
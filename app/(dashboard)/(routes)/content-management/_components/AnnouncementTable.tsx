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
import { Filter, Search, EllipsisVertical, Trash2 } from "lucide-react";
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
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { CiBookmarkMinus } from "react-icons/ci";
import { TbEdit } from "react-icons/tb";
import Modal from "@/components/Modal";
import { FaTrash } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

// What the API returns
interface ApiAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdBy?: string;
  role?: string;
  publishedDate?: string;
  mediaUrl?: string;
}

// What our component uses (strict typing, required props)
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdBy: string;
  role: string;
  publishedDate: string;
  mediaUrl?: string;
}

interface AnnouncementTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
  onEdit?: (announcement: Announcement) => void;
  refreshKey?: number; // ADD THIS
}

export default function AnnouncementTable({
  showCheckboxes = false,
  showPagination = false,
  onEdit,
  refreshKey = 0, // ADD THIS
}: AnnouncementTableProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState({
    Published: false,
    Draft: false,
    Archived: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const announcementsPerPage = 10;

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: announcementsPerPage.toString(),
        ...(statusFilter.Published && { status: "Published" }),
        ...(statusFilter.Draft && { status: "Draft" }),
        ...(statusFilter.Archived && { status: "Archived" }),
        ...(searchQuery && { searchQuery }),
      }).toString();

      const response = await fetch(`/api/announcements?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch announcements");
      }

      const { announcements: apiAnnouncements, total, pages } = await response.json();

      const mappedAnnouncements: Announcement[] = Array.isArray(apiAnnouncements)
        ? apiAnnouncements.map((ann: ApiAnnouncement) => ({
            id: ann.id,
            title: ann.title,
            content: ann.content,
            type: ann.type,
            status: ann.status,
            createdBy: ann.createdBy || "Unknown",
            role: ann.role || "Admin",
            publishedDate: ann.publishedDate || new Date().toISOString(),
            mediaUrl: ann.mediaUrl,
          }))
        : [];

      setAnnouncements(mappedAnnouncements);
      setTotalAnnouncements(total || mappedAnnouncements.length);
      setTotalPages(pages || Math.ceil(total / announcementsPerPage));
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements, refreshKey]); 

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements(announcements.map((ann) => ann.id));
    } else {
      setSelectedAnnouncements([]);
    }
  };

  const handleSelectAnnouncement = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements((prev) => [...prev, id]);
    } else {
      setSelectedAnnouncements((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncements[0]}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete announcements");
      }

      setSelectedAnnouncements([]);
      setIsDeleteModalOpen(false);
      fetchAnnouncements(); // Refresh table
    } catch (error) {
      console.error("Error deleting announcements:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handlePublish = async (id: string, isPublishing: boolean) => {
    try {
      const response = await fetch(`/api/announcements/${id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isPublishing ? "publish" : "unpublish"} announcement`);
      }

      fetchAnnouncements(); // Refresh table
    } catch (error) {
      console.error(`Error ${isPublishing ? "publishing" : "unpublishing"} announcement:`, error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/announcements/${id}/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive announcement");
      }

      fetchAnnouncements(); // Refresh table
    } catch (error) {
      console.error("Error archiving announcement:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const openDeleteModal = () => {
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
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for announcement by ID, Title, or Created By"
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
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      statusFilter.Published ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setStatusFilter((prev) => ({
                        ...prev,
                        Published: !prev.Published,
                        Draft: prev.Published ? prev.Draft : false,
                        Archived: prev.Published ? prev.Archived : false,
                      }))
                    }
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Published
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      statusFilter.Draft ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setStatusFilter((prev) => ({
                        ...prev,
                        Draft: !prev.Draft,
                        Published: prev.Draft ? prev.Published : false,
                        Archived: prev.Draft ? prev.Archived : false,
                      }))
                    }
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                    Draft
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1 rounded-full text-sm ${
                      statusFilter.Archived ? "border border-gray-400 font-medium" : ""
                    }`}
                    onClick={() =>
                      setStatusFilter((prev) => ({
                        ...prev,
                        Archived: !prev.Archived,
                        Published: prev.Archived ? prev.Published : false,
                        Draft: prev.Archived ? prev.Draft : false,
                      }))
                    }
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-300" />
                    Archived
                  </Button>
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
                  checked={selectedAnnouncements.length === announcements.length && announcements.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Announcement ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCheckboxes ? 7 : 6} className="text-center">
                No announcements available
              </TableCell>
            </TableRow>
          ) : (
            announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedAnnouncements.includes(announcement.id)}
                      onCheckedChange={(checked) => handleSelectAnnouncement(announcement.id, checked as boolean)}
                    />
                  </TableCell>
                )}
                <TableCell>{announcement.id}</TableCell>
                <TableCell>{announcement.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>{announcement.createdBy.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {truncateText(announcement.createdBy, 15)}
                  </div>
                </TableCell>
                <TableCell>{announcement.role}</TableCell>
                <TableCell>
                  <span
                    className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 ${
                      announcement.status === "Published"
                        ? "bg-green-100 text-green-600"
                        : announcement.status === "Draft"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        announcement.status === "Published"
                          ? "bg-green-500"
                          : announcement.status === "Draft"
                          ? "bg-gray-500"
                          : "bg-blue-300"
                      }`}
                    />
                    {announcement.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(announcement.publishedDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost"><EllipsisVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(announcement)}>
                        <TbEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {announcement.status === "Published" ? (
                        <DropdownMenuItem onClick={() => handlePublish(announcement.id, false)}>
                          <HiOutlineGlobeAlt className="h-4 w-4 mr-2" />
                          Unpublish
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handlePublish(announcement.id, true)}>
                          <HiOutlineGlobeAlt className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleArchive(announcement.id)}>
                        <CiBookmarkMinus className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openDeleteModal} className="text-[#FF3B30]">
                        <Trash2 className="h-4 w-4 mr-2 text-[#FF3B30]" />
                        Delete
                      </DropdownMenuItem>
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
              Showing {Math.min((currentPage - 1) * announcementsPerPage + 1, totalAnnouncements)} -{" "}
              {Math.min(currentPage * announcementsPerPage, totalAnnouncements)} of {totalAnnouncements}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Deletion"
        icon={<FaTrash className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Deleting Announcements?"
        message="Are you sure you want to delete the selected announcement(s)?"
        cancelText="No, I don't"
        confirmText="Yes, delete"
        confirmButtonColor="#EF4444"
        onConfirm={handleDelete}
      />
    </>
  );
}
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
import { Filter, Search, EllipsisVertical,  Trash } from "lucide-react";
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
import { announcementData } from "@/lib/mockData";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { CiBookmarkMinus } from "react-icons/ci";
import { TbEdit } from "react-icons/tb";



interface AnnouncementTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  headerText?: string;
}

export default function AnnouncementTable({
  showCheckboxes = false,
  showPagination = false,
}: AnnouncementTableProps) {
  const [statusFilter, setStatusFilter] = useState({ Published: false, Draft: false, Archived: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 10; // Aligned with ReviewTable

  const filteredAnnouncements = (announcementData || []).filter((announcement) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      announcement.id.toLowerCase().includes(query) ||
      announcement.title.toLowerCase().includes(query) ||
      announcement.createdBy.toLowerCase().includes(query);

    const statusMatch =
      (Object.values(statusFilter).every((val) => !val) ||
       (statusFilter.Published && announcement.status === "Published") ||
       (statusFilter.Draft && announcement.status === "Draft") ||
       (statusFilter.Archived && announcement.status === "Archived"));

    return searchMatch && statusMatch;
  });

  const totalAnnouncements = filteredAnnouncements.length;
  const totalPages = Math.ceil(totalAnnouncements / announcementsPerPage);
  const startIndex = (currentPage - 1) * announcementsPerPage;
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, startIndex + announcementsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements(paginatedAnnouncements.map((ann) => ann.id));
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

  useEffect(() => {
    setCurrentPage(1);
    setSelectedAnnouncements([]);
  }, [statusFilter, searchQuery, currentPage]);

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
                  checked={selectedAnnouncements.length === paginatedAnnouncements.length && paginatedAnnouncements.length > 0}
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
          {paginatedAnnouncements.map((announcement) => (
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
              <TableCell>{announcement.publishedDate}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost"><EllipsisVertical /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log("Edit:", announcement.id)}>
                      <TbEdit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {announcement.status === "Published" ? (
                      <DropdownMenuItem onClick={() => console.log("Unpublish:", announcement.id)}>
                         <HiOutlineGlobeAlt className="h-4 w-4 mr-2"/>
                        Unpublish
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => console.log("Publish:", announcement.id)}>
                        <HiOutlineGlobeAlt className="h-4 w-4 mr-2"/>
                        Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => console.log("Archive:", announcement.id)}>
                        <CiBookmarkMinus className="h-4 w-4 mr-2"/>
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Delete:", announcement.id)} className="text-[#FF3B30]">
                      <Trash className="h-4 w-4 mr-2 text-[#FF3B30]" />
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
              Showing {startIndex + 1} - {Math.min(startIndex + announcementsPerPage, totalAnnouncements)} of {totalAnnouncements}
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
  );
}
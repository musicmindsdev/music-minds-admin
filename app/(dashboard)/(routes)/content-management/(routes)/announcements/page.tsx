"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PiNotificationBold } from "react-icons/pi";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import AnnouncementTable, { Announcement, ApiAnnouncement } from "../../_components/AnnouncementTable"; // Import the type
import CreateContentModal from "@/components/CreateContentModal";

interface CreateAnnouncement {
  id?: string;
  type: string;
  status: string;
  title: string;
  content: string;
  mediaUrl?: string;
}

export default function AnnouncementsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<CreateAnnouncement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [announcementsData, setAnnouncementsData] = useState<Announcement[]>([]); // Use the imported type

  // This receives the data from the AnnouncementTable
  const handleExportData = (announcements: Announcement[]) => {
    setAnnouncementsData(announcements);
  };

  const fetchAllAnnouncements = async (exportDateRangeFrom: string, exportDateRangeTo: string) => {
    try {
      const queryParams: Record<string, string> = {
        limit: "10000",
      };

      if (exportDateRangeFrom) {
        queryParams.startDate = new Date(exportDateRangeFrom).toISOString();
      }
      if (exportDateRangeTo) {
        queryParams.endDate = new Date(exportDateRangeTo).toISOString();
      }

      const query = new URLSearchParams(queryParams).toString();

      const response = await fetch(`/api/announcements?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all announcements");
      }

      const { announcements: apiAnnouncements } = await response.json();

      const allAnnouncements: Announcement[] = Array.isArray(apiAnnouncements)
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

      return allAnnouncements;
    } catch (err) {
      console.error("Error fetching all announcements for export:", err);
      return [];
    }
  };
  const handleCreate = async (data: {
    id?: string;
    type: string;
    status: string;
    title: string;
    content: string;
    mediaFile?: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("type", data.type);
      formData.append("status", data.status);
      if (data.mediaFile) {
        formData.append("media", data.mediaFile);
      }

      const url = data.id ? `/api/announcements/${data.id}` : "/api/announcements";
      const method = data.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${data.id ? "update" : "create"} announcement`);
      }

      const result = await response.json();
      console.log(`Announcement ${data.id ? "updated" : "created"}:`, result);
      
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error(`Error ${data.id ? "updating" : "creating"} announcement:`, error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-light">Announcements Overview</h2>
        <div className="space-x-2 flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingAnnouncement(null);
              setIsCreateModalOpen(true);
            }}
          >
            <PiNotificationBold className="h-4 w-4 mr-2" /> Create Announcement
          </Button>
          <Button
            className="text-white flex items-center space-x-2"
            onClick={() => setIsExportModalOpen(true)}
          >
            <CiExport className="mr-2" />
            <span className="hidden md:inline">Export Data</span>
          </Button>
        </div>
      </div>
      <Card className="rounded-none">
        <CardContent>
          <AnnouncementTable
            showCheckboxes={true}
            showPagination={true}
            headerText="All Announcements"
            onEdit={handleEdit}
            refreshKey={refreshKey}
            onExportData={handleExportData} 
            onFetchAllData={fetchAllAnnouncements}
          />
        </CardContent>
      </Card>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Announcement Data"
        data={announcementsData} // Use the data from table
        dataType="announcements"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Published", value: "Published" },
          { label: "Drafts", value: "Draft" },
          { label: "Archived", value: "Archived" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Announcement ID", value: "id" },
          { label: "Published Date", value: "publishedDate" },
          { label: "Title", value: "title" },
          { label: "Content", value: "content" },
          { label: "Type", value: "type" },
          { label: "Created By", value: "createdBy" },
          { label: "Role", value: "role" },
          { label: "Status", value: "status" },
        ]}
        onFetchAllData={fetchAllAnnouncements}
      />
      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAnnouncement(null);
        }}
        onSave={handleCreate}
        contentType="Announcement"
        announcement={editingAnnouncement || undefined}
        isEditing={!!editingAnnouncement}
      />
    </div>
  );
}
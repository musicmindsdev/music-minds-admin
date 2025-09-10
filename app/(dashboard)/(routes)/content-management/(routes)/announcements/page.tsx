"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PiNotificationBold } from "react-icons/pi";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import AnnouncementTable from "../../_components/AnnouncementTable";
import CreateContentModal from "@/components/CreateContentModal";

interface Announcement {
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
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // ADD THIS

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    console.log("Exporting Review data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
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
            refreshKey={refreshKey} // PASS refreshKey HERE
          />
        </CardContent>
      </Card>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Published", value: "Published" },
          { label: "Drafts", value: "Draft" },
          { label: "Archived", value: "Archived" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Announcement ID", value: "Announcement ID" },
          { label: "Published Date", value: "Published Date" },
          { label: "Title", value: "Title" },
          { label: "Created By", value: "Created By" },
          { label: "Status", value: "Status" },
        ]}
        onExport={handleExport}
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
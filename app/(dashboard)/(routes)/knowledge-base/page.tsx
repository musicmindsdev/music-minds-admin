"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import { Card, CardContent } from "@/components/ui/card";
import ExportModal from "@/components/ExportModal";
import ArticlesTable from "./_components/ArticlesTable";
import { PiBookOpenTextLight } from "react-icons/pi";
import CreateContentModal from "@/components/CreateContentModal";

export default function ArticlesPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    priorityFilter: Record<string, boolean>;
    messageTypeFilter: Record<string, boolean>;
    recipientTypeFilter: Record<string, boolean>;
    roleFilter: string;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
    adminRole?: string;
  }) => {
    console.log("Exporting Articles data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
  };

  const handleCreate = (data: {
    type: string;
    status: string;
    title: string;
    content: string;
  }) => {
    console.log("Creating announcement:", data);
    // Add create logic here (e.g., API call to save announcement)
  };

  return (
    <div>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg">Articles</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PiBookOpenTextLight className="mr-2" />
              <span className="hidden md:inline">Create Article</span>
            </Button>
            <Button
              className="flex items-center space-x-2 bg-[#5243FE] text-white hover:bg-[#4335CC]"
              onClick={() => setIsExportModalOpen(true)}
            >
              <CiExport className="mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
          </div>
        </div>
        <Card className="rounded-lg">
          <CardContent>
            <ArticlesTable showCheckboxes={true} showPagination={true} />
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Draft", value: "Draft" },
          { label: "Published", value: "Published" },
          { label: "Archived", value: "Archived" },
        ]}
        messageTypeFilters={[]}
        recipientTypeFilters={[]}
        priorityFilters={[]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Article ID", value: "articleId" },
          { label: "Title", value: "title" },
          { label: "Category", value: "category" },
          { label: "Published Date", value: "publishedDate" },
          { label: "Created By", value: "createdBy" },
        ]}
        onExport={handleExport}
      />
        <CreateContentModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreate}
              contentType="Article"
            />
    </div>
  );
}
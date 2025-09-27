"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import { Card, CardContent } from "@/components/ui/card";
import ExportModal from "@/components/ExportModal";
import ArticlesTable from "./_components/ArticlesTable";
import { PiBookOpenTextLight } from "react-icons/pi";
import CreateContentModal from "@/components/CreateContentModal";

interface Article {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category: string;
  status: string;
  thumbnail?: string;
  emailTemplate?: string;
  emailSubject?: string;
  emailPreview?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  publishAt?: string;
  sendImmediately?: boolean;
}

export default function ArticlesPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleCreate = async (data: {
    id?: string;
    title: string;
    content: string;
    category?: string;
    status: string;
    slug?: string;
    excerpt?: string;
    thumbnail?: string;
    emailTemplate?: string;
    emailSubject?: string;
    emailPreview?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    publishAt?: string;
    sendImmediately?: boolean;
  }) => {
    try {
      const payload = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: data.excerpt || "",
        content: data.content,
        category: data.category || "GUIDE",
        status: data.status,
        thumbnail: data.thumbnail || "",
        emailTemplate: data.emailTemplate || "DEFAULT",
        emailSubject: data.emailSubject || data.title,
        emailPreview: data.emailPreview || data.excerpt || "",
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.excerpt || "",
        tags: data.tags || [],
        publishAt: data.publishAt || null,
        sendImmediately: data.sendImmediately || false
      };

      const url = data.id ? `/api/articles/${data.id}` : "/api/articles";
      const method = data.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${data.id ? "update" : "create"} article`);
      }

      const result = await response.json();
      console.log(`Article ${data.id ? "updated" : "created"}:`, result);
      
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error(`Error ${data.id ? "updating" : "creating"} article:`, error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsCreateModalOpen(true);
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
              onClick={() => {
                setEditingArticle(null);
                setIsCreateModalOpen(true);
              }}
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
            <ArticlesTable 
              showCheckboxes={true} 
              showPagination={true} 
              onEdit={handleEdit}
              refreshKey={refreshKey}
            />
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Draft", value: "DRAFT" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Archived", value: "ARCHIVED" },
        ]}
        messageTypeFilters={[]}
        recipientTypeFilters={[]}
        priorityFilters={[]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Article ID", value: "id" },
          { label: "Title", value: "title" },
          { label: "Category", value: "category" },
          { label: "Status", value: "status" },
          { label: "Published Date", value: "publishedDate" },
          { label: "Created By", value: "createdBy" },
        ]}
        onExport={handleExport}
      />
      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingArticle(null);
        }}
        onSave={handleCreate}
        contentType="Article"
        article={editingArticle || undefined}
        isEditing={!!editingArticle}
      />
    </div>
  );
}
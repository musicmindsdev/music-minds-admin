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
  const [articles, ] = useState<Article[]>([]);


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
    mediaFile?: File; // Add this line
  }) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all fields
      formData.append("title", data.title);
      formData.append("slug", data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      formData.append("content", data.content);
      formData.append("category", data.category || "GUIDE");
      formData.append("status", data.status);
      
      // Append optional fields
      if (data.excerpt) formData.append("excerpt", data.excerpt);
      if (data.mediaFile) formData.append("thumbnail", data.mediaFile);
      if (data.emailTemplate) formData.append("emailTemplate", data.emailTemplate);
      if (data.emailSubject) formData.append("emailSubject", data.emailSubject);
      if (data.emailPreview) formData.append("emailPreview", data.emailPreview);
      if (data.seoTitle) formData.append("seoTitle", data.seoTitle);
      if (data.seoDescription) formData.append("seoDescription", data.seoDescription);
      if (data.tags && data.tags.length > 0) formData.append("tags", data.tags.join(','));
      if (data.publishAt) formData.append("publishAt", data.publishAt);
      if (data.sendImmediately) formData.append("sendImmediately", data.sendImmediately.toString());
  
      const url = data.id ? `/api/articles/${data.id}` : "/api/articles";
      const method = data.id ? "PATCH" : "POST";
  
      const response = await fetch(url, {
        method,
        // Don't set Content-Type header for FormData - let browser set it
        body: formData,
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
        title="Export Articles Data"
        data={articles} 
        dataType="articles"  
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Draft", value: "DRAFT" },
          { label: "Published", value: "PUBLISHED" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Archived", value: "ARCHIVED" },
        ]}
        fieldOptions={[
          { label: "Article ID", value: "id" },
          { label: "Title", value: "title" },
          { label: "Category", value: "category" },
          { label: "Status", value: "status" },
          { label: "Published Date", value: "publishedDate" },
          { label: "Created By", value: "createdBy" },
        ]}
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
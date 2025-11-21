"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import { Card, CardContent } from "@/components/ui/card";
import ExportModal from "@/components/ExportModal";
import ArticlesTable, { ApiArticle, Article } from "./_components/ArticlesTable"; // Import the Article type
import { PiBookOpenTextLight } from "react-icons/pi";
import CreateContentModal from "@/components/CreateContentModal";

interface CreateArticleData {
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
  const [editingArticle, setEditingArticle] = useState<CreateArticleData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [articlesData, setArticlesData] = useState<Article[]>([]);

  // This receives the data from the ArticlesTable
  const handleExportData = (articles: Article[]) => {
    setArticlesData(articles);
  };

  const fetchAllArticles = async (exportDateRangeFrom: string, exportDateRangeTo: string) => {
    try {
      const queryParams: Record<string, string> = {
        limit: "10000",
      };

      if (exportDateRangeFrom) {
        queryParams.fromDate = new Date(exportDateRangeFrom).toISOString();
      }
      if (exportDateRangeTo) {
        queryParams.toDate = new Date(exportDateRangeTo).toISOString();
      }

      const query = new URLSearchParams(queryParams).toString();

      const response = await fetch(`/api/articles?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all articles");
      }

      const backendData = await response.json();

      // Handle different response structures
      let articlesData = [];
      if (Array.isArray(backendData)) {
        articlesData = backendData;
      } else if (backendData.articles && Array.isArray(backendData.articles)) {
        articlesData = backendData.articles;
      } else if (backendData.data && Array.isArray(backendData.data)) {
        articlesData = backendData.data;
      } else {
        const possibleArrays = Object.values(backendData).filter(val => Array.isArray(val));
        articlesData = possibleArrays[0] || [];
      }

      const allArticles: Article[] = articlesData.map((article: ApiArticle) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        status: article.status,
        createdBy: article.author?.name || "Unknown Author",
        role: "Admin",
        publishedDate: article.publishedAt || article.createdAt || new Date().toISOString(),
        thumbnail: article.thumbnail,
        tags: article.tags,
        publishAt: article.publishAt,
      }));

      return allArticles;
    } catch (err) {
      console.error("Error fetching all articles for export:", err);
      return [];
    }
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
    mediaFile?: File;
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
      const method = data.id ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
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
              onExportData={handleExportData} 
              onFetchAllData={fetchAllArticles}
            />
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Articles Data"
        data={articlesData} // Use the data from table
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
          { label: "Content", value: "content" },
          { label: "Category", value: "category" },
          { label: "Status", value: "status" },
          { label: "Created By", value: "createdBy" },
          { label: "Role", value: "role" },
          { label: "Published Date", value: "publishedDate" },
          { label: "Tags", value: "tags" },
          { label: "Scheduled Date", value: "publishAt" },
        ]}
        onFetchAllData={fetchAllArticles}
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
"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Editor } from "@/components/Editor";
import { Trash, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ContentItem {
  id?: string;
  title: string;
  content: string;
  type?: string;
  status: string;
  mediaUrl?: string;
  category?: string;
  publishAt?: string;
}

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => void;
  onSchedule?: (data: { id: string; publishAt: string }) => void;
  contentType: "Announcement" | "Article";
  announcement?: ContentItem;
  article?: ContentItem;
  isEditing?: boolean;
  isScheduling?: boolean;
}

export default function CreateContentModal({
  isOpen,
  onClose,
  onSave,
  onSchedule,
  contentType,
  announcement,
  article,
  isEditing = false,
  isScheduling = false,
}: CreateContentModalProps) {
  const contentData = announcement || article;
  
  const [type, setType] = useState(contentData?.type || "Textual");
  const [status, setStatus] = useState(contentData?.status || "Draft");
  const [title, setTitle] = useState(contentData?.title || "");
  const [content, setContent] = useState(contentData?.content || "");
  const [category, setCategory] = useState(contentData?.category || "GUIDE");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(
    contentData?.mediaUrl || null
  );
  const [publishAt, setPublishAt] = useState<Date | undefined>(
    contentData?.publishAt ? new Date(contentData.publishAt) : undefined
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const data = announcement || article;
      setType(data?.type || "Textual");
      setStatus(data?.status || "Draft");
      setTitle(data?.title || "");
      setContent(data?.content || "");
      setCategory(data?.category || "GUIDE");
      setMediaFile(null);
      setMediaPreviewUrl(data?.mediaUrl || null);
      setPublishAt(data?.publishAt ? new Date(data.publishAt) : undefined);
    }
  }, [isOpen, announcement, article]);

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl && !contentData?.mediaUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl, contentData]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        setMediaFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setMediaFile(file);
      if (mediaPreviewUrl && !contentData?.mediaUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
      setMediaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    if (mediaPreviewUrl && !contentData?.mediaUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (isScheduling && onSchedule && contentData?.id && publishAt) {
      // Handle scheduling
      onSchedule({
        id: contentData.id,
        publishAt: publishAt.toISOString()
      });
      onClose();
      return;
    }

    if (contentType === "Announcement") {
      let apiType = type.toUpperCase();
      if (apiType === "VISUAL") {
        apiType = "VIRTUAL";
      }
      
      const apiStatus = status.toUpperCase();
      
      const dataToSave = {
        ...(isEditing && { id: contentData?.id }),
        type: apiType,
        status: apiStatus,
        title,
        content: content.slice(0, type === "Textual" ? 1000 : 500),
      };
    
      if (type === "Visual" && !mediaFile && !mediaPreviewUrl) {
        alert(`Please upload a media file for ${contentType} (Visual type).`);
        return;
      }
    
      onSave({ ...dataToSave, mediaFile });
    } else {
      let apiType = type.toUpperCase();
      if (apiType === "VISUAL") {
        apiType = "VIRTUAL";
      }
      
      const dataToSave = {
        ...(isEditing && { id: contentData?.id }),
        title,
        content,
        category,
        status: status.toUpperCase(),
        type: apiType,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: content.substring(0, 150),
        seoTitle: title,
        seoDescription: content.substring(0, 160),
        tags: [],
        sendImmediately: false,
        ...(publishAt && { publishAt: publishAt.toISOString() })
      };
    
      if (type === "Visual" && !mediaFile && !mediaPreviewUrl) {
        alert(`Please upload a media file for ${contentType} (Visual type).`);
        return;
      }
    
      onSave({ ...dataToSave, mediaFile });
    }
    
    onClose();
  };

  const contentCharLimit = type === "Textual" ? 1000 : 500;

  const categoryOptions = [
    { value: "FAQ", label: "FAQ" },
    { value: "GUIDE", label: "Guide" },
    { value: "TROUBLESHOOTING", label: "Troubleshooting" },
    { value: "POLICY", label: "Policy" },
    { value: "NEWS", label: "News" }
  ];

  const statusOptions = contentType === "Article" 
    ? [
        { value: "DRAFT", label: "Draft" },
        { value: "PUBLISHED", label: "Published" },
        { value: "SCHEDULED", label: "Scheduled" },
        { value: "ARCHIVED", label: "Archived" }
      ]
    : [
        { value: "Draft", label: "Draft" },
        { value: "Published", label: "Published" },
        { value: "Archived", label: "Archived" }
      ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs">
        <DialogContent
          className={`rounded-lg px-6 transition-all duration-300 ${
            type === "Visual" ? "sm:max-w-[950px]" : "sm:max-w-[571px]"
          }`}
        >
          <DialogHeader className="flex justify-between items-start ">
            <DialogTitle className="text-lg font-semibold">
              {isScheduling ? `Schedule ${contentType}` : 
               isEditing ? `Edit ${contentType}` : `Create ${contentType}`}
            </DialogTitle>
          </DialogHeader>

          {!isScheduling && (
            <div className="space-y-1">
              <Label>{contentType} Type</Label>
              <div className="flex space-x-2">
                <Button
                  variant={type === "Textual" ? "default" : "outline"}
                  className="rounded-lg"
                  onClick={() => {
                    setType("Textual");
                    setMediaFile(null);
                    setMediaPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Textual
                </Button>
                <Button
                  variant={type === "Visual" ? "default" : "outline"}
                  className="rounded-lg"
                  onClick={() => {
                    setType("Visual");
                    setContent("");
                  }}
                >
                  Visual
                </Button>
              </div>
            </div>
          )}

          <div className={`${type === "Visual" && !isScheduling ? "flex flex-row gap-8" : "block"}`}>
            <div className={`${type === "Visual" && !isScheduling ? "flex-1 flex flex-col" : "w-full"}`}>
              <div className="space-y-3 flex-1 overflow-y-auto">
                {!isScheduling && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 border rounded-lg text-gray-700 bg-card"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {contentType === "Article" && !isScheduling && (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 border rounded-lg text-gray-700 bg-card"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {contentType === "Article" && (
                  <div className="space-y-2">
                    <Label>
                      {isScheduling ? "Schedule Publishing Date" : "Publishing Date"}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {publishAt ? format(publishAt, "PPP 'at' p") : "Select date and time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={publishAt}
                          onSelect={setPublishAt}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={publishAt ? format(publishAt, "HH:mm") : ""}
                            onChange={(e) => {
                              if (publishAt && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(publishAt);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setPublishAt(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {!isScheduling && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <div className="relative">
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                          className="w-full p-2 border rounded-lg bg-white"
                          placeholder={`Enter ${contentType} Title...`}
                        />
                        <span className="absolute right-2 top-2 text-sm text-gray-500">
                          {title.length}/100
                        </span>
                      </div>
                    </div>

                    {type === "Visual" && (
                      <div className="space-y-2">
                        <Label>Upload Media</Label>
                        <div className="relative">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, video/mp4, image/gif"
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-50"
                            variant="outline"
                          >
                            Choose File
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            Supported formats: PNG, JPEG, MP4, GIF. Max size: 10MB
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Content</Label>
                      <div className="relative bg-card">
                        <Editor value={content} onChange={setContent} />
                        <span className="absolute right-2 bottom-2 text-sm text-gray-500">
                          {content.length}/{contentType === "Article" ? 5000 : contentCharLimit}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="flex justify-between pt-6">
                <Button variant="outline" onClick={onClose} className="w-[50%]">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="w-[50%]">
                  {isScheduling ? "Schedule" : isEditing ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </div>

            {type === "Visual" && !isScheduling && (
              <div className="flex-1 flex flex-col h-full">
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label className="flex justify-between items-center">
                    <span>Preview</span>
                    {mediaPreviewUrl && (
                      <span
                        className="text-red-500 text-sm cursor-pointer hover:underline flex"
                        onClick={handleRemoveMedia}
                      >
                        <Trash className="h-4 w-4 mr-2 text-[#FF3B30]" />
                        <p>Remove Media</p>
                      </span>
                    )}
                  </Label>
                  <div className="w-full flex-1 border rounded-lg bg-card flex items-center justify-center overflow-hidden">
                    {mediaPreviewUrl ? (
                      mediaFile?.type.startsWith("image/") || 
                      mediaPreviewUrl.endsWith(".png") || 
                      mediaPreviewUrl.endsWith(".jpeg") || 
                      mediaPreviewUrl.endsWith(".gif") ? (
                        <img
                          src={mediaPreviewUrl}
                          alt="Media Preview"
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <video
                          src={mediaPreviewUrl}
                          controls
                          className="object-contain w-full h-full"
                        />
                      )
                    ) : (
                      <div className="text-center flex flex-col items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="70"
                          height="70"
                          fill="none"
                          viewBox="0 0 70 70"
                        >
                          <path
                            fill="#5243FE"
                            d="m64.226 49.058-9.13-21.35c-1.662-3.908-4.141-6.125-6.97-6.27-2.8-.146-5.513 1.808-7.584 5.541l-5.541 9.946c-1.167 2.1-2.83 3.354-4.638 3.5-1.837.175-3.675-.788-5.162-2.683l-.642-.817c-2.071-2.596-4.638-3.85-7.263-3.588-2.625.263-4.87 2.071-6.358 5.017L5.892 48.417c-1.808 3.645-1.633 7.874.496 11.316a11.57 11.57 0 0 0 9.888 5.513h37.216c3.909 0 7.554-1.954 9.713-5.221 2.216-3.267 2.566-7.38 1.02-10.967"
                            opacity="0.4"
                          ></path>
                          <path
                            fill="#5243FE"
                            d="M20.329 24.443c5.444 0 9.858-4.414 9.858-9.858s-4.414-9.858-9.859-9.858c-5.444 0-9.858 4.413-9.858 9.858 0 5.444 4.414 9.858 9.858 9.858"
                          ></path>
                        </svg>
                        <p className="text-[#5243FE]">Content Preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
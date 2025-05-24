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
import { Editor } from "@/components/Editor"; // Assuming your Editor component is correctly implemented

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: string;
    status: string;
    title: string;
    content: string;
    mediaFile?: File | null; // Added optional mediaFile for visual announcements
  }) => void;
}

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSave,
}: CreateAnnouncementModalProps) {
  const [type, setType] = useState("Textual");
  const [status, setStatus] = useState("Draft");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null); // State for the selected media file
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null); // State for the preview URL

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  // Effect to clean up object URL when component unmounts or media changes
  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl]);

  // Reset states when the modal is opened/closed to ensure fresh form
  useEffect(() => {
    if (isOpen) {
      setType("Textual");
      setStatus("Draft");
      setTitle("");
      setContent("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size validation (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        setMediaFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear the file input value
        }
        return;
      }
      setMediaFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input value
    }
  };

  const handleSave = () => {
    const dataToSave = {
      type,
      status,
      title,
      content: content.slice(0, type === "Textual" ? 1000 : 500), // Apply correct content limit
    };

    if (type === "Visual") {
      // Ensure a media file is selected if it's a visual announcement
      if (!mediaFile) {
        alert("Please upload a media file for Visual announcement.");
        return; // Prevent saving if no file is selected for visual type
      }
      onSave({ ...dataToSave, mediaFile }); // Pass mediaFile for visual type
    } else {
      onSave(dataToSave);
    }
    onClose();
  };

  const contentCharLimit = type === "Textual" ? 1000 : 500;

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogOverlay className="backdrop-blur-xs">
        {/* DialogContent remains flexible, auto-adjusting height */}
        <DialogContent
          className={`rounded-lg p-6 transition-all duration-300 ${
            type === "Visual" ? "sm:max-w-[950px]" : "sm:max-w-[571px]"
          }`}
        >
          <DialogHeader className="flex justify-between items-start pb-4">
            <DialogTitle className="text-lg font-semibold">
              Create Announcement
            </DialogTitle>
          </DialogHeader>

          {/* Announcement Type - Always full width */}
          <div className="space-y-2 mb-2">
            <Label>Announcement Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={type === "Textual" ? "default" : "outline"}
                className="rounded-lg"
                onClick={() => {
                  setType("Textual");
                  setMediaFile(null); // Clear media when switching to Textual
                  setMediaPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear file input
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
                  setContent(""); // Optionally clear content when switching to Visual
                }}
              >
                Visual
              </Button>
            </div>
          </div>

          {/* Main Content Area - Conditional layout (flex for visual, block for textual) */}
          {/* Height is determined by the content of its children */}
          <div className={` ${type === "Visual" ? "flex flex-row gap-8" : "block"}`}>
            {/* Left Column (Status, Title, Content, Upload Media, AND MOVED FOOTER) */}
            {/* Added flex flex-col to stack content and footer vertically */}
            <div className={`${type === "Visual" ? "flex-1 flex flex-col" : "w-full"}`}>
              {/* This div wraps the form fields and takes remaining vertical space */}
              <div className="space-y-6 flex-1 overflow-y-auto"> 
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border rounded-lg text-gray-700 bg-card"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Publish Immediately">Publish Immediately</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <div className="relative">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                      className="w-full p-2 border rounded-lg bg-white"
                      placeholder="Enter Title..."
                    />
                    <span className="absolute right-2 top-2 text-sm text-gray-500">
                      {title.length}/100
                    </span>
                  </div>
                </div>

                {/* Upload Media - Conditionally rendered within the LEFT column */}
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
                            <p className="text-sm text-gray-500 mt-2">Supported formats: PNG, JPEG, MP4, GIF. Max size: 10MB</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                  <Label>Content</Label>
                  <div className="relative bg-card">
                    <Editor value={content} onChange={setContent} />
                    <span className="absolute right-2 bottom-2 text-sm text-gray-500">
                      {content.length}/{contentCharLimit}
                    </span>
                  </div>
                </div>
              </div> {/* End of flex-1 overflow-y-auto wrapper for form fields */}

              {/* DialogFooter - MOVED HERE, inside the left column */}
              {/* The pt-6 provides spacing from the content above */}
              <DialogFooter className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-[50%]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="w-[50%]"
                >
                  Save
                </Button>
              </DialogFooter>
            </div> {/* End of Left Column */}

            {/* Right Column (ONLY Preview) - Only for Visual */}
            {/* flex-1 for width, flex flex-col h-full to match left column's height */}
            {type === "Visual" && (
              <div className="flex-1 flex flex-col h-full"> 
                {/* Inner wrapper takes remaining height, is flex column */}
                <div className="space-y-2 flex-1 flex flex-col"> 
                  <Label className="flex justify-between items-center">
                    <span>Preview</span>
                    {mediaFile && (
                      <span
                        className="text-red-500 text-sm cursor-pointer hover:underline"
                        onClick={handleRemoveMedia}
                      >
                        Remove Media
                      </span>
                    )}
                  </Label>
                  {/* Preview box fills remaining space dynamically */}
                  <div className="w-full flex-1 border rounded-lg bg-card flex items-center justify-center overflow-hidden">
                    {mediaPreviewUrl ? (
                      mediaFile?.type.startsWith("image/") ? (
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
                      <div className="text-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-10 h-10 mx-auto"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5 1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                        <p>Content Preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div> {/* End of Main Content Area (columns) */}
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
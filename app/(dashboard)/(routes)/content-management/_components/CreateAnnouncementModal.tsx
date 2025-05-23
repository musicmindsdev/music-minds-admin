"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: string;
    status: string;
    title: string;
    content: string;
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

  const handleSave = () => {
    onSave({ type, status, title, content });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="backdrop-blur-xs">
                  <DialogContent className="sm:max-w-[571px] bg-card  rounded-lg p-6">
        <DialogHeader className="flex justify-between items-start pb-4">
          <DialogTitle className="text-lg font-semibold ">Create Announcement</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Announcement Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={type === "Textual" ? "default" : "outline"}
                className="rounded-lg"
                onClick={() => setType("Textual")}
              >
                Textual
              </Button>
              <Button
                variant={type === "Visual" ? "default" : "outline"}
                  className="rounded-lg"
                onClick={() => setType("Visual")}
              >
                Visual
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white text-gray-700"
            >
              <option value="Draft">Draft</option>
              <option>Publish Immediately</option>
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
          <div className="space-y-2">
            <Label>Content</Label>
            <div className="relative">
              <div className="flex mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.execCommand("bold", false, "")}
                  className="mr-2"
                >
                  <b>B</b>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.execCommand("italic", false, "")}
                  className="mr-2"
                >
                  <i>I</i>
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                className="w-full p-2 border rounded-lg bg-white h-32"
                placeholder="Enter text..."
                contentEditable
              />
              <span className="absolute right-2 bottom-2 text-sm text-gray-500">
                {content.length}/1000
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between ">
          <Button variant="outline" onClick={onClose} className="w-[50%]">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-[50%]">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
      </DialogOverlay>

    </Dialog>
  );
}
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
import { Trash } from "lucide-react";

interface CreateContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        type: string;
        status: string;
        title: string;
        content: string;
        mediaFile?: File | null;
    }) => void;
    contentType: "Announcement" | "Article"; // Determines the context (Announcement or Article)
}

export default function CreateContentModal({
    isOpen,
    onClose,
    onSave,
    contentType,
}: CreateContentModalProps) {
    const [type, setType] = useState("Textual");
    const [status, setStatus] = useState("Draft");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (mediaPreviewUrl) {
                URL.revokeObjectURL(mediaPreviewUrl);
            }
        };
    }, [mediaPreviewUrl]);

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
            if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB limit.");
                setMediaFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
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
            fileInputRef.current.value = '';
        }
    };

    const handleSave = () => {
        const dataToSave = {
            type,
            status,
            title,
            content: content.slice(0, type === "Textual" ? 1000 : 500),
        };

        if (type === "Visual") {
            if (!mediaFile) {
                alert(`Please upload a media file for ${contentType} (Visual type).`);
                return;
            }
            onSave({ ...dataToSave, mediaFile });
        } else {
            onSave(dataToSave);
        }
        onClose();
    };

    const contentCharLimit = type === "Textual" ? 1000 : 500;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="backdrop-blur-xs">
                <DialogContent
                    className={`rounded-lg p-6 transition-all duration-300 ${type === "Visual" ? "sm:max-w-[950px]" : "sm:max-w-[571px]"}`}
                >
                    <DialogHeader className="flex justify-between items-start pb-4">
                        <DialogTitle className="text-lg font-semibold">
                            Create {contentType}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2 mb-2">
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
                                        fileInputRef.current.value = '';
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

                    <div className={`${type === "Visual" ? "flex flex-row gap-8" : "block"}`}>
                        <div className={`${type === "Visual" ? "flex-1 flex flex-col" : "w-full"}`}>
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
                            </div>
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
                        </div>

                        {type === "Visual" && (
                            <div className="flex-1 flex flex-col h-full">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <Label className="flex justify-between items-center">
                                        <span>Preview</span>
                                        {mediaFile && (
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
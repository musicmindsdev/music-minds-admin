"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    messageType: string;
    status: string;
    recipientType: string;
    title: string;
    message: string;
  }) => void;
}

export default function SendMessageModal({ isOpen, onClose, onSave }: SendMessageModalProps) {
  const [messageType, setMessageType] = useState("Push Notification");
  const [status, setStatus] = useState("Draft");
  const [recipientType, setRecipientType] = useState("All Users");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = () => {
    onSave({ messageType, status, recipientType, title, message });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[571px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Send Broadcast Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-light mb-2">Message Type</p>
            <div className="flex space-x-2">
              <Button
                variant={messageType === "Push Notification" ? "default" : "outline"}
                className={`rounded-md px-3 py-1 text-sm `}
                onClick={() => setMessageType("Push Notification")}
              >
                Push Notification
              </Button>
              <Button
                variant={messageType === "Emergency Notification" ? "default" : "outline"}
                className={`rounded-md px-3 py-1 text-sm `}
                onClick={() => setMessageType("Emergency Notification")}
              >
                Emergency Notification
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-light mb-2">Status</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded-md text-sm bg-input "
            >
              <option value="Draft">Draft</option>
              <option value="Send Now">Send Now</option>
              <option value="Schedule">Schedule</option>
            </select>
          </div>
          <div>
            <p className="text-xs font-light mb-2">Recipients</p>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="w-full p-2 border rounded-md text-sm bg-input"
            >
              <option value="All Users">All Users</option>
              <option value="Clients">Clients</option>
              <option value="Service Providers">Service Providers</option>
            </select>
          </div>
          <div>
            <p className="text-xs font-light mb-2">Title</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))} // Limit to 100 characters
              placeholder="Enter a concise title for the message..."
              className="w-full p-2 border rounded-md text-sm bg-input "
            />
            <p className="text-xs text-right ">{title.length}/100</p>
          </div>
          <div>
            <p className="text-xs font-light mb-2">Message</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))} // Limit to 500 characters
              placeholder="Keep the message short and clear..."
              className="w-full p-2 border rounded-md text-sm bg-input  h-24 resize-none"
            />
            <p className="text-xs text-right ">{message.length}/500</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className="w-[120px] "
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="w-[120px] "
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
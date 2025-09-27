"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define types directly in the component file
interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: 'PUSH_NOTIFICATION' | 'IN_APP_NOTIFICATION' | 'EMAIL' | 'SMS';
  recipientsType: 'ALL_USERS' | 'SPECIFIC_USERS' | 'FILTERED_USERS';
  specificUsers?: string[];
  userFilters?: {
    roles?: string[];
    countries?: string[];
    lastLoginDays?: number;
  };
  isEmergency: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED' | 'FAILED';
  sendAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateBroadcastData {
  title: string;
  message: string;
  type: 'PUSH_NOTIFICATION' | 'IN_APP_NOTIFICATION' | 'EMAIL' | 'SMS';
  recipientsType: 'ALL_USERS' | 'SPECIFIC_USERS' | 'FILTERED_USERS';
  specificUsers?: string[];
  userFilters?: {
    roles?: string[];
    countries?: string[];
    lastLoginDays?: number;
  };
  isEmergency: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  sendAt?: string;
  status: 'DRAFT' | 'SCHEDULED';
}

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateBroadcastData) => void;
  editBroadcast?: Broadcast | null;
  isEditing?: boolean;
}

const typeOptions = [
  { value: 'PUSH_NOTIFICATION', label: 'Push Notification' },
  { value: 'IN_APP_NOTIFICATION', label: 'In-App Notification' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' }
];

const recipientsTypeOptions = [
  { value: 'ALL_USERS', label: 'All Users' },
  { value: 'SPECIFIC_USERS', label: 'Specific Users' },
  { value: 'FILTERED_USERS', label: 'Filtered Users' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' }
];

export default function SendMessageModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editBroadcast = null,
  isEditing = false 
}: SendMessageModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<CreateBroadcastData['type']>('PUSH_NOTIFICATION');
  const [recipientsType, setRecipientsType] = useState<CreateBroadcastData['recipientsType']>('ALL_USERS');
  const [isEmergency, setIsEmergency] = useState(false);
  const [priority, setPriority] = useState<CreateBroadcastData['priority']>('NORMAL');
  const [sendAt, setSendAt] = useState("");
  const [status, setStatus] = useState<CreateBroadcastData['status']>('DRAFT');

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditing && editBroadcast) {
      setTitle(editBroadcast.title);
      setMessage(editBroadcast.message);
      setType(editBroadcast.type);
      setRecipientsType(editBroadcast.recipientsType);
      setIsEmergency(editBroadcast.isEmergency);
      setPriority(editBroadcast.priority);
      setSendAt(editBroadcast.sendAt || '');
      setStatus(editBroadcast.status as 'DRAFT' | 'SCHEDULED');
    } else {
      // Reset form when creating new broadcast
      setTitle("");
      setMessage("");
      setType('PUSH_NOTIFICATION');
      setRecipientsType('ALL_USERS');
      setIsEmergency(false);
      setPriority('NORMAL');
      setSendAt("");
      setStatus('DRAFT');
    }
  }, [isEditing, editBroadcast, isOpen]);

  const handleSave = () => {
    const broadcastData: CreateBroadcastData = {
      title,
      message,
      type,
      recipientsType,
      isEmergency,
      priority,
      status,
      ...(sendAt && { sendAt: new Date(sendAt).toISOString() })
    };

    onSave(broadcastData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = title.trim() && message.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[600px] rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isEditing ? "Edit Broadcast Message" : "Create Broadcast Message"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder="Enter broadcast title..."
              className="w-full mt-1"
            />
            <p className="text-xs text-right text-gray-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Enter broadcast message..."
              className="w-full p-2 border rounded-md text-sm h-24 resize-none mt-1"
            />
            <p className="text-xs text-right text-gray-500 mt-1">{message.length}/500</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as CreateBroadcastData['type'])}
                className="w-full p-2 border rounded-md text-sm mt-1"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="recipientsType">Recipients</Label>
              <select
                id="recipientsType"
                value={recipientsType}
                onChange={(e) => setRecipientsType(e.target.value as CreateBroadcastData['recipientsType'])}
                className="w-full p-2 border rounded-md text-sm mt-1"
              >
                {recipientsTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as CreateBroadcastData['priority'])}
                className="w-full p-2 border rounded-md text-sm mt-1"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="isEmergency"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isEmergency">Emergency Broadcast</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CreateBroadcastData['status'])}
                className="w-full p-2 border rounded-md text-sm mt-1"
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Schedule</option>
              </select>
            </div>

            {status === 'SCHEDULED' && (
              <div>
                <Label htmlFor="sendAt">Schedule Date & Time</Label>
                <Input
                  id="sendAt"
                  type="datetime-local"
                  value={sendAt}
                  onChange={(e) => setSendAt(e.target.value)}
                  className="w-full mt-1"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid}
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
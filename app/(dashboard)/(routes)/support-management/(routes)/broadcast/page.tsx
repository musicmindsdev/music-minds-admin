"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import { Card, CardContent } from "@/components/ui/card";
import ExportModal from "@/components/ExportModal";
import BroadcastMessagesTable, { Broadcast } from "../../_components/BroadcastMessagesTable";
import { AiOutlineMessage } from "react-icons/ai";
import SendMessageModal from "../../_components/SendMessageModal";

// Define CreateBroadcastData interface directly here
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

// Available broadcast types from API
const broadcastTypes = [
  { value: "ALL", label: "All Types" },
  { value: "PUSH_NOTIFICATION", label: "Push Notification" },
  { value: "IN_APP_NOTIFICATION", label: "In-App Notification" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" }
];

export default function BroadcastMessagesPage() {
  const [activeTab, setActiveTab] = useState("PUSH_NOTIFICATION");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingBroadcast, setEditingBroadcast] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [broadcast, ] = useState<Broadcast[]>([]);


  const handleSaveBroadcast = async (data: CreateBroadcastData) => {
    try {
      const url = isEditing && editingBroadcast 
        ? `/api/broadcasts/${editingBroadcast.id}`
        : '/api/broadcasts';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} broadcast`);
      }

      console.log(isEditing ? "Broadcast updated successfully" : "Broadcast created successfully");
      
      // Refresh the table
      setRefreshKey(prev => prev + 1);
      
      // Close modal and reset state
      handleCloseModal();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} broadcast:`, error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditBroadcast = (broadcast: any) => {
    setEditingBroadcast(broadcast);
    setIsEditing(true);
    setIsSendMessageModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSendMessageModalOpen(false);
    setEditingBroadcast(null);
    setIsEditing(false);
  };

  const handleNewBroadcast = () => {
    setEditingBroadcast(null);
    setIsEditing(false);
    setIsSendMessageModalOpen(true);
  };

  return (
    <div>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg text-gray-700">Broadcast Messages</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={handleNewBroadcast}
            >
              <AiOutlineMessage className="mr-2" />
              <span className="hidden md:inline">Create Broadcast</span>
            </Button>
            <Button
              className="flex items-center space-x-2"
              onClick={() => setIsExportModalOpen(true)}
            >
              <CiExport className="mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Tabs based on API types */}
        <div className="flex space-x-2 border border-b-0 mb-0 px-2 pt-2 rounded-t-lg bg-card">
          {broadcastTypes.map((type) => (
            <Button
              key={type.value}
              variant={"ghost"}
              className={`px-4 rounded-none ${
                activeTab === type.value ? "border-b border-[#5243FE] text-[#5243FE]" : ""
              }`}
              onClick={() => setActiveTab(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>

        <Card className="rounded-none mt-0">
          <CardContent>
            <BroadcastMessagesTable
              showCheckboxes={true}
              showPagination={true}
              activeTab={activeTab}
              onEdit={handleEditBroadcast}
              refreshKey={refreshKey}
            />
          </CardContent>
        </Card>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Broadcast Data"
         data={broadcast}
        dataType="Broadcast"
        statusFilters={[
          { label: "All", value: "All" },
          { label: "Draft", value: "DRAFT" },
          { label: "Scheduled", value: "SCHEDULED" },
          { label: "Sending", value: "SENDING" },
          { label: "Sent", value: "SENT" },
          { label: "Cancelled", value: "CANCELLED" },
          { label: "Failed", value: "FAILED" },
        ]}
        messageTypeFilters={broadcastTypes.filter(t => t.value !== 'ALL')}
        recipientTypeFilters={[
          { label: "All Users", value: "ALL_USERS" },
          { label: "Specific Users", value: "SPECIFIC_USERS" },
          { label: "Filtered Users", value: "FILTERED_USERS" },
        ]}
        priorityFilters={[
          { label: "Low", value: "LOW" },
          { label: "Normal", value: "NORMAL" },
          { label: "High", value: "HIGH" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Broadcast ID", value: "id" },
          { label: "Title", value: "title" },
          { label: "Message", value: "message" },
          { label: "Type", value: "type" },
          { label: "Status", value: "status" },
          { label: "Recipients Type", value: "recipientsType" },
          { label: "Priority", value: "priority" },
          { label: "Emergency", value: "isEmergency" },
          { label: "Created Date", value: "createdAt" },
          { label: "Scheduled Date", value: "sendAt" },
        ]}
      />

      <SendMessageModal
        isOpen={isSendMessageModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBroadcast}
        editBroadcast={editingBroadcast}
        isEditing={isEditing}
      />
    </div>
  );
}
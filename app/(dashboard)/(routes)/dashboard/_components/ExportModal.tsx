"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CiUser } from "react-icons/ci";
import { LuCalendarClock } from "react-icons/lu";
import { TbReceipt } from "react-icons/tb";
import { TbTicket } from "react-icons/tb";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [dataType, setDataType] = useState("Users");
  const [startDate, setStartDate] = useState("2025-04-01");
  const [endDate, setEndDate] = useState("2025-04-19");
  const [format, setFormat] = useState("CSV");

  const dataTypes = [
    { name: "Users", icon: <CiUser className="w-5 h-5" /> },
    { name: "Bookings", icon: <LuCalendarClock className="w-5 h-5" /> },
    { name: "Transactions", icon: <TbReceipt className="w-5 h-5" /> },
    { name: "Support Tickets", icon: <TbTicket className="w-5 h-5" /> },
  ];

  const handleExport = () => {
    // Placeholder for export functionality
    console.log(`Exporting ${dataType} data from ${startDate} to ${endDate} in ${format} format`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[571px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Export Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Data Type Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Data Type</p>
            <div className="flex flex-wrap gap-2">
              {dataTypes.map((type) => (
                <Button
                  key={type.name}
                  variant={dataType === type.name ? "default" : "outline"}
                  className={`rounded-md px-3 py-1 text-sm flex items-center gap-2 ${
                    dataType === type.name ? "text-white" : "text-gray-700"
                  }`}
                  onClick={() => setDataType(type.name)}
                >
                  {type.icon}
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Date Range</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm bg-input"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm bg-input"
                />
              </div>
            </div>
          </div>

          {/* Format Selection and Export Button */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 border p-1 rounded-md bg-input">
              {["CSV", "Excel"].map((fmt) => (
                <Button
                  key={fmt}
                  variant={format === fmt ? "default" : "ghost"}
                  className={`flex-1 rounded-md text-sm ${
                    format === fmt ? "text-white" : "text-gray-700"
                  }`}
                  onClick={() => setFormat(fmt)}
                >
                  {fmt}
                </Button>
              ))}
            </div>
       

            {/* Export Button */}
            <Button
              onClick={handleExport}
              className="w-[280px] text-white rounded-md"
            >
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
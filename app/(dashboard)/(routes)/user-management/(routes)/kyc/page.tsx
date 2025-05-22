"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import KYCTable from "../../_components/KycTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {  TbUserHexagon, TbUserSquareRounded } from "react-icons/tb";
import { JSX } from "react";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import { RiShieldUserLine } from "react-icons/ri";

type Stats = {
  icon: JSX.Element;
  statNum: string;
  statTitle: string;
  statDuration: JSX.Element;
  statTrend: JSX.Element;
}

const stats: Stats[] = [
  {
    icon: <RiShieldUserLine  className="w-11 h-11 text-[#34C759] bg-[#DEFFE7] p-2 rounded-lg"/>,
    statNum: "450K",
    statTitle: "Total Approved Users",
    statDuration: (
      <Select defaultValue="last30days">
        <SelectTrigger className="text-xs rounded-full">
          <SelectValue placeholder="Last 30 Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1year">1 Year</SelectItem>
          <SelectItem value="6months">6 Months</SelectItem>
          <SelectItem value="3months">3 Months</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="last10days">Last 10 Days</SelectItem>
          <SelectItem value="last24hours">Last 24 Hours</SelectItem>
        </SelectContent>
      </Select>
    ),
    statTrend: <div className="flex gap-1 p-1 text-xs items-center text-end text-[#34C759] bg-[#DEFFE7] rounded-lg"><span>18%</span><FaArrowTrendUp/></div>
  },
  {
    icon: <TbUserHexagon className="w-11 h-11 text-[#FF3B30] bg-[#FEEAE9]  p-2 rounded-lg"/>,
    statNum: "480K",
    statTitle: "Total Submitted KYC",
    statDuration: (
      <Select defaultValue="last30days">
        <SelectTrigger className="text-xs rounded-full">
          <SelectValue placeholder="Last 30 Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1year">1 Year</SelectItem>
          <SelectItem value="6months">6 Months</SelectItem>
          <SelectItem value="3months">3 Months</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="last10days">Last 10 Days</SelectItem>
          <SelectItem value="last24hours">Last 24 Hours</SelectItem>
        </SelectContent>
      </Select>
    ),
    statTrend: <div className="flex gap-1 p-1 text-xs items-center text-[#FF3B30] bg-[#FEEAE9] rounded-lg"><span>18%</span><FaArrowTrendDown/></div>
  },
  {
    icon: <TbUserSquareRounded className="w-11 h-11 text-[#5243FE] bg-[#EAE9FF] p-2 rounded-lg"/>,
    statNum: "20K",
    statTitle: "Suspended Users",
    statDuration: (
      <Select defaultValue="last30days">
        <SelectTrigger className="text-xs rounded-full">
          <SelectValue placeholder="Last 30 Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1year">1 Year</SelectItem>
          <SelectItem value="6months">6 Months</SelectItem>
          <SelectItem value="3months">3 Months</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="last10days">Last 10 Days</SelectItem>
          <SelectItem value="last24hours">Last 24 Hours</SelectItem>
        </SelectContent>
      </Select>
    ),
    statTrend: <div className="flex gap-1 p-1 text-xs items-center text-[#34C759] bg-[#DEFFE7] rounded-lg"><span>18%</span><FaArrowTrendUp/></div>
  },
];

export default function KYCPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleExport = (data: {
    statusFilter: Record<string, boolean>;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
  }) => {
    console.log("Exporting KYC data:", data);
    // Add export logic here (e.g., generate CSV/JSON)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-light">KYC Overview</h2>
        <Button
          className="text-white flex items-center space-x-2"
          onClick={() => setIsExportModalOpen(true)}
        >
          <CiExport className="mr-2" />
          <span className="hidden md:inline">Export Data</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="flex items-center justify-between px-3">
              <div className="flex items-center gap-4">
                {stat.icon}
                <div>
                  <CardTitle className="text-2xl font-bold">{stat.statNum}</CardTitle>
                  <p className="text-xs font-light">{stat.statTitle}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div>{stat.statDuration}</div>
                <div className="self-end">{stat.statTrend}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-none">
        <CardContent>
          <KYCTable
            showCheckboxes={true}
            showPagination={true}
          />
        </CardContent>
      </Card>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        statusFilters={[
          { label: "Approved", value: "Approved" },
          { label: "Submitted", value: "Submitted" },
          { label: "Declined", value: "Declined" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "User ID", value: "User ID" },
          { label: "Name", value: "Name" },
          { label: "Email", value: "Email" },
          { label: "KYC Status", value: "KYC Status" },
          { label: "Submitted Date", value: "Submitted Date" },
        ]}
        onExport={handleExport}
      />
    </div>
  );
}
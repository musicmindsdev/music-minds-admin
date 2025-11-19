"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import KYCTable, { KYC } from "../../_components/KycTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TbUserHexagon, TbUserSquareRounded } from "react-icons/tb";
import { JSX } from "react";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import { RiShieldUserLine } from "react-icons/ri";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  id: string;
  icon: JSX.Element;
  statNum: string | number;
  statTitle: string;
  statDuration: JSX.Element;
  statTrend: JSX.Element;
  loading: boolean;
  error: string | null;
}

interface KYCOverview {
  totals: {
    approved: number;
    rejected: number;
    submitted: number;
    pending: number;
    approvalRate: number;
    rejectionRate: number;
    change: {
      approved: number;
      rejected: number;
      submitted: number;
    };
  };
  timeframes: {
    day: { approved: number; rejected: number; submitted: number };
    week: { approved: number; rejected: number; submitted: number };
    month: { approved: number; rejected: number; submitted: number };
  };
}

export default function KYCPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("month");
  const [, setOverviewData] = useState<KYCOverview | null>(null);
  const [kyc] = useState<KYC[]>([]);
  const [stats, setStats] = useState<Stats[]>([
    {
      id: "approved",
      icon: <RiShieldUserLine className="w-11 h-11 text-[#34C759] bg-[#DEFFE7] p-2 rounded-lg" />,
      statNum: 0,
      statTitle: "Total Approved Users",
      statDuration: (
        <Select value={timeframe} onValueChange={(value: "day" | "week" | "month") => setTimeframe(value)}>
          <SelectTrigger className="text-xs rounded-full">
            <SelectValue placeholder="Last 30 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      ),
      statTrend: <div className="flex gap-1 p-1 text-xs items-center text-end text-[#34C759] bg-[#DEFFE7] rounded-lg"><span>0%</span><FaArrowTrendUp /></div>,
      loading: true,
      error: null,
    },
    {
      id: "submitted",
      icon: <TbUserHexagon className="w-11 h-11 text-[#FF3B30] bg-[#FEEAE9] p-2 rounded-lg" />,
      statNum: 0,
      statTitle: "Total Submitted KYC",
      statDuration: (
        <Select value={timeframe} onValueChange={(value: "day" | "week" | "month") => setTimeframe(value)}>
          <SelectTrigger className="text-xs rounded-full">
            <SelectValue placeholder="Last 30 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      ),
      statTrend: <div className="flex gap-1 p-1 text-xs items-center text-[#FF3B30] bg-[#FEEAE9] rounded-lg"><span>0%</span><FaArrowTrendDown /></div>,
      loading: true,
      error: null,
    },
    {
      id: "rejected",
      icon: <TbUserSquareRounded className="w-11 h-11 text-[#5243FE] bg-[#EAE9FF] p-2 rounded-lg" />,
      statNum: 0,
      statTitle: "Rejected Users",
      statDuration: (
        <Select value={timeframe} onValueChange={(value: "day" | "week" | "month") => setTimeframe(value)}>
          <SelectTrigger className="text-xs rounded-full">
            <SelectValue placeholder="Last 30 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      ),
      statTrend: <div className="flex gap-1 p-1 text-xs items-center text-[#34C759] bg-[#DEFFE7] rounded-lg"><span>0%</span><FaArrowTrendUp /></div>,
      loading: true,
      error: null,
    },
  ]);

  const fetchStats = async () => {
    try {
      setStats((prev) =>
        prev.map((stat) => ({ ...stat, loading: true, error: null }))
      );

      const response = await fetch("/api/kyc/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Stats API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch KYC stats (Status: ${response.status})`;
        console.error("Stats API error:", errorData);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Stats API response data:", responseData);
      
      const data: KYCOverview = responseData.data || responseData;
      console.log("Extracted KYC overview data:", data);

      setOverviewData(data);

      // FIXED: Properly map the data to stats
      setStats((prev) =>
        prev.map((stat) => {
          let statNum = 0;
          let trendValue = 0;
          let isPositive = true;

          switch (stat.id) {
            case "approved":
              // Show total approved, not timeframe approved
              statNum = data.totals.approved;
              trendValue = data.totals.change.approved;
              isPositive = trendValue >= 0;
              break;
            case "submitted":
              // Show total submitted, not timeframe submitted
              statNum = data.totals.submitted;
              trendValue = data.totals.change.submitted;
              isPositive = trendValue >= 0;
              break;
            case "rejected":
              // Show total rejected
              statNum = data.totals.rejected;
              trendValue = data.totals.change.rejected;
              isPositive = trendValue >= 0;
              break;
          }

          return {
            ...stat,
            loading: false,
            error: null,
            statNum,
            statTrend: (
              <div
                className={`flex gap-1 p-1 text-xs items-center text-end ${
                  isPositive
                    ? "text-[#34C759] bg-[#DEFFE7]"
                    : "text-[#FF3B30] bg-[#FEEAE9]"
                } rounded-lg`}
              >
                <span>{Math.abs(trendValue)}%</span>
                {isPositive ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
              </div>
            ),
          };
        })
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch KYC stats";
      console.error("Fetch stats error:", err);
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          loading: false,
          error: errorMessage,
        }))
      );
      toast.error(errorMessage);
    }
  };

  const retryStat = (statId: string) => {
    setStats((prev) =>
      prev.map((stat) =>
        stat.id === statId ? { ...stat, loading: true, error: null } : stat
      )
    );
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, [timeframe]);
 
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
        {stats.map((stat) => (
          <Card key={stat.id} className="shadow-sm">
            <CardContent className="flex items-center justify-between px-3">
              {stat.error ? (
                <div className="flex flex-col items-center w-full py-4">
                  <p className="text-red-500 text-sm">{stat.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => retryStat(stat.id)}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    {stat.icon}
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        {stat.loading ? <Skeleton className="h-8 w-16" /> : stat.statNum}
                      </CardTitle>
                      <p className="text-xs font-light">{stat.statTitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>{stat.statDuration}</div>
                    <div className="self-end">
                      {stat.loading ? <Skeleton className="h-6 w-16" /> : stat.statTrend}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-none">
        <CardContent>
          <KYCTable
            showCheckboxes={true}
            showPagination={true}
            onActionComplete={fetchStats}
          />
        </CardContent>
      </Card>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        data={kyc}
        dataType="Kyc"
        statusFilters={[
          { label: "Pending", value: "PENDING" },
          { label: "Under Review", value: "UNDER_REVIEW" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "User ID", value: "id" },
          { label: "Name", value: "name" },
          { label: "Email", value: "email" },
          { label: "KYC Status", value: "kycStatus" },
          { label: "Submitted Date", value: "submittedDate" },
          { label: "Type", value: "type" },
        ]}
      />
    </div>
  );
}
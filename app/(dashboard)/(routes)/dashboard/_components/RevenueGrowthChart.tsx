"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RevenueGrowthData {
  currentRevenue: number;
  previousRevenue: number;
  growthPercentage: number;
  transactions: number;
  averageTransactionValue: number;
  period: string;
  revenueType: string;
}

// Mock data for chart visualization (will be replaced with real data)
const generateMockChartData = (range: string) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  if (range === "7d" || range === "14d" || range === "30d") {
    const numDays = range === "7d" ? 7 : range === "14d" ? 14 : 30;
    return Array.from({ length: numDays }, (_, i) => ({
      label: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 400) + 200,
    }));
  }
  
  return months.map((month) => ({
    label: month,
    revenue: Math.floor(Math.random() * 400) + 200,
  }));
};

export default function RevenueGrowthChart() {
  const [range, setRange] = useState("30d");
  const [revenueType, setRevenueType] = useState("net");
  const [compareWithPrevious, ] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueGrowthData | null>(null);
  const [chartData, setChartData] = useState(generateMockChartData("30d"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueGrowth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        range,
        revenueType,
        compareWithPrevious: compareWithPrevious.toString(),
      });

      const response = await fetch(`/api/charts/revenue?${queryParams.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch revenue growth");
      }

      const data = await response.json();
      console.log("Revenue growth API response:", data);
      console.log("Current revenue value:", data.currentRevenue);
      console.log("Growth percentage:", data.growthPercentage);
      
      setRevenueData(data);
      // Update chart data based on API response
      setChartData(generateMockChartData(range));
    } catch (err) {
      console.error("Error fetching revenue growth:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch revenue growth";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [range, revenueType, compareWithPrevious]);

  useEffect(() => {
    fetchRevenueGrowth();
  }, [fetchRevenueGrowth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatGrowthPercentage = (percentage: number | undefined) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return 'N/A';
    }
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : error ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">Failed to load</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRevenueGrowth}
                className="h-6 text-xs"
              >
                Retry
              </Button>
            </div>
          ) : revenueData ? (
            <div className="flex items-center gap-2">
              {revenueData.growthPercentage !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    revenueData.growthPercentage >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatGrowthPercentage(revenueData.growthPercentage)}
                </span>
              )}
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Select value={revenueType} onValueChange={setRevenueType}>
            <SelectTrigger className="w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gross">Gross</SelectItem>
              <SelectItem value="net">Net</SelectItem>
              <SelectItem value="fees">Fees</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="14d">Last 14 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="180d">Last 180 Days</SelectItem>
              <SelectItem value="365d">Last 365 Days</SelectItem>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="12M">12 Months</SelectItem>
              <SelectItem value="YTD">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-red-500 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchRevenueGrowth}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF00DF" />
                      <stop offset="50%" stopColor="#5243FE" />
                      <stop offset="100%" stopColor="#9F3DF3" />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9F3DF3" stopOpacity={0.2} />
                      <stop offset="30%" stopColor="#FF00DF" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#5243FE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    axisLine={true}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    labelStyle={{ color: "#000" }}
                    itemStyle={{ color: "#5243FE" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#strokeGradient)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, fill: "#5243FE", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {revenueData && compareWithPrevious && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Previous Period</p>
                  <p className="font-semibold">
                    {revenueData.previousRevenue ? formatCurrency(revenueData.previousRevenue) : '$0'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transactions</p>
                  <p className="font-semibold">
                    {revenueData.transactions ? revenueData.transactions.toLocaleString() : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Transaction</p>
                  <p className="font-semibold">
                    {revenueData.averageTransactionValue ? formatCurrency(revenueData.averageTransactionValue) : '$0'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
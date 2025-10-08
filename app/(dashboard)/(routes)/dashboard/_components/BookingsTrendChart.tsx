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

interface BookingTrendsData {
  period: string;
  bookings: number;
  date?: string;
}

interface BookingTrendsResponse {
  data: BookingTrendsData[];
  totalBookings: number;
  averageBookings: number;
  growthPercentage?: number;
  period: string;
}

// Mock data for chart visualization (will be replaced with real data)
const generateMockChartData = (range: string, groupBy: string) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  if (groupBy === "daily") {
    const numDays = range === "last7Days" ? 7 : range === "last30Days" ? 30 : 14;
    return Array.from({ length: numDays }, (_, i) => ({
      period: `Day ${i + 1}`,
      bookings: Math.floor(Math.random() * 400) + 200,
    }));
  }
  
  if (groupBy === "weekly") {
    const numWeeks = range === "last30Days" ? 4 : range === "last90Days" ? 12 : 52;
    return Array.from({ length: numWeeks }, (_, i) => ({
      period: `Week ${i + 1}`,
      bookings: Math.floor(Math.random() * 2000) + 1000,
    }));
  }
  
  // Monthly data
  return months.map((month) => ({
    period: month,
    bookings: Math.floor(Math.random() * 8000) + 4000,
  }));
};

export default function BookingTrendsChart() {
  const [range, setRange] = useState("last30Days");
  const [groupBy, setGroupBy] = useState("daily");
  const [status, setStatus] = useState<string>("all");
  const [bookingData, setBookingData] = useState<BookingTrendsResponse | null>(null);
  const [chartData, setChartData] = useState<BookingTrendsData[]>(generateMockChartData("last30Days", "daily"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        range,
        groupBy,
        ...(status && status !== "all" && { status }), // Only include status if it's not "all"
      });

      const response = await fetch(`/api/charts/booking-trends?${queryParams.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch booking trends");
      }

      const data = await response.json();
      console.log("Booking trends API response:", data);
      
      setBookingData(data);
      
      // Use real data if available, otherwise generate mock data
      if (data.data && data.data.length > 0) {
        setChartData(data.data);
      } else {
        setChartData(generateMockChartData(range, groupBy));
      }
    } catch (err) {
      console.error("Error fetching booking trends:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch booking trends";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        duration: 5000,
      });
      
      // Fallback to mock data on error
      setChartData(generateMockChartData(range, groupBy));
    } finally {
      setLoading(false);
    }
  }, [range, groupBy, status]);

  useEffect(() => {
    fetchBookingTrends();
  }, [fetchBookingTrends]);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
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
          <CardTitle className="text-sm font-medium">Booking Trends</CardTitle>
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : error ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">Failed to load</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookingTrends}
                className="h-6 text-xs"
              >
                Retry
              </Button>
            </div>
          ) : bookingData ? (
            <div className="flex items-center gap-2">
              {bookingData.growthPercentage !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    bookingData.growthPercentage >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatGrowthPercentage(bookingData.growthPercentage)}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Total: {formatNumber(bookingData.totalBookings)} bookings
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7Days">Last 7 Days</SelectItem>
              <SelectItem value="last30Days">Last 30 Days</SelectItem>
              <SelectItem value="last90Days">Last 90 Days</SelectItem>
              <SelectItem value="last365Days">Last 365 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[120px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              <Button variant="outline" size="sm" onClick={fetchBookingTrends}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF00DF" />
                    <stop offset="50%" stopColor="#5243FE" />
                    <stop offset="100%" stopColor="#9F3DF3" />
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9F3DF3" stopOpacity={0.2} />
                    <stop offset="30%" stopColor="#FF00DF" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#5243FE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
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
                  formatter={(value) => [formatNumber(Number(value)), "Bookings"]}
                  labelStyle={{ color: "#000" }}
                  itemStyle={{ color: "#5243FE" }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="url(#strokeGradient)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  activeDot={{ r: 6, fill: "#5243FE", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
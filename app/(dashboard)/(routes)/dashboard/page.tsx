"use client";

import { JSX, useState, useEffect, useCallback } from "react";
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
import { FaRegStar } from "react-icons/fa6";
import { TbCalendarSearch, TbTicket } from "react-icons/tb";
import { CiExport } from "react-icons/ci";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import UserTable from "./_components/UserTable";
import BookingTable from "./_components/BookingTable";
import TransactionTable from "./_components/TransactionTable";
import ExportModal from "./_components/ExportModal";
import TopPerformers from "./_components/TopPerformers";
import ClientTopPerformers from "./_components/ClientTopPerformance";
import ServiceProviderTopPerformers from "./_components/ServiceProvidersTopPerformers";
import { TbUserCheck, TbUserX, TbUserHexagon } from "react-icons/tb";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PiUsersThreeBold } from "react-icons/pi";
import { RiCheckboxMultipleLine } from "react-icons/ri";
import { AiOutlineDollar } from "react-icons/ai";
import { HiOutlineChartBar } from "react-icons/hi2";

type Stats = {
  icon: JSX.Element;
  statNum: string | number;
  statTitle: string;
  statDuration: JSX.Element;
  statTrend: JSX.Element;
};

interface SwiperStats {
  id: string;
  icon: JSX.Element;
  statNum: string | number;
  statTitle: string;
  loading: boolean;
  error: string | null;
}

const stats: Stats[] = [
  {
    icon: <TbUserCheck className="w-11 h-11 text-[#34C759] bg-[#DEFFE7] p-2 rounded-lg" />,
    statNum: "400K",
    statTitle: "Active Users",
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
    statTrend: (
      <div className="flex gap-1 p-1 text-xs items-center text-end text-[#34C759] bg-[#DEFFE7] rounded-lg">
        <span>18%</span>
        <FaArrowTrendUp />
      </div>
    ),
  },
  {
    icon: <TbUserX className="w-11 h-11 text-[#9F3DF3] bg-[#9747FF1A] p-2 rounded-lg" />,
    statNum: "80K",
    statTitle: "Inactive Users",
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
    statTrend: (
      <div className="flex gap-1 p-1 text-xs items-center text-[#FF3B30] bg-[#FEEAE9] rounded-lg">
        <span>18%</span>
        <FaArrowTrendDown />
      </div>
    ),
  },
  {
    icon: <TbUserHexagon className="w-11 h-11 text-[#EBBC00] bg-[#FDF3D9] p-2 rounded-lg" />,
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
    statTrend: (
      <div className="flex gap-1 p-1 text-xs items-center text-[#34C759] bg-[#DEFFE7] rounded-lg">
        <span>18%</span>
        <FaArrowTrendUp />
      </div>
    ),
  },
];

// Mock data for charts and non-Swiper sections
const bookingTrendsData = [
  { month: "Jan", bookings: 600 },
  { month: "Feb", bookings: 500 },
  { month: "Mar", bookings: 700 },
  { month: "Apr", bookings: 400 },
  { month: "May", bookings: 600 },
  { month: "Jun", bookings: 500 },
  { month: "Jul", bookings: 650 },
  { month: "Aug", bookings: 550 },
  { month: "Sep", bookings: 700 },
  { month: "Oct", bookings: 600 },
  { month: "Nov", bookings: 650 },
  { month: "Dec", bookings: 805 },
];

const revenueGrowthData = [
  { month: "Jan", revenue: 500 },
  { month: "Feb", revenue: 400 },
  { month: "Mar", revenue: 600 },
  { month: "Apr", revenue: 350 },
  { month: "May", revenue: 500 },
  { month: "Jun", revenue: 450 },
  { month: "Jul", revenue: 550 },
  { month: "Aug", revenue: 400 },
  { month: "Sep", revenue: 600 },
  { month: "Oct", revenue: 500 },
  { month: "Nov", revenue: 550 },
  { month: "Dec", revenue: 231 },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewType, setViewType] = useState("post");

  const [swiperStats, setSwiperStats] = useState<SwiperStats[]>([
    {
      id: "totalUsers",
      icon: <PiUsersThreeBold className="w-11 h-11 p-2 text-[#0065FF] bg-[#E6F0FF] rounded-lg" />,
      statNum: 0,
      statTitle: "Total Users",
      loading: true,
      error: null,
    },
    {
      id: "totalBookings",
      icon: <RiCheckboxMultipleLine className="w-11 h-11 p-2 text-[#9B0175] bg-[#FFE6F9] rounded-lg" />,
      statNum: 0,
      statTitle: "Successful Bookings",
      loading: true,
      error: null,
    },
    {
      id: "revenueGenerated",
      icon: <AiOutlineDollar className="w-11 h-11 p-2 text-[#003E9C] bg-[#D4E4FD] rounded-lg" />,
      statNum: "$3.5M",
      statTitle: "Revenue Generated",
      loading: false,
      error: null,
    },
    {
      id: "impressions",
      icon: <HiOutlineChartBar className="w-11 h-11 p-2 text-[#9B0175] bg-[#FFE6F9] rounded-lg" />,
      statNum: 0,
      statTitle: "Impressions",
      loading: true,
      error: null,
    },
    {
      id: "pendingBookings",
      icon: <TbCalendarSearch className="w-11 h-11 bg-[#FFFCDC] text-[#EBBC00] p-2 rounded-lg" />,
      statNum: 0,
      statTitle: "Pending",
      loading: true,
      error: null,
    },
    {
      id: "totalPosts",
      icon: <AiOutlineDollar className="w-11 h-11 p-2 text-[#003E9C] bg-[#D4E4FD] rounded-lg" />,
      statNum: 0,
      statTitle: "Total Posts",
      loading: true,
      error: null,
    },
  ]);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const fetchSwiperStats = useCallback(async () => {
    try {
      setSwiperStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          loading: stat.id !== "revenueGenerated", // Skip loading for mocked revenue
          error: null,
        }))
      );

      const apiCalls = [
        fetch("/api/overview/users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/overview/bookings", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/overview/posts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/overview/posts/impressions?range=all", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ];

      const responses = await Promise.all(apiCalls);
      console.log("Swiper API response statuses:", responses.map((r) => r.status));

      const results = await Promise.all(
        responses.map(async (response, index) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: "Failed to parse backend error response",
            }));
            const errorMessage = errorData.error || `Failed to fetch data (Status: ${response.status})`;
            console.error(`Error for API ${index}:`, errorData);
            return { error: errorMessage };
          }
          const data = await response.json();
          console.log(`Response data for API ${index}:`, data);
          return { data: data.data || data };
        })
      );

      setSwiperStats((prev) =>
        prev.map((stat) => {
          if (stat.id === "revenueGenerated") return stat; // Skip mocked revenue
          const indexMap: { [key: string]: number } = {
            totalUsers: 0,
            totalBookings: 1,
            pendingBookings: 1,
            totalPosts: 2,
            impressions: 3,
          };
          const result = results[indexMap[stat.id]];
          if (result.error) {
            return { ...stat, loading: false, error: result.error };
          }
          return {
            ...stat,
            loading: false,
            error: null,
            statNum:
              stat.id === "totalUsers"
                ? formatNumber(result.data.total || 0)
                : stat.id === "totalBookings"
                ? formatNumber(result.data.total || 0)
                : stat.id === "pendingBookings"
                ? formatNumber(result.data.pending || 0)
                : stat.id === "totalPosts"
                ? formatNumber(result.data.total || 0)
                : stat.id === "impressions"
                ? formatNumber(result.data.impressions || 0)
                : stat.statNum,
          };
        })
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats";
      console.error("Fetch Swiper stats error:", err);
      setSwiperStats((prev) =>
        prev.map((stat) =>
          stat.id === "revenueGenerated"
            ? stat
            : { ...stat, loading: false, error: errorMessage }
        )
      );
      toast.error(errorMessage, {
        position: "top-right",
        duration: 5000,
      });
    }
  }, []);

  const retryStat = (statId: string) => {
    setSwiperStats((prev) =>
      prev.map((stat) =>
        stat.id === statId ? { ...stat, loading: true, error: null } : stat
      )
    );
    fetchSwiperStats();
  };

  useEffect(() => {
    fetchSwiperStats();
  }, [fetchSwiperStats]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light">Welcome, Admin</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <FaRegStar className="mr-2" />
            <span className="hidden md:inline">Moderate Reviews</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <TbTicket className="mr-2" />
            <span className="hidden md:inline">Support Tickets</span>
          </Button>
          <Button className="text-white flex items-center space-x-2" onClick={() => setIsExportModalOpen(true)}>
            <CiExport className="mr-2" />
            <span className="hidden md:inline">Export Data</span>
          </Button>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <Swiper
        slidesPerView={1.2}
        spaceBetween={16}
        className="mySwiper"
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      >
        <SwiperSlide>
          <Card className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 border-0">
            {swiperStats.slice(0, 4).map((stat) => (
              <div key={stat.id}>
                <CardContent className="flex gap-2">
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
                      {stat.icon}
                      <CardTitle>
                        <div className="text-2xl font-bold">
                          {stat.loading ? <Skeleton className="h-8 w-16" /> : stat.statNum}
                        </div>
                        <p className="text-xs font-light">{stat.statTitle}</p>
                      </CardTitle>
                    </>
                  )}
                </CardContent>
              </div>
            ))}
          </Card>
        </SwiperSlide>
        <SwiperSlide>
          <Card className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              swiperStats[4], // pendingBookings
              swiperStats[1], // totalBookings
              swiperStats[5], // totalPosts
              swiperStats[3], // impressions
            ].map((stat) => (
              <div key={stat.id}>
                <CardContent className="flex gap-2">
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
                      {stat.icon}
                      <CardTitle>
                        <div className="text-2xl font-bold">
                          {stat.loading ? <Skeleton className="h-8 w-16" /> : stat.statNum}
                        </div>
                        <p className="text-xs font-light">{stat.statTitle}</p>
                      </CardTitle>
                    </>
                  )}
                </CardContent>
              </div>
            ))}
          </Card>
        </SwiperSlide>
      </Swiper>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm border-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Booking Trends</CardTitle>
            <select className="text-sm text-muted-foreground border rounded p-1">
              <option>2023</option>
              <option>2022</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendsData}>
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
                    dataKey="month"
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
                    formatter={(value) => [value, "Bookings"]}
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <select className="text-sm text-muted-foreground border rounded p-1">
              <option>2023</option>
              <option>2022</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueGrowthData}>
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
                    dataKey="month"
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
                    formatter={(value) => [value, "Revenue"]}
                    labelStyle={{ color: "#000" }}
                    itemStyle={{ color: "#5243FE" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#strokeGradient)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    activeDot={{ r: 6, fill: "#5243FE", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex space-x-2 border w-[320px] p-2 rounded-t-lg bg-card border-b-0">
          <Button
            variant={viewType === "post" ? "gradient" : "ghost"}
            className="rounded-full px-4 py-2"
            onClick={() => setViewType("post")}
          >
            Post
          </Button>
          <Button
            variant={viewType === "client" ? "gradient" : "ghost"}
            className="rounded-full px-4 py-2"
            onClick={() => setViewType("client")}
          >
            Client
          </Button>
          <Button
            variant={viewType === "serviceProvider" ? "gradient" : "ghost"}
            className="rounded-full px-4 py-2"
            onClick={() => setViewType("serviceProvider")}
          >
            Service Provider
          </Button>
        </div>
        <Card className="rounded-none">
          <CardHeader>
            {viewType === "post" ? <TopPerformers /> : viewType === "client" ? <ClientTopPerformers /> : <ServiceProviderTopPerformers />}
          </CardHeader>
        </Card>
      </div>

      <div>
        <div className="flex space-x-2 border w-[320px] p-2 rounded-t-lg bg-card border-b-0">
          <Button
            variant={activeTab === "users" ? "gradient" : "ghost"}
            className="rounded-full px-4 py-2"
            onClick={() => setActiveTab("users")}
          >
            Users
          </Button>
          <Button
            variant={activeTab === "bookings" ? "gradient" : "ghost"}
            className="rounded-full px-4 py-2"
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </Button>
          <Button
            variant={activeTab === "transactions" ? "gradient" : "ghost"}
            className="rounded-full px-4 py-2"
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </Button>
        </div>
        <Card className="rounded-none">
          <CardHeader>
            {activeTab === "users" && <UserTable />}
            {activeTab === "bookings" && <BookingTable bookings={[]} />}
            {activeTab === "transactions" && <TransactionTable />}
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
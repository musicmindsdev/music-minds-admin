"use client";

import { useState } from "react";
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
import { TbTicket } from "react-icons/tb";
import { CiExport } from "react-icons/ci";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import UserTable from "./_components/UserTable";
import BookingTable from "./_components/BookingTable";
import TransactionTable from "./_components/TransactionTable";
import ExportModal from "./_components/ExportModal";
import Users from "@/public/users.svg"
import Bookings from "@/public/bookings.svg"
import Revenue from "@/public/revenue.svg"
import Impressions from "@/public/impressions.svg"
import Pending from "@/public/pending.svg"
import Image from "next/image";


// Mock data for stats and charts
const statsData = {
  totalUsers: "500.6K",
  successfulBookings: "1.2K",
  revenueGenerated: "$3.5M",
  impressions: "20M",
  pending: 150,
};

const statsData2 = {
  totalUsers: "600.2K",
  successfulBookings: "1.5K",
  revenueGenerated: "$4.2M",
  impressions: "25M",
  pending: 180,
};

// Updated mock data to approximate the trends in the image
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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
      
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Stats Slider */}
      <Swiper
        slidesPerView={1.2}
        spaceBetween={16}
        className="mySwiper"
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      >
        <SwiperSlide>
          <Card className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Users}
                  alt="Total Users Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData.totalUsers}</div>
                  <p className="text-xs font-light">Total Users</p>
                </CardTitle>
              </CardContent>
            </div>
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Bookings}
                  alt="Bookings Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData.successfulBookings}</div>
                  <p className="text-xs font-light w-full">Successful Bookings</p>
                </CardTitle>
              </CardContent>
            </div>
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Revenue}
                  alt="Revenue Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData.revenueGenerated}</div>
                  <p className="text-xs font-light">Revenue Generated</p>
                </CardTitle>
              </CardContent>
            </div>
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Impressions}
                  alt="Impressions Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData.impressions}</div>
                  <p className="text-xs font-light">Impressions</p>
                </CardTitle>
              </CardContent>
            </div>
          </Card>
        </SwiperSlide>
        <SwiperSlide>
          <Card className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Pending}
                  alt="Pending Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData.pending}</div>
                  <p className="text-xs font-light">Pending</p>
                </CardTitle>
              </CardContent>
            </div>
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Bookings}
                  alt="Bookings Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData2.successfulBookings}</div>
                  <p className="text-xs font-light w-full">Successful Bookings</p>
                </CardTitle>
              </CardContent>
            </div>
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Revenue}
                  alt="Revenue Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData2.revenueGenerated}</div>
                  <p className="text-xs font-light">Revenue Generated</p>
                </CardTitle>
              </CardContent>
            </div>
            <div>
              <CardContent className="flex gap-2">
                <Image
                  src={Impressions}
                  alt="Impressions Icon"
                  className="w-12 h-12"
                />
                <CardTitle>
                  <div className="text-2xl font-bold">{statsData2.impressions}</div>
                  <p className="text-xs font-light">Impressions</p>
                </CardTitle>
              </CardContent>
            </div>
          </Card>
        </SwiperSlide>
      </Swiper>

      {/* Charts */}
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

      {/* Tabs */}
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

        {/* Dynamic Table Component */}
        <Card className="rounded-none">
          <CardHeader>
            {activeTab === "users" && <UserTable />}
            {activeTab === "bookings" && <BookingTable />}
            {activeTab === "transactions" && <TransactionTable />}
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";
import { usersData, bookingsData, transactionsData } from "@/lib/mockData"; // Import mock data

export const Navbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center shadow-sm bg-background">
      <MobileSidebar />
      <NavbarRoutes
        users={usersData}
        bookings={bookingsData.map((booking) => ({
          ...booking,
          status: booking.status as "Confirmed" | "Pending" | "Cancelled",
        }))}
        transactions={transactionsData}
      />
    </div>
  );
};
"use client";

import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";
import { usersData, transactionsData, bookingsData, supportData } from "@/lib/mockData"; // Import mock data

export const Navbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center shadow-sm bg-card">
      <MobileSidebar />
      <NavbarRoutes
        users={usersData}
        bookings={bookingsData}
        transactions={transactionsData}
        supports={supportData}
      />
    </div>
  );
};
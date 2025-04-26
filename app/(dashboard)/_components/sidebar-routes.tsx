"use client";

import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item"; 

const routes = [
    {
      image: "/home.svg",
      label: "Dashboard",
      href: "/dashboard",
      children: [
        {
          label: "Overview",
          href: "/dashboard",
        },
        {
          label: "Notifications",
          href: "/dashboard/notifications",
        },
      ],
    },
    {
      image: "/user-tick.svg",
      label: "User Management",
      href: "/user-management",
      children: [
        {
          label: "All Users",
          href: "/user-management/users",
        },
        {
          label: "Admin Team",
          href: "/user-management/admins",
        },
      ],
    },
    {
      image: "/note-remove.svg",
      label: "Content Management",
      href: "/content-management",
      children: [
        {
          label: "Bookings",
          href: "/content-management/bookings",
        },
        {
          label: "Reviews",
          href: "/content-management/reviews",
        },
        {
          label: "Announcements",
          href: "/content-management/announcements",
        },
      ],
    },
    {
      image: "/message-text.svg",
      label: "Support Management",
      href: "/support-management",
      children: [
        {
          label: "Support Tickets",
          href: "/support-management/tickets",
        },
        {
          label: "Direct Messages",
          href: "/support-management/messages",
        },
        {
          label: "Broadcast Messages",
          href: "/support-management/broadcast",
        },
      ],
    },
    {
      image: "/document-text.svg",
      label: "Knowledge Base",
      href: "/knowledge-base",
      children: [
        {
          label: "Articles",
          href: "/knowledge-base/articles",
        },
      ],
    },
    {
      image: "/setting-2.svg",
      label: "Settings & Security",
      href: "/settings",
      children: [
        {
          label: "General Settings",
          href: "/settings/general",
        },
        {
          label: "Security",
          href: "/settings/security",
        },
        {
          label: "Email Domains",
          href: "/settings/email-domains",
        },
        {
          label: "Audit Logs",
          href: "/settings/audit-logs",
        },
      ],
    },
  ];

export const SidebarRoutes = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          image={route.image}
          label={route.label}
          href={route.href}
          children={route.children}
        />
      ))}
    </div>
  );
};
"use client";

// import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item"; 

const routes = [
    {
      image: "/home.svg",
      label: "Dashboard",
      href: "/dashboard",
      links: [
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
      links: [
        {
          label: "All Users",
          href: "/user-management",
        },
        {
          label: "Admin Team",
          href: "/user-management/admins",
        },
        {
          label: "KYC Overview",
          href: "/user-management/kyc",
        },
      ],
    },
    {
      image: "/note-remove.svg",
      label: "Content Management",
      href: "/content-management",
      links: [
        {
          label: "Bookings",
          href: "/content-management",
        },
        {
          label: "Reviews",
          href: "/content-management/reviews",
        },
        {
          label: "Announcements",
          href: "/content-management/announcements",
        }
      ],
    },
    {
      image: "/message-text.svg",
      label: "Support Management",
      href: "/support-management",
      links: [
        {
          label: "Support Tickets",
          href: "/support-management",
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
      links: [
        {
          label: "Articles",
          href: "/knowledge-base",
        },
      ],
    },
    {
      image: "/setting-2.svg",
      label: "Settings & Security",
      href: "/settings",
      links: [
        {
          label: "General Settings",
          href: "/settings",
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
  // const pathname = usePathname();

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          image={route.image}
          label={route.label}
          href={route.href}
          nested={route.links}
        />
      ))}
    </div>
  );
};
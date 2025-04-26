"use client";

import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item"; 

const routes = [
    {
        image: '/home.svg',
        label: "Dashboard",
        href: "/dashboard",
    },
    {
        image: '/user-tick.svg',
        label: "User Management",
        href: "/user-management",
    },
    {
        image:'/note-remove.svg',
        label: "Content Management",
        href: "/content-management",
    },
    {
        image: '/message-text.svg',
        label: "Support Management",
        href: "/support-management",
    },
    {
        image: '/document-text.svg',
        label: "Knowledge Base",
        href: "/knowledge-base",
    },
    {
        image: '/setting.svg',
        label: "Settings",
        href: "/settings",
    },
    
]

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
               />
            ))}
        </div>
    )
}
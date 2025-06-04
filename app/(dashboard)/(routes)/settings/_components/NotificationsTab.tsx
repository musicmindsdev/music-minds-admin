"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function NotificationsTab() {
  const [notificationSettings, setNotificationSettings] = useState({
    bookingCompleted: true,
    newAdminLogin: false,
    transactionCompleted: false,
    newUserSignUp: true,
    deletesAccount: false,
    criticalAlerts: false,
  });

  const handleToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationCategories = [
    {
      title: "Notifications",
      items: [
        {
          id: "bookingCompleted",
          label: "Booking Completed",
          description: "Get notified when a user finishes the booking flow",
        },
        {
          id: "newAdminLogin",
          label: "New Admin Login",
          description: "Get notified when an admin logs in for the first time",
        },
        {
          id: "transactionCompleted",
          label: "Transaction Completed",
          description: "Get notified when a payout has been sent to service provider",
        },
      ],
    },
    {
      title: "Users",
      items: [
        {
          id: "newUserSignUp",
          label: "New User Sign Up",
          description: "Get notified when a new user signs up",
        },
        {
          id: "deletesAccount",
          label: "Deletes Account",
          description: "Get notified when a user deletes account",
        },
        {
          id: "supportTickets",
          label: "Support Tickets",
          description: "Get notified when a user sends a support ticket",
        },
      ],
    },
    {
      title: "Other Notifications",
      items: [
        {
          id: "criticalAlerts",
          label: "Critical Alerts",
          description: "Get notified when action needing immediate attention are identified in the system",
        },
      ],
    },
  ];

  return (
    <div className="w-full">
      {/* Side-by-Side Notifications and Users */}
      <div className="flex space-x-6 mb-6">
        {/* Notifications Section */}
        <div className="w-1/2">
          <h3 className="text-sm font-semibold mb-4">{notificationCategories[0].title}</h3>
          {notificationCategories[0].items.map((item) => (
            <div key={item.id} className="flex items-center justify-between mb-4 last:mb-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <Switch
                checked={notificationSettings[item.id as keyof typeof notificationSettings]}
                onCheckedChange={() => handleToggle(item.id as keyof typeof notificationSettings)}
                className="data-[state=checked]:bg-[#5243FE] data-[state=unchecked]:bg-gray-200"
              />
            </div>
          ))}
        </div>
        {/* Users Section */}
        <div className="w-1/2">
          <h3 className="text-sm font-semibold mb-4">{notificationCategories[1].title}</h3>
          {notificationCategories[1].items.map((item) => (
            <div key={item.id} className="flex items-center justify-between mb-4 last:mb-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <Switch
                checked={notificationSettings[item.id as keyof typeof notificationSettings]}
                onCheckedChange={() => handleToggle(item.id as keyof typeof notificationSettings)}
                className="data-[state=checked]:bg-[#5243FE] data-[state=unchecked]:bg-gray-200"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Other Notifications Section (Full Width) */}
      <div>
        <h3 className="text-sm font-semibold mb-4">{notificationCategories[2].title}</h3>
        {notificationCategories[2].items.map((item) => (
          <div key={item.id} className="flex items-center justify-between mb-4 last:mb-0">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <Switch
              checked={notificationSettings[item.id as keyof typeof notificationSettings]}
              onCheckedChange={() => handleToggle(item.id as keyof typeof notificationSettings)}
              className="data-[state=checked]:bg-[#5243FE] data-[state=unchecked]:bg-gray-200"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
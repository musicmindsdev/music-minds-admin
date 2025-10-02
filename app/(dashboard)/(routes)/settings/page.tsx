"use client";

import { useState, useEffect } from "react";
import SettingsTabs from "./_components/SettingsTab";

// Helper function to get cookie value and decode it
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

export default function SettingsPage() {
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@musicminds.com",
    role: "Administrator",
    lastLogin: "Apr 19, 2025 • 09:00 AM",
    image: "https://github.com/shadcn.png",
  });

  // Load user data from cookies on mount
  useEffect(() => {
    const userEmail = getCookie('userEmail');
    const userRole = getCookie('userRole');

    if (userEmail && userRole) {
      const nameFromEmail = userEmail.split('@')[0];
      
      setUser(prev => ({
        ...prev,
        email: userEmail,
        role: userRole,
        name: nameFromEmail,
      }));
    } else {
      // Fallback to localStorage
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(prev => ({
            ...prev,
            ...parsedUser,
          }));
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      }
    }
  }, []);

  const handleUpdateName = (newName: string) => {
    setUser((prev) => ({ ...prev, name: newName }));
    // Also update localStorage
    localStorage.setItem("userData", JSON.stringify({ ...user, name: newName }));
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="font-light text-lg">General Settings</h2>
      <SettingsTabs user={user} onUpdateName={handleUpdateName} />
    </div>
  );
}
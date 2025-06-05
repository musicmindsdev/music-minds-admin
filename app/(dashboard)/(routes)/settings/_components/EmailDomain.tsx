"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link } from "lucide-react";
import { TbEdit } from "react-icons/tb";
import { HiOutlineTrash } from "react-icons/hi";
import AddDomainModal from "./AddDomainModal";

export default function EmailDomainTab() {
  const [allowedDomains, setAllowedDomains] = useState<string[]>(["musicminds.com", "yahoo.com"]);
  const [blockedDomains, setBlockedDomains] = useState<string[]>(["gmail.com"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Placeholder for API fetch on mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch("/api/email-domains");
        const data = await response.json();
        setAllowedDomains(data.allowedDomains || []);
        setBlockedDomains(data.blockedDomains || []);
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      }
    };
    fetchDomains();
  }, []);

  const handleAddDomain = async (domain: string, isAllowed: boolean) => {
    const trimmedDomain = domain.trim();
    const allDomains = [...allowedDomains, ...blockedDomains];

    if (!trimmedDomain || allDomains.includes(trimmedDomain)) {
      return; // Skip if domain is empty or already exists
    }

    // Placeholder for API call to persist the domain
    try {
      await fetch("/api/add-email-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmedDomain, isAllowed }),
      });

      if (isAllowed) {
        setAllowedDomains((prev) => [...prev, trimmedDomain]);
      } else {
        setBlockedDomains((prev) => [...prev, trimmedDomain]);
      }
    } catch (error) {
      console.error("Failed to add domain:", error);
    }
  };

  const handleDeleteDomain = async (domain: string, isAllowedDomain: boolean) => {
    try {
      await fetch("/api/delete-email-domain", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, isAllowed: isAllowedDomain }),
      });

      if (isAllowedDomain) {
        setAllowedDomains((prev) => prev.filter((d) => d !== domain));
      } else {
        setBlockedDomains((prev) => prev.filter((d) => d !== domain));
      }
    } catch (error) {
      console.error("Failed to delete domain:", error);
    }
  };

  const handleEditDomain = (domain: string, isAllowedDomain: boolean) => {
    console.log(`Editing ${domain}, isAllowed: ${isAllowedDomain}`);
    // Placeholder for edit functionality (e.g., open a modal to edit)
  };

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-sm font-semibold">Email Domains</h3>
            <p className="text-xs text-gray-500">
              Manage allowed email domains for admin accounts
            </p>
          </div>
          <Button className="px-4 py-2 text-sm" onClick={() => setIsModalOpen(true)}>
            Add New Domain
          </Button>
        </div>

        {/* Allowed Domains */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Allowed Domains</h4>
          {allowedDomains.length === 0 ? (
            <p className="text-sm text-gray-500">No allowed domains yet.</p>
          ) : (
            <div className="space-y-2">
              {allowedDomains.map((domain) => (
                <div key={domain} className="flex items-center justify-between">
                  <p className="text-sm flex items-center">
                    <Link className="w-4 h-4 text-gray-500 mr-2" />
                    {domain}
                  </p>
                  <div className="space-x-2 flex gap-2">
                    <a
                      href="#"
                      className="text-blue-600 text-sm flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditDomain(domain, true);
                      }}
                    >
                      Edit <TbEdit className="ml-1" />
                    </a>
                    <a
                      href="#"
                      className="text-red-600 text-sm flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteDomain(domain, true);
                      }}
                    >
                      Delete <HiOutlineTrash className="ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blocked Domains */}
        <div>
          <h4 className="text-sm font-medium mb-2">Blocked Domains</h4>
          {blockedDomains.length === 0 ? (
            <p className="text-sm text-gray-500">No blocked domains yet.</p>
          ) : (
            <div className="space-y-2">
              {blockedDomains.map((domain) => (
                <div key={domain} className="flex items-center justify-between">
                  <p className="text-sm flex items-center">
                    <Link className="w-4 h-4 text-gray-500 mr-2" />
                    {domain}
                  </p>
                  <div className="space-x-2 flex gap-2">
                    <a
                      href="#"
                      className="text-blue-600 text-sm flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditDomain(domain, false);
                      }}
                    >
                      Edit <TbEdit className="ml-1" />
                    </a>
                    <a
                      href="#"
                      className="text-red-600 text-sm flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteDomain(domain, false);
                      }}
                    >
                      Delete <HiOutlineTrash className="ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <AddDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDomain={handleAddDomain}
        existingDomains={{ allowed: allowedDomains, blocked: blockedDomains }}
      />
    </Card>
  );
}
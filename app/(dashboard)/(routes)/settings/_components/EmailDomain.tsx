"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link } from "lucide-react";
import { TbEdit } from "react-icons/tb";
import { HiOutlineTrash } from "react-icons/hi";
import AddDomainModal from "./AddDomainModal";
import { toast } from "sonner";

// Domain interface based on your API structure
interface Domain {
  id: string;
  name: string;
  status: 'allowed' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export default function EmailDomainTab() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // Computed properties for allowed and blocked domains (with safety check)
  const allowedDomains = Array.isArray(domains) ? domains.filter(d => d.status === 'allowed') : [];
  const blockedDomains = Array.isArray(domains) ? domains.filter(d => d.status === 'blocked') : [];

  // Fetch initial data including roles and domains - following InviteAdminModal pattern
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles first - exactly like InviteAdminModal
        const rolesResponse = await fetch("/api/admin/roles");
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(rolesData.roles || []);
          if (rolesData.roles.length > 0) {
            setSelectedRoleId(rolesData.roles[0].id);
          }
        } else {
          console.warn("Failed to fetch roles");
        }

        // Then fetch domains
        const response = await fetch("/api/admin/domains");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure domains is always an array
        const domainsArray = Array.isArray(data.domains) ? data.domains : 
                            Array.isArray(data) ? data : [];
        
        setDomains(domainsArray);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to fetch domains");
        // Set empty array on error to prevent crashes
        setDomains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleAddDomain = async (domain: string, isAllowed: boolean) => {
    const trimmedDomain = domain.trim();

    if (!trimmedDomain) {
      toast.error("Domain cannot be empty");
      return;
    }

    // Check if domain already exists (with safety check)
    const existingDomain = Array.isArray(domains) ? domains.find(d => d.name === trimmedDomain) : null;
    if (existingDomain) {
      toast.error("Domain already exists");
      return;
    }

    try {
      // Use the same logic as InviteAdminModal
      const roleIdToUse = selectedRoleId || (roles.length > 0 ? roles[0].id : null);
      
      if (!roleIdToUse) {
        throw new Error("No role selected or available");
      }

      const response = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          domain: trimmedDomain, 
          roleId: roleIdToUse // Using the same pattern as InviteAdminModal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add domain");
      }

      const responseData = await response.json();
      const newDomainEntry = responseData.domain || {
        id: Date.now().toString(),
        name: trimmedDomain,
        status: isAllowed ? 'allowed' : 'blocked',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add the new domain to the state (with safety check)
      setDomains(prev => Array.isArray(prev) ? [...prev, newDomainEntry] : [newDomainEntry]);
      toast.success("Domain added successfully");
      
    } catch (error) {
      console.error("Failed to add domain:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add domain");
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete domain");
      }

      // Remove domain from state (with safety check)
      setDomains(prev => Array.isArray(prev) ? prev.filter(d => d.id !== domainId) : []);
      toast.success(`Domain "${domainName}" deleted successfully`);
      
    } catch (error) {
      console.error("Failed to delete domain:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete domain");
    }
  };

  const handleEditDomain = (domain: Domain) => {
    console.log(`Editing ${domain.name}, status: ${domain.status}`);
    // You can implement edit functionality here
    // For now, just log the action
    toast.info("Edit functionality coming soon");
  };

  const DomainList = ({ domains: domainList}: { domains: Domain[], type: 'allowed' | 'blocked' }) => (
    <div className="space-y-2">
      {domainList.map((domain) => (
        <div key={domain.id} className="flex items-center justify-between">
          <p className="text-sm flex items-center">
            <Link className="w-4 h-4 text-gray-500 mr-2" />
            {domain.name}
          </p>
          <div className="space-x-2 flex gap-2">
            <a
              href="#"
              className="text-blue-600 text-sm flex items-center"
              onClick={(e) => {
                e.preventDefault();
                handleEditDomain(domain);
              }}
            >
              Edit <TbEdit className="ml-1" />
            </a>
            <a
              href="#"
              className="text-red-600 text-sm flex items-center"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDomain(domain.id, domain.name);
              }}
            >
              Delete <HiOutlineTrash className="ml-1" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="">
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading domains...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <DomainList domains={allowedDomains} type="allowed" />
          )}
        </div>

        {/* Blocked Domains */}
        <div>
          <h4 className="text-sm font-medium mb-2">Blocked Domains</h4>
          {blockedDomains.length === 0 ? (
            <p className="text-sm text-gray-500">No blocked domains yet.</p>
          ) : (
            <DomainList domains={blockedDomains} type="blocked" />
          )}
        </div>
      </CardContent>
      
      <AddDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDomain={handleAddDomain}
        existingDomains={{ 
          allowed: allowedDomains.map(d => d.name), 
          blocked: blockedDomains.map(d => d.name) 
        }}
      />
    </Card>
  );
}
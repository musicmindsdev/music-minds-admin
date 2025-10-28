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
  domain: string;
  roleId: string;
  createdAt: string;
  createdById: string;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  status: 'allowed' | 'blocked';
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
        
        console.log("🔄 Starting to fetch roles...");
        
        // Fetch roles first - exactly like InviteAdminModal
        const rolesResponse = await fetch("/api/admin/roles");
        console.log("📊 Roles response status:", rolesResponse.status);
        
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          console.log("✅ Roles data received:", rolesData);
          setRoles(rolesData.roles || []);
          if (rolesData.roles && rolesData.roles.length > 0) {
            setSelectedRoleId(rolesData.roles[0].id);
            console.log("🎯 Selected role ID:", rolesData.roles[0].id);
          }
        } else {
          console.warn("❌ Failed to fetch roles, status:", rolesResponse.status);
          const errorText = await rolesResponse.text();
          console.warn("❌ Roles error response:", errorText);
        }

        console.log("🔄 Starting to fetch domains...");
        
        // Then fetch domains
        const response = await fetch("/api/admin/domains");
        console.log("📊 Domains response status:", response.status);
        console.log("📊 Domains response ok:", response.ok);
        
        if (!response.ok) {
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            console.log(e)
            errorText = "Could not read error response";
          }
          
          console.error("❌ Domains fetch failed:", {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: errorText
          });
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Domains API response:", data);
        
        // Map the backend data to our Domain interface
        const domainsArray = Array.isArray(data.domains) ? data.domains.map((domain: Domain) => ({
          ...domain,
          // Map the domain field to name for display
          name: domain.domain,
          // Derive status from role name
          status: domain.role && domain.role.name === 'BLACKLIST' ? 'blocked' : 'allowed'
        })) : [];
        
        console.log("✅ Mapped domains array:", domainsArray);
        setDomains(domainsArray);
        
      } catch (error) {
        console.error("💥 Failed to fetch initial data:", error);
        
        if (error instanceof Error) {
          if (error.message.includes('401')) {
            toast.error("Authentication failed - please login again");
          } else if (error.message.includes('403')) {
            toast.error("Access denied - insufficient permissions");
          } else if (error.message.includes('404')) {
            toast.error("Domains API endpoint not found");
          } else if (error.message.includes('500')) {
            toast.error("Server error - please try again later");
          } else {
            toast.error("Failed to fetch domains: " + error.message);
          }
        } else {
          toast.error("Failed to fetch domains");
        }
        
        // Set empty array on error to prevent crashes
        setDomains([]);
      } finally {
        setLoading(false);
        console.log("🏁 Loading complete");
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
    const existingDomain = Array.isArray(domains) ? domains.find(d => d.domain === trimmedDomain) : null;
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

      console.log("🔄 Adding domain:", { domain: trimmedDomain, roleId: roleIdToUse });

      const response = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          domain: trimmedDomain, 
          roleId: roleIdToUse
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add domain");
      }

      const responseData = await response.json();
      const newDomainEntry = responseData.domain || {
        id: Date.now().toString(),
        domain: trimmedDomain,
        name: trimmedDomain,
        roleId: roleIdToUse,
        role: {
          id: roleIdToUse,
          name: isAllowed ? 'MODERATOR' : 'BLACKLIST',
          description: '',
          permissions: []
        },
        status: isAllowed ? 'allowed' : 'blocked',
        createdAt: new Date().toISOString(),
        createdById: "current-user"
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
    console.log(`Editing ${domain.domain}, status: ${domain.status}`);
    // You can implement edit functionality here
    // For now, just log the action
    toast.info("Edit functionality coming soon");
  };

  const DomainList = ({ domains: domainList }: { domains: Domain[], type: 'allowed' | 'blocked' }) => (
    <div className="space-y-2">
      {domainList.map((domain) => (
        <div key={domain.id} className="flex items-center justify-between">
          <p className="text-sm flex items-center">
            <Link className="w-4 h-4 text-gray-500 mr-2" />
            {domain.domain}
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
                handleDeleteDomain(domain.id, domain.domain);
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
          allowed: allowedDomains.map(d => d.domain), 
          blocked: blockedDomains.map(d => d.domain) 
        }}
      />
    </Card>
  );
}
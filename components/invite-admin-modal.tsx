"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Trash2, AlertTriangle, Mail, Link, RotateCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

interface InvitedPerson {
  initials: string;
  name: string;
  email: string;
  role: string;
  expiresIn: string;
}

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Add proper typing for domain objects
interface DomainObject {
  id: string;
  domain: string;
}

type Domain = string | DomainObject;

export default function InviteAdminModal({ isOpen, onClose, onSuccess }: InviteAdminModalProps) {
  const [isPublicAccess, setIsPublicAccess] = useState(false);
  // Update the domains state type
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [invitedPeople, setInvitedPeople] = useState<InvitedPerson[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [domainsLoading, setDomainsLoading] = useState(false);

  const user = {
    name: "Admin User",
    email: "admin@musicminds.com",
    role: "Administrator",
    lastLogin: "Apr 19, 2025 • 09:00 AM",
    image: "https://github.com/shadcn.png",
  };

  // Helper function to get domain string
  const getDomainString = (domain: Domain): string => {
    return typeof domain === 'object' ? domain.domain : domain;
  };

  // Helper function to get domain ID
  const getDomainId = (domain: Domain): string => {
    return typeof domain === 'object' ? domain.id : domain;
  };

  // Fetch initial data including roles
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles first
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

        // Fetch domains - handle 404 gracefully
        try {
          setDomainsLoading(true);
          const domainsResponse = await fetch("/api/admin/domains");
          if (domainsResponse.ok) {
            const domainsData = await domainsResponse.json();
            
            let domainsArray: Domain[] = [];
            
            if (Array.isArray(domainsData)) {
              domainsArray = domainsData;
            } 
            else if (domainsData && Array.isArray(domainsData.domains)) {
              domainsArray = domainsData.domains;
            }
            else if (domainsData && typeof domainsData === 'object' && domainsData.domain) {
              domainsArray = [domainsData];
            }
            else if (domainsData && typeof domainsData === 'object' && !domainsData.message) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const values = Object.values(domainsData) as any[];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              domainsArray = values.filter((item: any) => 
                item && (typeof item === 'string' || (typeof item === 'object' && item.domain))
              ) as Domain[];
            }
            
            setDomains(domainsArray);
          } else {
            console.warn("Domains endpoint returned:", domainsResponse.status);
            setDomains([]);
          }
        } catch (error) {
          console.warn("Failed to fetch domains:", error);
          setDomains([]);
        } finally {
          setDomainsLoading(false);
        }

        // Fetch pending invitations
        const invitationsResponse = await fetch("/api/admin/invitations/pending");
        if (invitationsResponse.ok) {
          const invitationsData = await invitationsResponse.json();
          const mappedInvitations = Array.isArray(invitationsData.invitations || invitationsData)
            ?// eslint-disable-next-line @typescript-eslint/no-explicit-any
             (invitationsData.invitations || invitationsData).map((invite: any) => ({
                initials: (invite.email || "").split("@")[0].slice(0, 2).toUpperCase(),
                name: invite.name || (invite.email || "").split("@")[0],
                email: invite.email || "",
                role: invite.role || "Admin",
                expiresIn: "24h",
              }))
            : [];
          setInvitedPeople(mappedInvitations);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) fetchInitialData();
  }, [isOpen]);

  // Add a new domain
  const handleAddDomain = async () => {
    const trimmedDomain = newDomain.trim();
    
    if (!trimmedDomain) {
      toast.error("Please enter a domain");
      return;
    }

    // Basic domain validation
    if (!trimmedDomain.includes('.')) {
      toast.error("Please enter a valid domain");
      return;
    }

    const domainExists = domains.some(domain => getDomainString(domain) === trimmedDomain);
    
    if (trimmedDomain && !domainExists) {
      try {
        setLoading(true);
        
        const roleIdToUse = selectedRoleId || (roles.length > 0 ? roles[0].id : null);
        
        if (!roleIdToUse) {
          throw new Error("No role selected or available");
        }

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
        const newDomainEntry = responseData.domain || trimmedDomain;
        setDomains([...domains, newDomainEntry]);
        setNewDomain("");
        setShowDomainInput(false);
        toast.success("Domain added successfully");
      } catch (error) {
        console.error("Failed to add domain:", error);
        toast.error(error instanceof Error ? error.message : "Failed to add domain");
      } finally {
        setLoading(false);
      }
    } else if (domainExists) {
      toast.error("This domain already exists");
    }
  };

  // Remove a domain
  const handleRemoveDomain = async (domainToRemove: Domain) => {
    try {
      setLoading(true);
      const domainId = getDomainId(domainToRemove);
      const domainString = getDomainString(domainToRemove);
      
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to remove domain");
      }

      setDomains(domains.filter((d) => getDomainString(d) !== domainString));
      toast.success("Domain removed successfully");
    } catch (error) {
      console.error("Failed to remove domain:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove domain");
    } finally {
      setLoading(false);
    }
  };

  // Handle invite members
  const handleInvite = async () => {
    const emails = emailInput.split(",").map((email) => email.trim()).filter(Boolean);
    if (emails.length === 0) return;

    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    const externalEmails = emails.filter((email) => {
      const emailDomain = email.split("@")[1];
      return !domains.some((domain) => {
        const domainString = getDomainString(domain);
        return emailDomain === domainString || email.includes(domainString);
      });
    });

    if (externalEmails.length > 0 && !isPublicAccess) {
      setPendingEmails(emails);
      setShowWarning(true);
    } else {
      await addInvitedPeople(emails);
    }
  };

  // Add invited people after confirmation
  const addInvitedPeople = async (emails: string[]) => {
    try {
      setLoading(true);
      
      // Find the selected role to get its name for display
      const selectedRole = roles.find(role => role.id === selectedRoleId);
      const roleName = selectedRole?.name || "Admin";

      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emails[0],
          name: emails[0].split("@")[0],
          roleId: selectedRoleId, // Use the actual UUID from backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send invitation");
      }

      const newInvitedPerson = {
        initials: emails[0].split("@")[0].slice(0, 2).toUpperCase(),
        name: emails[0].split("@")[0],
        email: emails[0],
        role: roleName,
        expiresIn: "24h",
      };

      setInvitedPeople([...invitedPeople, newInvitedPerson]);
      setEmailInput("");
      setShowWarning(false);
      setPendingEmails([]);
      toast.success("Invitation sent successfully");
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to invite members:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  // Confirm external domain invitation
  const handleConfirmInvite = async () => {
    await addInvitedPeople(pendingEmails);
  };

  // Cancel external domain invitation
  const handleCancelInvite = () => {
    setShowWarning(false);
    setPendingEmails([]);
  };

  // Revoke an invitation
  const handleRevokeInvitation = async (email: string) => {
    try {
      setLoading(true);
      // First get the invitation ID
      const invitationsResponse = await fetch("/api/admin/invitations/pending");
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        const invitationToDelete = Array.isArray(invitationsData.invitations || invitationsData)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (invitationsData.invitations || invitationsData).find((invite: any) => invite.email === email)
          : null;

        if (invitationToDelete) {
          const invitationId = invitationToDelete.id;
          const response = await fetch(`/api/admin/invitations/${invitationId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to revoke invitation");
          }

          setInvitedPeople(invitedPeople.filter((person) => person.email !== email));
          toast.success("Invitation revoked successfully");
        }
      }
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to revoke invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
        <DialogTitle className="text-lg font-semibold">Invite Admin</DialogTitle>
        
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <RotateCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        <div>
          <h3 className="font-medium">Members</h3>
          <p className="text-sm text-gray-500 mb-4">
            Manage the authorization for this workspace
          </p>
        </div>

        {/* Email Domains Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border p-3 rounded-md shadow">
            <div className="flex items-center gap-2">
              {isPublicAccess ? (
                <Mail className="h-7 w-7 text-gray-500 border p-1 rounded-md" />
              ) : (
                <Globe className="h-7 w-7 text-gray-500 border p-1 rounded-md" />
              )}
              <div>
                <span className="text-sm font-medium">
                  {isPublicAccess ? "Email Domains" : "Public Access"}
                </span>
                <p className="text-xs text-gray-500">
                  {isPublicAccess
                    ? "Anyone with email address at these domains are allowed"
                    : "Anyone with email address at these domains are allowed"}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublicAccess}
              onCheckedChange={setIsPublicAccess}
              className="data-[state=checked]:bg-[#5243FE]"
            />
          </div>

          {/* Conditionally render Add Domain section */}
          {isPublicAccess && (
            <>
              {!showDomainInput ? (
                <Button onClick={() => setShowDomainInput(true)} className="w-full" variant="outline" disabled={loading}>
                  Add domain
                </Button>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Add domain (e.g., example.com)"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="pl-10 bg-background"
                      disabled={loading}
                    />
                  </div>
                  <Button onClick={handleAddDomain} disabled={loading}>
                    Add
                  </Button>
                </div>
              )}
              {domainsLoading ? (
                <div className="flex justify-center py-4">
                  <RotateCw className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(domains) && domains.length > 0 ? (
                    domains
                      .filter(domain => {
                        const domainStr = getDomainString(domain);
                        return domainStr && domainStr.trim() !== '' && domainStr !== 'undefined';
                      })
                      .map((domain, index) => {
                        const domainString = getDomainString(domain);
                        return (
                          <div key={`${domainString}-${index}`} className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Link className="w-4 h-4"/>
                              <span className="text-sm font-medium">{domainString}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm rounded-full px-2 py-1">
                                Added by You
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDomain(domain)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No domains added yet.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Invite Members Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium">Invite Members</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="pl-10 pr-28 bg-background"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={loading}>
                  <SelectTrigger className="w-24 border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleInvite} disabled={loading}>
              Invite
            </Button>
          </div>

          {/* Warning for External Domains */}
          {showWarning && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                You&apos;re inviting an admin from an external domain. Are you sure?
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelInvite}
                  disabled={loading}
                >
                  No
                </Button>
                <Button size="sm" onClick={handleConfirmInvite} disabled={loading}>
                  Yes
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Invited People Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium">Invited People</h3>
          {invitedPeople.length === 0 ? (
            <p className="text-sm text-gray-500">No invitations sent yet.</p>
          ) : (
            invitedPeople.map((person) => (
              <div
                key={person.email}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                    {person.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.email}</div>
                    <div className="text-xs text-gray-500">
                      Invitation will expire in {person.expiresIn}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{person.role}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeInvitation(person.email)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
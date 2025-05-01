"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Trash2, AlertTriangle, Mail, Link } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


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
}

export default function InviteAdminModal({ isOpen, onClose }: InviteAdminModalProps) {
  const [isPublicAccess, setIsPublicAccess] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [invitedPeople, setInvitedPeople] = useState<InvitedPerson[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [showWarning, setShowWarning] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<string[]>([]);

  const user = {
    name: "Admin User",
    email: "admin@musicminds.com",
    role: "Administrator",
    lastLogin: "Apr 19, 2025 • 09:00 AM",
    image: "https://github.com/shadcn.png",
  };

  // Fetch initial domains and invited people from a placeholder API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch("/api/initial-invite-data");
        const data = await response.json();
        setDomains(data.domains || []);
        setInvitedPeople(data.invitedPeople || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    if (isOpen) fetchInitialData();
  }, [isOpen]);

  // Add a new domain
  const handleAddDomain = async () => {
    if (newDomain && !domains.includes(newDomain)) {
      try {
        await fetch("/api/add-domain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: newDomain }),
        });
        setDomains([...domains, newDomain]);
        setNewDomain("");
        setShowDomainInput(false); // Hide input after adding
      } catch (error) {
        console.error("Failed to add domain:", error);
      }
    }
  };

  // Remove a domain
  const handleRemoveDomain = async (domain: string) => {
    try {
      await fetch(`/api/remove-domain`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      setDomains(domains.filter((d) => d !== domain));
    } catch (error) {
      console.error("Failed to remove domain:", error);
    }
  };

  // Handle invite members
  const handleInvite = async () => {
    const emails = emailInput.split(",").map((email) => email.trim()).filter(Boolean);
    if (emails.length === 0) return;

    const externalEmails = emails.filter((email) => {
      const emailDomain = email.split("@")[1];
      return !domains.some((domain) => emailDomain === domain || email.includes(domain));
    });

    if (externalEmails.length > 0) {
      setPendingEmails(emails);
      setShowWarning(true);
    } else {
      await addInvitedPeople(emails);
      setEmailInput("");
    }
  };

  // Add invited people after confirmation
  const addInvitedPeople = async (emails: string[]) => {
    const newInvitedPeople = emails.map((email) => {
      const name = email.split("@")[0].split(".").join(" ");
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return {
        initials,
        name: name.replace(/\b\w/g, (char) => char.toUpperCase()),
        email,
        role: selectedRole,
        expiresIn: selectedRole === "Admin" ? "6h" : "12h",
      };
    });

    try {
      await fetch("/api/invite-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, role: selectedRole }),
      });
      setInvitedPeople([...invitedPeople, ...newInvitedPeople]);
    } catch (error) {
      console.error("Failed to invite members:", error);
    }
  };

  // Confirm external domain invitation
  const handleConfirmInvite = async () => {
    await addInvitedPeople(pendingEmails);
    setEmailInput("");
    setShowWarning(false);
    setPendingEmails([]);
  };

  // Cancel external domain invitation
  const handleCancelInvite = () => {
    setShowWarning(false);
    setPendingEmails([]);
  };

  // Revoke an invitation
  const handleRevokeInvitation = async (email: string) => {
    try {
      await fetch(`/api/revoke-invitation`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setInvitedPeople(invitedPeople.filter((person) => person.email !== email));
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm" />
      <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
        <DialogTitle className="text-lg font-semibold">Invite Admin</DialogTitle>
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
                <Button onClick={() => setShowDomainInput(true)} className="w-full" variant="outline">Add domain</Button>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Add domain"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                  <Button onClick={handleAddDomain}>Add</Button>
                </div>
              )}
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div key={domain} className="flex items-center justify-between">
                    <div className="flex gap-2">
                    <Link className="w-4 h-4"/>
                    <span className="text-sm font-medium">{domain}</span>
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
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                placeholder="Emails, comma separated"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="pl-10 pr-28 bg-background"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-24 border-none shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleInvite}>Invite</Button>
          </div>

          {/* Warning for External Domains */}
          {showWarning && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                You’re inviting an admin from an external domain. Are you sure?
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelInvite}
                >
                  No
                </Button>
                <Button size="sm" onClick={handleConfirmInvite}>
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
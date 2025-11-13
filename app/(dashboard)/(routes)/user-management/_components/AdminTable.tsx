"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, EllipsisVertical, Send, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { CiExport } from "react-icons/ci";
import Modal from "@/components/Modal";
import { FaTrash } from "react-icons/fa";
import { Eye } from "lucide-react";
import ExportModal from "@/components/ExportModal";
import { LuUserRoundX } from "react-icons/lu";
import { TbArrowsExchange2 } from "react-icons/tb";
import Pending from "@/public/pending.png";
import Image from "next/image";
import { toast } from "sonner";
import AdminDetailsModal from "./AdminDetailsModal";
import InviteAdminModal from "@/components/invite-admin-modal";
import ChangeRoleModal from "./ChangeRoleModal";
import Loading from "@/components/Loading";

interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  inviteSent: string;
  dateInvited: string;
  dateInviteAccepted: string;
  lastLogin: string;
  status: "Active" | "Inactive";
  image?: string;
  permissions: string[];
  passwordCreated: string;
  lastChanged: string;
}

interface AdminTeamTableProps {
  showCheckboxes?: boolean;
  showExportButton?: boolean;
}

export default function AdminTable({
  showCheckboxes = false,
  showExportButton = true,
}: AdminTeamTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminTeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteAdminModalOpen, setIsInviteAdminModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [adminToChangeRole, setAdminToChangeRole] = useState<AdminTeamMember | null>(null);

  const handleInviteAdmin = () => {
    setIsInviteAdminModalOpen(true);
  };

  // Real API fetch
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: "1",
        limit: "100",
        ...(searchQuery && { search: searchQuery }),
      }).toString();

      console.log("=== FETCHING ADMINS ===");
      console.log("API URL:", `/api/admin?${query}`);

      const response = await fetch(`/api/admin?${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to fetch admins (Status: ${response.status})`
        );
      }

      const data = await response.json();

      // ADD DEBUG LOGGING HERE
      console.log("=== API RESPONSE DATA ===");
      console.log("Full response:", data);
      console.log("Admins array:", data.admins);
      console.log("Admins count:", data.admins?.length);
      if (data.admins && data.admins.length > 0) {
        console.log("First admin sample:", data.admins[0]);
      }

      const mappedAdmins: AdminTeamMember[] = Array.isArray(data.admins)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? data.admins.map((admin: any) => {
          console.log("Processing admin:", admin);

          return {
            id: admin.id || "N/A",
            name: admin.name || admin.username || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'N/A',
            email: admin.email || 'N/A',
            role: admin.role || admin.roles?.[0]?.name || 'N/A',
            inviteSent: admin.createdAt
              ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
              : 'N/A',
            dateInvited: admin.createdAt
              ? new Date(admin.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })
              : 'N/A',
            dateInviteAccepted: admin.lastLoginAt || (admin.updatedAt && admin.updatedAt !== admin.createdAt)
              ? new Date(admin.lastLoginAt || admin.updatedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
              : 'N/A',
            lastLogin: admin.lastLoginAt
              ? new Date(admin.lastLoginAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
              : 'Never logged in',
            // CORRECTED: Use active field for status
            status: admin.active ? "Active" : "Inactive",
            image: admin.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(admin.name || admin.username || admin.email || 'A')}`,
            permissions: admin.roles?.[0]?.permissions || [],
            passwordCreated: admin.createdAt
              ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
              : 'N/A',
            lastChanged: admin.updatedAt
              ? new Date(admin.updatedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
              : 'N/A',
          };
        })
        : [];

      console.log("Mapped admins:", mappedAdmins);
      setMembers(mappedAdmins);

      toast.success(`Loaded ${mappedAdmins.length} admin(s) successfully.`);
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching admin team members"
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    console.log("=== COMPONENT MOUNTED ===");
    console.log("Current members:", members);
    console.log("Current members count:", members.length);

    fetchMembers();
  }, [fetchMembers]);

  // Add state logging
  useEffect(() => {
    console.log("=== STATE UPDATED ===");
    console.log("Members:", members);
    console.log("Members count:", members.length);
    console.log("Filtered members:", filteredMembers);
    console.log("Filtered count:", filteredMembers.length);
  }, [members, searchQuery]);

  const filteredMembers = members.filter(
    (member) =>
      searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers.map((member) => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, memberId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      // Delete each selected admin
      const deletePromises = selectedMembers.map(memberId =>
        fetch(`/api/admin/revoke/${memberId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      const results = await Promise.allSettled(deletePromises);

      // Check if any deletions failed
      const failedDeletes = results.filter(result =>
        result.status === 'rejected' ||
        (result.status === 'fulfilled' && !result.value.ok)
      );

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to remove ${failedDeletes.length} admin(s)`);
      }

      // Remove the deleted admins from local state
      setMembers((prev) => prev.filter((member) => !selectedMembers.includes(member.id)));
      setSelectedMembers([]);
      setIsRemoveModalOpen(false);
      toast.success("Admin(s) removed successfully.");
    } catch (err) {
      console.error("Error removing admins:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while removing admin(s)"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    setLoading(true);
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) throw new Error("Admin not found");

      const response = await fetch(`/api/admin/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: member.email,
          name: member.name,
          roleId: "role-id-here", // You'll need to get the appropriate role ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to resend invite (Status: ${response.status})`
        );
      }

      toast.success(`Invite resent successfully to ${member.email}.`);
    } catch (err) {
      console.error("Error resending invite:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while resending the invite"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvite = async (memberId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/revoke/${memberId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to revoke invite (Status: ${response.status})`
        );
      }

      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      toast.success(`Invite revoked successfully.`);
    } catch (err) {
      console.error("Error revoking invite:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while revoking the invite"
      );
    } finally {
      setLoading(false);
    }
  };

  const openRemoveModal = () => {
    setIsRemoveModalOpen(true);
  };

  const handleViewDetails = (member: AdminTeamMember) => {
    setSelectedAdmin(member);
    setIsModalOpen(true);
  };

  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
  };

  const handleOpenChangeRoleModal = (member: AdminTeamMember) => {
    setAdminToChangeRole(member);
    setIsChangeRoleModalOpen(true);
  };

  const handleChangeRole = (adminId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === adminId
          ? {
            ...member,
            role: newRole,
            permissions:
              newRole === "Super Admin" || newRole === "Admin"
                ? ["Can manage users", "Can manage content", "Can moderate reviews"]
                : newRole === "Support"
                  ? ["Can manage support tickets"]
                  : ["Can moderate reviews"],
          }
          : member
      )
    );
    setIsChangeRoleModalOpen(false);
    setAdminToChangeRole(null);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="font-light text-sm">Admin Team</p>
        <div className="flex space-x-2">
          <Button onClick={handleInviteAdmin} variant="outline" className="text-blue-600">
            Invite Member
          </Button>
          {showExportButton && (
            <Button className="text-white flex items-center space-x-2" onClick={() => setIsExportModalOpen(true)}>
              <CiExport className="mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
          )}
        </div>
      </div>

      <div className="relative mt-4 flex items-center pb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for user by Name, Email or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 p-2 border rounded-lg w-full bg-background"
        />
      </div>

      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 mb-2">
        Showing {filteredMembers.length} of {members.length} total admins
      </div>

      {selectedMembers.length > 0 && (
        <div className="flex justify-end space-x-2 mt-2 p-4">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={openRemoveModal}
            disabled={loading}
          >
            <FaTrash className="h-4 w-4 mr-2 text-red-600" />
            Remove Admin
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loading />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image src={Pending} alt="No members found" className="mx-auto mb-2" />
          <p>No admin team members found.</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead>
                  <Checkbox
                    checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={loading}
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invite Sent</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                      disabled={loading}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${member.role === 'SUPERADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                    {member.role}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{member.inviteSent}</div>
                    <div className="text-xs text-gray-500">at {member.dateInvited}</div>
                  </div>
                </TableCell>
                <TableCell>{member.lastLogin}</TableCell>
                <TableCell>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${member.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    <span className={`h-2 w-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" disabled={loading}>
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.status === "Inactive" ? (
                        <>
                          <DropdownMenuItem onClick={() => handleResendInvite(member.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRevokeInvite(member.id)}
                          >
                            <Ban className="h-4 w-4 mr-2 text-red-600" />
                            Revoke Invite
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenChangeRoleModal(member)}>
                            <TbArrowsExchange2 className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={openRemoveModal}
                          >
                            <LuUserRoundX className="h-4 w-4 mr-2 text-red-600" />
                            Remove Admin
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isRemoveModalOpen}
        onClose={closeRemoveModal}
        title="Removal"
        icon={<FaTrash className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Removing Admin?"
        message="Are you sure you want to remove this admin?"
        cancelText="No, I don't"
        confirmText="Yes, remove"
        confirmButtonColor="#EF4444"
        onConfirm={handleRemove}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Admin Data"
        data={members}
        dataType="Admin"
        fieldOptions={[
          { label: "Name", value: "name" },
          { label: "Email", value: "email" },
          { label: "Role", value: "role" },
          { label: "Status", value: "status" },
          { label: "Last Login", value: "lastLogin" },
          { label: "Invite Sent", value: "inviteSent" },
        ]}
      />
      <InviteAdminModal
        isOpen={isInviteAdminModalOpen}
        onClose={() => setIsInviteAdminModalOpen(false)}
      />

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-[35%] bg-card shadow-lg transform transition-transform duration-300 ease-in-out"
            style={{ transform: isModalOpen ? "translateX(0)" : "translateX(100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminDetailsModal
              isOpen={!!selectedAdmin}
              onClose={() => setSelectedAdmin(null)}
              admin={selectedAdmin ? { ...selectedAdmin, image: selectedAdmin.image || "" } : null}
            />
          </div>
        </div>
      )}

      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        admin={adminToChangeRole ? { ...adminToChangeRole, image: adminToChangeRole.image || "" } : null}
        onChangeRole={handleChangeRole}
      />
    </>
  );
}
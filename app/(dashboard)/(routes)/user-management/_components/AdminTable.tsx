"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, EllipsisVertical, RotateCw, Send, Ban } from "lucide-react";
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
import AdminDetailsModal from "./AdminDetailsModal"; // Adjust the path as needed
import InviteAdminModal from "@/components/invite-admin-modal";
import ChangeRoleModal from "./ChangeRoleModal"; // Adjust the path as needed

interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  inviteSent: string;
  dateInvited: string;
  dateInviteAccepted: string;
  lastLogin: string;
  status: "Online" | "Pending";
  image?: string;
  permissions: string[];
  passwordCreated: string;
  lastChanged: string;
}

const adminTeamData: AdminTeamMember[] = [
  {
    id: "1",
    name: "Daniel Adaeri C.",
    email: "danieladaeri@yahoo.com",
    role: "Super Admin",
    inviteSent: "Wed, Apr 16, 2025",
    dateInvited: "08:45 AM",
    dateInviteAccepted: "08:50 AM",
    lastLogin: "----",
    status: "Pending",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=Daniel",
    permissions: ["Can manage users", "Can manage content", "Can moderate reviews"],
    passwordCreated: "Wed, Apr 16, 2025",
    lastChanged: "Mon, Apr 20, 2025",
  },
  {
    id: "2",
    name: "Michael Ajobi E.",
    email: "michaelajobi@gmail.com",
    role: "Super Admin",
    inviteSent: "Today",
    dateInvited: "N/A",
    dateInviteAccepted: "N/A",
    lastLogin: "Online",
    status: "Online",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=Michael",
    permissions: ["Can manage users", "Can manage content", "Can moderate reviews"],
    passwordCreated: "Today",
    lastChanged: "N/A",
  },
  {
    id: "3",
    name: "Francis Praise",
    email: "francispraisegod@yahoo.com",
    role: "Support",
    inviteSent: "Apr 15, 2025",
    dateInvited: "10:00 AM",
    dateInviteAccepted: "N/A",
    lastLogin: "Online",
    status: "Online",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=Francis",
    permissions: ["Can manage support tickets"],
    passwordCreated: "Apr 15, 2025",
    lastChanged: "N/A",
  },
  {
    id: "4",
    name: "James D. Shola",
    email: "jamesdshola@gmail.com",
    role: "Moderator",
    inviteSent: "Apr 3, 2025",
    dateInvited: "02:30 PM",
    dateInviteAccepted: "N/A",
    lastLogin: "Online",
    status: "Online",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=James",
    permissions: ["Can moderate reviews"],
    passwordCreated: "Apr 3, 2025",
    lastChanged: "N/A",
  },
  {
    id: "5",
    name: "Anitt Adebayo",
    email: "adebayoar@gmail.com",
    role: "Support",
    inviteSent: "Mar 20, 2025",
    dateInvited: "09:15 AM",
    dateInviteAccepted: "N/A",
    lastLogin: "10 mins ago",
    status: "Online",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=Anitt",
    permissions: ["Can manage support tickets"],
    passwordCreated: "Mar 20, 2025",
    lastChanged: "N/A",
  },
  {
    id: "6",
    name: "Amakiri Justina",
    email: "amakirijustin@gmail.com",
    role: "Support",
    inviteSent: "Mar 16, 2025",
    dateInvited: "11:00 AM",
    dateInviteAccepted: "N/A",
    lastLogin: "Online",
    status: "Online",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=Amakiri",
    permissions: ["Can manage support tickets"],
    passwordCreated: "Mar 16, 2025",
    lastChanged: "N/A",
  },
  {
    id: "7",
    name: "Davida Nathan",
    email: "davidaakans@gmail.com",
    role: "Moderator",
    inviteSent: "Feb 28, 2025",
    dateInvited: "01:30 PM",
    dateInviteAccepted: "N/A",
    lastLogin: "Online",
    status: "Online",
    image: "https://api.dicebear.com/6.x/initials/svg?seed=Davida",
    permissions: ["Can moderate reviews"],
    passwordCreated: "Feb 28, 2025",
    lastChanged: "N/A",
  },
];

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

  // Simulated API fetch (replace with actual API call when backend is ready)
  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMembers(adminTeamData);
      toast.success("Admin team members loaded successfully.");
    } /* eslint-disable @typescript-eslint/no-unused-vars */ catch (_err) {
      toast.error("Failed to fetch admin team members.");
    } /* eslint-enable @typescript-eslint/no-unused-vars */ finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
      // Simulate API call to remove admins
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMembers((prev) => prev.filter((member) => !selectedMembers.includes(member.id)));
      setSelectedMembers([]);
      setIsRemoveModalOpen(false);
      toast.success("Admin removed successfully.");
    } /* eslint-disable @typescript-eslint/no-unused-vars */ catch (_err) {
      toast.error("Failed to remove admin.");
    } /* eslint-enable @typescript-eslint/no-unused-vars */ finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    setLoading(true);
    try {
      // Simulate API call to resend invite
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Invite resent successfully to ${memberId}.`);
    } /* eslint-disable @typescript-eslint/no-unused-vars */ catch (_err) {
      toast.error("Failed to resend invite.");
    } /* eslint-enable @typescript-eslint/no-unused-vars */ finally {
      setLoading(false);
    }
  };

  const handleRevokeInvite = async (memberId: string) => {
    setLoading(true);
    try {
      // Simulate API call to revoke invite
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      toast.success(`Invite revoked successfully for ${memberId}.`);
    } /* eslint-disable @typescript-eslint/no-unused-vars */ catch (_err) {
      toast.error("Failed to revoke invite.");
    } /* eslint-enable @typescript-eslint/no-unused-vars */ finally {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExport = (_data: {
    statusFilter: Record<string, boolean>;
    roleFilter: string;
    dateRangeFrom: string;
    dateRangeTo: string;
    format: string;
    fields: Record<string, boolean>;
    adminRole?: string;
  }) => {
    toast.success("Data exported successfully.");
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
          <RotateCw className="animate-spin h-6 w-6 text-blue-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <Image src={Pending} alt="No members found" className="mx-auto mb-2" />
          <p>No admin team members found.</p>
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
                    {member.name}
                  </div>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableHead>{member.role}</TableHead>
                <TableCell>{member.inviteSent}</TableCell>
                <TableCell>{member.lastLogin}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" disabled={loading}>
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.status === "Pending" ? (
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
        title="Export Data"
        tabs={[
          { value: "pendingInvites", label: "Pending Invites" },
          { value: "members", label: "Members" },
        ]}
        defaultTab="members"
        statusFilters={[
          { label: "Online", value: "Online" },
          { label: "Pending", value: "Pending" },
        ]}
        fieldOptions={[
          { label: "Name", value: "Name" },
          { label: "Status", value: "Status" },
          { label: "Email", value: "Email" },
          { label: "Last Activity", value: "Last Activity" },
          { label: "Role", value: "Role" },
        ]}
        adminRoleOptions={[
          { label: "Admin", value: "Admin" },
          { label: "Super Admin", value: "Super Admin" },
          { label: "Support", value: "Support" },
          { label: "Moderator", value: "Moderator" },
        ]}
        onExport={handleExport}
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
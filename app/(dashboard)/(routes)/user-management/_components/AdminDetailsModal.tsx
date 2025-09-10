import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: {
    name: string;
    email: string;
    role: string;
    image: string;
    lastLogin: string;
    inviteSent: string;
    dateInvited: string;
    dateInviteAccepted: string;
    permissions: string[];
    passwordCreated: string;
    lastChanged: string;
  } | null;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({ onClose, admin }) => {
  if (!admin) return null;

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-base font-medium">Admin Details</h2>
        <Button variant="ghost" className="p-0 h-auto" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      {/* Content */}
      <div className="mt-6 space-y-6">
        {/* Admin Information */}
        <div className="space-y-2">
          <p className="text-xs">Admin Information</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={admin.image} alt={admin.name} />
              <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium">{admin.name}</h3>
              <p className="text-xs">{admin.email}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs">Role</p>
          <p className="text-sm font-medium">{admin.role}</p>
        </div>
        {/* Last Login */}
        <div className="space-y-2">
          <p className="text-xs">Last Login</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-xs font-medium">{admin.lastLogin}</p>
          </div>
        </div>
        {/* Invite Information */}
        <div className="space-y-4">
          <h3 className="text-xs">Invite Information</h3>
          <div className="flex gap-2">
            <p className="text-xs">Date Added:</p>
            <p className="text-sm font-medium">{admin.inviteSent}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xs">Time Added:</p>
            <p className="text-sm font-medium">{admin.dateInvited}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xs">Date Invite Accepted:</p>
            <p className="text-sm font-medium">{admin.dateInviteAccepted}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xs">Time Invite Accepted:</p>
            <p className="text-sm font-medium">{admin.dateInvited}</p>
          </div>
        </div>
        {/* Role Permissions */}
        <div className="space-y-4">
          <h3 className="text-xs">Role Permissions</h3>
          <p className="text-sm flex gap-2">Role: <span className="font-medium">{admin.role}</span></p>
          {admin.permissions.map((permission, index) => (
            <div key={index}>
              <ul>
                <li className="text-xs">{permission}</li>
              </ul>
            </div>
          ))}
        </div>
        {/* Login Details */}
        <div className="space-y-4">
          <h3 className="text-xs">Login Details</h3>
          <div className="flex justify-between">
            <div>
              <div className="flex gap-2">
                <p className="text-xs font-medium">Password Created:</p>
                <p className="text-xs">{admin.passwordCreated}</p>
              </div>
              <div className="flex gap-2">
                <p className="text-xs font-medium">Last Changed:</p>
                <p className="text-xs">{admin.lastChanged}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" className="text-xs text-blue-600 border-blue-600 px-2 py-1 h-auto">
                Share
              </Button>
              <Button variant="ghost" className="text-xs text-red-600 border-red-600 px-2 py-1 h-auto">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsModal;
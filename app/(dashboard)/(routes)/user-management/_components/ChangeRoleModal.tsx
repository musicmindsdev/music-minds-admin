// components/ChangeRoleModal.tsx
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminTeamMember | null;
  onChangeRole: (adminId: string, newRole: string) => void;
}

const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  onClose,
  admin,
  onChangeRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(admin?.role || "");

  const handleConfirm = async () => {
    if (!admin || !selectedRole) return;

    try {
      // Simulate API call to change role (uncomment when backend is ready)
      /*
      await fetch(`/api/admins/${admin.id}/change-role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      */

      // Update role in frontend state
      onChangeRole(admin.id, selectedRole);
      toast.success(`Role updated successfully for ${admin.name}.`);
      onClose();
    } catch (err) {
      toast.error("Failed to update role.");
      console.log("Error changing role:", err);
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-tl-lg rounded-tr-lg shadow-lg border border-gray-200">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-medium">Change Role</DialogTitle>
         
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={admin.image} alt={admin.name} />
              <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-gray-500">{admin.email}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Role</label>
            <Input
              value={admin.role}
              disabled
              className="mt-1 bg-gray-100 border-gray-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Role</label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value)}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select New Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-auto">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedRole || selectedRole === admin.role}
            className="bg-blue-600 text-white"
          >
            Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleModal;
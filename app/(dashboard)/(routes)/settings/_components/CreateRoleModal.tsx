"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (roleName: string, permissions: string[]) => void;
  initialRole?: { name: string; permissions: string[] }; // For editing
  isEditMode?: boolean; // Flag to distinguish create/edit
}

export default function CreateRoleModal({
  open,
  onClose,
  onSave,
  initialRole,
  isEditMode = false,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const maxLength = 50;

  useEffect(() => {
    if (isEditMode && initialRole) {
      setRoleName(initialRole.name);
      setPermissions(initialRole.permissions);
    } else {
      setRoleName("");
      setPermissions([]);
    }
  }, [isEditMode, initialRole]);

  const handleSave = () => {
    if (roleName.trim() && permissions.length > 0) {
      onSave(roleName.trim(), permissions);
      onClose();
    }
  };

  const handlePermissionChange = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  };

  const availablePermissions = [
    "Create/Edit Admins",
    "Reset Password",
    "Change Role",
    "View Bookings",
    "Approve/Remove Reviews",
    "Create/Edit/Publish Announcements",
    "Create/Edit/Publish Articles",
    "Respond to Tickets",
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
         <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[425px] bg-card  p-6 ">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Permissions" : "Create New Role"}</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Role Name</label>
            <Input
              placeholder={isEditMode ? "" : 'e.g., "Content Manager"'}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value.slice(0, maxLength))}
              className="mt-1 bg-gray-50"
              disabled={isEditMode}
            />
            {!isEditMode && <span className="text-xs ">{roleName.length}/{maxLength}</span>}
          </div>
          <div>
            <label className="text-sm font-medium">Permissions</label>
            {availablePermissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id={permission}
                  checked={permissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={permission} className="text-sm">
                  {permission}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="border-gray-300 w-[50%]" onClick={onClose}>
            Cancel
          </Button>
          <Button className=" w-[50%]" onClick={handleSave} disabled={!roleName.trim() || permissions.length === 0}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
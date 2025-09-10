"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (roleName: string, permissions: string[], description?: string) => void;
  initialRole?: Role; // Updated to include id and description
  isEditMode?: boolean;
}

export default function CreateRoleModal({
  open,
  onClose,
  onSave,
  initialRole,
  isEditMode = false,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const maxLength = 50;
  const maxDescriptionLength = 200;

  useEffect(() => {
    if (isEditMode && initialRole) {
      setRoleName(initialRole.name);
      setDescription(initialRole.description || "");
      setPermissions(initialRole.permissions);
    } else {
      setRoleName("");
      setDescription("");
      setPermissions([]);
    }
  }, [isEditMode, initialRole, open]);

  const handleSave = () => {
    if (roleName.trim() && permissions.length > 0) {
      onSave(roleName.trim(), permissions, description.trim() || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setRoleName("");
    setDescription("");
    setPermissions([]);
    onClose();
  };

  const handlePermissionChange = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) 
        ? prev.filter((p) => p !== permission) 
        : [...prev, permission]
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
    "Manage Domains",
    "Invite Users",
    "Manage Roles",
    "View Analytics",
    "System Settings"
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[500px] bg-card p-6">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Role Permissions" : "Create New Role"}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Role Name */}
          <div>
            <label className="text-sm font-medium">Role Name</label>
            <Input
              placeholder={isEditMode ? "" : 'e.g., "Content Manager"'}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value.slice(0, maxLength))}
              className="mt-1 bg-gray-50"
              disabled={isEditMode} // Usually you don't want to change role names
            />
            {!isEditMode && (
              <span className="text-xs text-gray-500">
                {roleName.length}/{maxLength}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              placeholder="Brief description of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, maxDescriptionLength))}
              className="mt-1 bg-gray-50"
            />
            <span className="text-xs text-gray-500">
              {description.length}/{maxDescriptionLength}
            </span>
          </div>

          {/* Permissions */}
          <div>
            <label className="text-sm font-medium mb-3 block">Permissions</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2 mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={permission} className="text-sm cursor-pointer">
                    {permission}
                  </label>
                </div>
              ))}
            </div>
            {permissions.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please select at least one permission
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            className="border-gray-300 w-[50%]" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            className="w-[50%]" 
            onClick={handleSave} 
            disabled={!roleName.trim() || permissions.length === 0}
          >
            {isEditMode ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
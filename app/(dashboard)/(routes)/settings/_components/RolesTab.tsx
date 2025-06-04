"use client";

import { GoPlus } from "react-icons/go";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CreateRoleModal from "./CreateRoleModal";
import { FaTrash } from "react-icons/fa";
import Modal from "@/components/Modal";

interface Role {
  name: string;
  permissions: string[];
}

export default function RolesTab() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([
    { name: "Owner", permissions: ["All Actions"] },
    { name: "Super Admin", permissions: ["All Actions except Role Creation"] },
    { name: "Admin", permissions: ["Create & Edit Articles", "Respond to Tickets"] },
    { name: "Support", permissions: ["All Actions except Role Creation"] },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEditPermissions = (roleName: string) => {
    const roleToEdit = roles.find((role) => role.name === roleName);
    if (roleToEdit) {
      setSelectedRole(roleToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRole = (roleName: string) => {
    setRoleToDelete(roleName);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      setRoles((prev) => prev.filter((role) => role.name !== roleToDelete));
    }
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleSaveRole = (roleName: string, permissions: string[]) => {
    if (selectedRole) {
      // Edit existing role
      setRoles((prev) =>
        prev.map((role) =>
          role.name === selectedRole.name ? { name: roleName, permissions } : role
        )
      );
    } else {
      // Create new role
      setRoles((prev) => [...prev, { name: roleName, permissions }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold">Roles & Permissions</h3>
          <p className="text-xs text-gray-500">This defines the roles, hierarchy & access/permission level of all users allowed on the admin panel</p>
        </div>
        <Button className="py-2" onClick={handleCreateRole}>
          <GoPlus className="mr-2" /> Create Role
        </Button>
      </div>

      {/* Roles List */}
      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.name} className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-medium">{role.name}</h4>
              {role.permissions.map((permission, index) => (
                <p key={index} className="text-xs ml-4">{permission}</p>
              ))}
            </div>
            <div className="space-x-2">
              <a
                href="#"
                className="text-blue-600 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  handleEditPermissions(role.name);
                }}
              >
                Edit Permissions
              </a>
              <a
                href="#"
                className="text-red-600 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteRole(role.name);
                }}
              >
                Delete Role
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <CreateRoleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        initialRole={selectedRole || undefined}
        isEditMode={!!selectedRole}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Deletion"
        icon={<FaTrash className="h-8 w-8 text-red-500" />}
        iconBgColor="#FEE2E2"
        message1="Deleting Role?"
        message={`Are you sure you want to delete the role "${roleToDelete}"?`}
        cancelText="No, I don't"
        confirmText="Yes, delete"
        confirmButtonColor="#EF4444"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
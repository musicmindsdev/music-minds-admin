"use client";

import { GoPlus } from "react-icons/go";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CreateRoleModal from "./CreateRoleModal";
import { FaTrash } from "react-icons/fa";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { RotateCw, ChevronDown, ChevronRight } from "lucide-react";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export default function RolesTab() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  // Fetch roles from API
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/roles");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch roles");
      }

      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleExpansion = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEditPermissions = (roleId: string) => {
    const roleToEdit = roles.find((role) => role.id === roleId);
    if (roleToEdit) {
      setSelectedRole(roleToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role) {
      setRoleToDelete(role);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/roles/${roleToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete role");
      }

      setRoles((prev) => prev.filter((role) => role.id !== roleToDelete.id));
      // Remove from expanded roles if it was expanded
      const newExpanded = new Set(expandedRoles);
      newExpanded.delete(roleToDelete.id);
      setExpandedRoles(newExpanded);
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleSaveRole = async (roleName: string, permissions: string[], description?: string) => {
    try {
      setLoading(true);

      if (selectedRole) {
        // Edit existing role
        const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: roleName,
            permissions,
            description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update role");
        }

        // const updatedRole = await response.json();
        // setRoles((prev) =>
        //   prev.map((role) =>
        //     role.id === selectedRole.id 
        //       ? { ...role, name: roleName, permissions, description } 
        //       : role
        //   )
        // );
        toast.success("Role updated successfully");
      } else {
        // Create new role
        const response = await fetch("/api/admin/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: roleName,
            permissions,
            description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create role");
        }

        const newRole = await response.json();
        setRoles((prev) => [...prev, newRole.role || newRole]);
        toast.success("Role created successfully");
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  if (loading && roles.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <RotateCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <RotateCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-semibold">Roles & Permissions</h3>
          <p className="text-xs text-gray-500">
            This defines the roles, hierarchy & access/permission level of all users allowed on the admin panel
          </p>
        </div>
        <Button className="py-2" onClick={handleCreateRole} disabled={loading}>
          <GoPlus className="mr-2" /> Create Role
        </Button>
      </div>

      {/* Roles Accordion */}
      <div className="space-y-3">
        {roles.length === 0 ? (
          <p className="text-sm text-gray-500">No roles found. Create your first role!</p>
        ) : (
          roles.map((role) => {
            const isExpanded = expandedRoles.has(role.id);
            return (
              <div key={role.id} className="border border-gray-200 rounded-lg bg-white">
                {/* Role Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleRoleExpansion(role.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium">{role.name}</h4>
                      {role.description && (
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      className="text-blue-600 text-xs hover:text-blue-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPermissions(role.id);
                      }}
                    >
                      Edit Permissions
                    </button>
                    <button
                      className="text-red-600 text-xs hover:text-red-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                    >
                      Delete Role
                    </button>
                  </div>
                </div>

                {/* Role Permissions (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Permissions:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {role.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
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
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"?`}
        cancelText="No, I don't"
        confirmText="Yes, delete"
        confirmButtonColor="#EF4444"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Banner from "@/public/banner.png";
import Image from "next/image";
import { TbEdit, TbCamera } from "react-icons/tb";

interface ProfileTabProps {
  user: {
    name: string;
    email: string;
    role: string;
    image: string;
  };
  onUpdateName: (name: string) => void;
  onUpdateEmail?: (email: string) => void;
  onUpdateRole?: (role: string) => void;
  onUpdateImage?: (image: string) => void;
}

export default function ProfileTab({ user, onUpdateName, onUpdateEmail, onUpdateRole, onUpdateImage }: ProfileTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editRole, setEditRole] = useState(user.role);
  const [newImage, setNewImage] = useState<string | null>(null); // State for new image preview
  const [imageFile, setImageFile] = useState<File | null>(null); // State for file upload

  const handleEditToggle = () => {
    setIsEditOpen(!isEditOpen);
    if (!isEditOpen) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditRole(user.role);
      setNewImage(null); // Reset image on open
      setImageFile(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateName(editName);
    if (onUpdateEmail) onUpdateEmail(editEmail);
    if (onUpdateRole) onUpdateRole(editRole);
    if (onUpdateImage && imageFile) {
      // Simulate image upload (replace with actual upload logic)
      const formData = new FormData();
      formData.append("image", imageFile);
      onUpdateImage(URL.createObjectURL(imageFile)); // Temporary URL for preview
    }
    setIsEditOpen(false);
  };

  const handleCancel = () => {
    setIsEditOpen(false);
  };

  return (
    <div className="w-full">
      <Card className="border-none shadow-none">
        <CardContent className="p-0 flex">
          {/* Banner and Profile Section (60%) */}
          <div className="w-[60%] pr-4">
            <Image src={Banner} alt="Banner" className="w-full" />
            <div className="flex justify-between"> 
               <div className="flex items-center mt-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={newImage || user.image} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h3 className="text-sm font-semibold">{user.name}</h3>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-sm font-light">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-4 flex items-center"
              onClick={handleEditToggle}
            >
              <TbEdit className="mr-2" />
              Edit Profile
            </Button></div>
          
          </div>
          {/* Edit Form (40%) */}
          <div className="w-[40%] pl-4">
            {isEditOpen && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center  justify-center mb-6">
                  <Avatar className="h-16 w-16 relative">
                    <AvatarImage src={newImage || user.image} alt="Avatar Preview" />
                    <AvatarFallback>{editName.charAt(0)}</AvatarFallback>
                    <div className="absolute bottom-0 right-0 bg-[#5243FE] rounded-full p-1 ">
                      <TbCamera className="h-4 w-4 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </Avatar>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-2 p-2 border border-gray-300 rounded-md w-full bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <Input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="mt-2 p-2 border border-gray-300 rounded-md w-full bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <Input
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="mt-2 p-2 border border-gray-300 rounded-md w-full bg-gray-50"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="outline" className="border-gray-300 text-gray-600" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
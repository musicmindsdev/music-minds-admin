"use client";

import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Shield from "@/components/svg icons/Shield";
import { Link, Trash2 } from "lucide-react";
import { GoPlus } from "react-icons/go";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDomain: (domain: string, isAllowed: boolean) => void;
  existingDomains: { allowed: string[]; blocked: string[] };
}

export default function AddDomainModal({ isOpen, onClose, onAddDomain, existingDomains }: AddDomainModalProps) {
  const [newDomain, setNewDomain] = useState("");
  const [status, setStatus] = useState<"Allowed" | "Blocked">("Allowed");
  const [addedDomains, setAddedDomains] = useState<{ domain: string; isAllowed: boolean }[]>([]);

  const user = {
    name: "Current User",
    image: "https://github.com/shadcn.png",
  };

  const validateDomain = (domain: string): boolean => {
    // Basic domain validation: no "@", at least one ".", no spaces
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) && !domain.includes("@") && !domain.includes(" ");
  };

  const handleAddToList = () => {
    const trimmedDomain = newDomain.trim();
    if (!trimmedDomain) {
      toast.error("Domain cannot be empty.");
      return;
    }

    if (!validateDomain(trimmedDomain)) {
      toast.error("Invalid domain format. Use a format like 'example.com' without '@'.");
      return;
    }

    if (trimmedDomain.length > 50) {
      toast.error("Domain cannot exceed 50 characters.");
      return;
    }

    const allExistingDomains = [...existingDomains.allowed, ...existingDomains.blocked];
    if (allExistingDomains.includes(trimmedDomain) || addedDomains.some((d) => d.domain === trimmedDomain)) {
      toast.error("This domain has already been added.");
      return;
    }

    setAddedDomains((prev) => [...prev, { domain: trimmedDomain, isAllowed: status === "Allowed" }]);
    setNewDomain("");
  };

  const handleRemoveDomain = (domain: string) => {
    setAddedDomains((prev) => prev.filter((d) => d.domain !== domain));
  };

  const handleSave = () => {
    if (addedDomains.length === 0) return;

    addedDomains.forEach(({ domain, isAllowed }) => {
      onAddDomain(domain, isAllowed);
    });
    setAddedDomains([]);
    setNewDomain("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddToList();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Domain</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-start gap-4 py-4 border-b">
          <div className="border p-3 rounded-lg backdrop-filter backdrop-blur-lg bg-card border-opacity-20 shadow-sm">
            <Shield />
          </div>
          <div>
            <h3 className="text-sm font-medium">Email Domains</h3>
            <p className="text-xs">Anyone with email address at these domains are allowed</p>
          </div>
        </div>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="status" className="text-sm">
              Status
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as "Allowed" | "Blocked")}>
              <SelectTrigger className="bg-gray-50 text-sm mt-1 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Allowed">Allowed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Input
                  placeholder="e.g 'musicminds.com'"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-50 text-sm w-full pr-10"
                  maxLength={50}
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {newDomain.length}/50
                </span>
              </div>
              <Button
                className="text-xs px-3 py-2"
                onClick={handleAddToList}
                disabled={!newDomain.trim() || newDomain.length > 50}
              >
                Add <GoPlus />
              </Button>
            </div>
          </div>
          {addedDomains.length > 0 && (
            <div className="space-y-2">
              {addedDomains.map(({ domain }) => (
                <div key={domain} className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <Link className="w-4 h-4 text-gray-500" />
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
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="w-[50%]" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="w-[50%]"
            onClick={handleSave}
            disabled={addedDomains.length === 0}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
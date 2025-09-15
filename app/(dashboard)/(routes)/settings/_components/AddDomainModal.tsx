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
  onAddDomain: (domain: string, isAllowed: boolean) => Promise<void>;
  existingDomains: { allowed: string[]; blocked: string[] };
}

interface PendingDomain {
  domain: string;
  isAllowed: boolean;
}

export default function AddDomainModal({ isOpen, onClose, onAddDomain, existingDomains }: AddDomainModalProps) {
  const [newDomain, setNewDomain] = useState("");
  const [status, setStatus] = useState<"Allowed" | "Blocked">("Allowed");
  const [addedDomains, setAddedDomains] = useState<PendingDomain[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const trimmedDomain = newDomain.trim().toLowerCase(); // Convert to lowercase for consistency
    
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

    // Check against existing domains (case-insensitive)
    const allExistingDomains = [
      ...existingDomains.allowed.map(d => d.toLowerCase()),
      ...existingDomains.blocked.map(d => d.toLowerCase())
    ];
    
    if (allExistingDomains.includes(trimmedDomain) || 
        addedDomains.some((d) => d.domain.toLowerCase() === trimmedDomain)) {
      toast.error("This domain has already been added.");
      return;
    }

    setAddedDomains((prev) => [...prev, { domain: trimmedDomain, isAllowed: status === "Allowed" }]);
    setNewDomain("");
    toast.success(`Domain "${trimmedDomain}" added to list`);
  };

  const handleRemoveDomain = (domain: string) => {
    setAddedDomains((prev) => prev.filter((d) => d.domain !== domain));
    toast.info(`Domain "${domain}" removed from list`);
  };

  const handleSave = async () => {
    if (addedDomains.length === 0) {
      toast.error("No domains to save");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      // Process domains one by one to handle individual failures
      for (const { domain, isAllowed } of addedDomains) {
        try {
          await onAddDomain(domain, isAllowed);
          successCount++;
        } catch (error) {
          console.error(`Failed to add domain ${domain}:`, error);
          failureCount++;
        }
      }

      // Show summary toast
      if (successCount > 0 && failureCount === 0) {
        toast.success(`Successfully added ${successCount} domain(s)`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(`Added ${successCount} domain(s), failed to add ${failureCount}`);
      } else {
        toast.error("Failed to add any domains");
      }

      // Reset form if at least one domain was added successfully
      if (successCount > 0) {
        setAddedDomains([]);
        setNewDomain("");
        setStatus("Allowed");
        onClose();
      }
    } catch (error) {
      console.error("Error during bulk domain addition:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddToList();
    }
  };

  const handleClose = () => {
    if (addedDomains.length > 0) {
      // Warn user about unsaved changes
      if (confirm("You have unsaved domains. Are you sure you want to close?")) {
        setAddedDomains([]);
        setNewDomain("");
        setStatus("Allowed");
        onClose();
      }
    } else {
      setNewDomain("");
      setStatus("Allowed");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <p className="text-xs">Anyone with email address at these domains are allowed/blocked</p>
          </div>
        </div>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="status" className="text-sm">
              Status
            </Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as "Allowed" | "Blocked")}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-gray-50 text-sm mt-1 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Allowed">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Allowed
                  </div>
                </SelectItem>
                <SelectItem value="Blocked">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Blocked
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm">Domain</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative w-full">
                <Input
                  placeholder="e.g 'musicminds.com'"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-50 text-sm w-full pr-12"
                  maxLength={50}
                  disabled={isSubmitting}
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {newDomain.length}/50
                </span>
              </div>
              <Button
                className="text-xs px-3 py-2 flex items-center gap-1"
                onClick={handleAddToList}
                disabled={!newDomain.trim() || newDomain.length > 50 || isSubmitting}
              >
                Add <GoPlus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {addedDomains.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pending Domains ({addedDomains.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                {addedDomains.map(({ domain, isAllowed }) => (
                  <div key={domain} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex gap-2 items-center flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isAllowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <Link className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{domain}</span>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        isAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isAllowed ? 'Allowed' : 'Blocked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDomain(domain)}
                        disabled={isSubmitting}
                        className="p-1 h-auto"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            className="w-[50%]" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="w-[50%]"
            onClick={handleSave}
            disabled={addedDomains.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              `Save ${addedDomains.length > 0 ? `(${addedDomains.length})` : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
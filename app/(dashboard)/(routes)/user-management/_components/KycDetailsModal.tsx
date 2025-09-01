import * as React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Rectangle from "@/public/Rectangle 22482.png";
import Maximise from "@/components/svg icons/Maximise";
import KycStepper from "@/components/kycStepper";

interface KYC {
  id: string;
  name: string;
  email: string;
  role: string;
  studioName?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  kycStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  submittedDate: string;
  type: "PERSONAL" | "BUSINESS";
  certificateUrl?: string; // Added for certificate image
}

interface KYCDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycId: string | null;
  onApprove: (kycId: string) => void;
  onDecline: (kycId: string) => void;
  onPreview: () => void;
  kycData: KYC[];
  onActionComplete?: () => void; // New prop to refresh data
}

const KYCDetailsModal: React.FC<KYCDetailsModalProps> = ({
  isOpen,
  onClose,
  kycId,
  onApprove,
  onDecline,
  onPreview,
  kycData,
  onActionComplete,
}) => {
  const kyc = kycData.find((k) => k.id === kycId);

  if (!isOpen || !kycId || !kyc) return null;

  const handleApprove = () => {
    onApprove(kycId);
    onActionComplete?.();
    onClose();
  };

  const handleDecline = () => {
    onDecline(kycId);
    onActionComplete?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-full w-[35%] bg-card shadow-lg transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-medium">User ID: {kycId}</h2>
            <div className="flex space-x-2">
              {(kyc.kycStatus === "PENDING" || kyc.kycStatus === "UNDER_REVIEW") && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600"
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={handleDecline}
                  >
                    Decline
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={onClose}>
                <X className="h-5 w-5 text-black" />
              </Button>
            </div>
          </div>
          <div className="mt-4">
            {/* Stepper with Progress */}
            <KycStepper status={kyc.kycStatus} />
            {/* User Details */}
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-light">User Information</p>
                <div className="flex items-center gap-3 mt-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={kyc.name || "Unknown"} />
                    <AvatarFallback>{kyc.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{kyc.name || "Unknown"}</p>
                    <p className="text-xs">{kyc.role || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-light">Studio Name</p>
                <p className="text-sm font-medium">{kyc.studioName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light">Studio Website</p>
                <p className="text-sm font-medium">{kyc.website || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light">Email</p>
                <p className="text-sm font-medium">{kyc.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light">Phone Number</p>
                <p className="text-sm font-medium">{kyc.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light">Address, City, Province</p>
                <p className="text-sm flex gap-2">
                  Address: <p className="font-medium">{kyc.address || "N/A"}</p>
                </p>
                <p className="text-sm flex gap-2">
                  City: <p className="font-medium">{kyc.city || "N/A"}</p>
                </p>
                <p className="text-sm flex gap-2">
                  Province: <p className="font-medium">{kyc.province || "N/A"}</p>
                </p>
              </div>
              <div>
                <p className="text-xs">KYC Status</p>
                <span
                  className={`flex items-center gap-1 w-[25%] rounded-full px-2 py-1 ${
                    kyc.kycStatus === "APPROVED"
                      ? "bg-green-100 text-green-600"
                      : kyc.kycStatus === "PENDING" || kyc.kycStatus === "UNDER_REVIEW"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      kyc.kycStatus === "APPROVED"
                        ? "bg-green-500"
                        : kyc.kycStatus === "PENDING" || kyc.kycStatus === "UNDER_REVIEW"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  {kyc.kycStatus}
                </span>
              </div>
              <div>
                <p className="text-xs">KYC Type</p>
                <p className="text-sm font-medium">{kyc.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs">Submitted Date</p>
                <p className="text-sm font-medium">
                  {new Date(kyc.submittedDate).toLocaleString()}
                </p>
              </div>
              {/* Certificate Section */}
              <div>
                <p className="text-xs">Certificate</p>
                <div className="mt-2 flex justify-between">
                  <Image
                    src={kyc.certificateUrl || Rectangle}
                    alt="Certificate"
                    width={200}
                    height={100}
                    className="rounded-lg"
                  />
                  <Button variant="ghost" size="sm" className="ml-2" onClick={onPreview}>
                    <Maximise className="h-4 w-4 dark:text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCDetailsModal;
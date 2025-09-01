import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, X, CheckCircle, XCircle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Review } from "./ReviewTable";

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
}

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  onClose,
  review,
}) => {
  if (!review) return null;

  // Format ISO date to a readable format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString; // Fallback to raw string if parsing fails
    }
  };

  // Handle delete action
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete review");
      }

      toast.success("Review deleted successfully");
      onClose(); // Close modal after deletion
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while deleting the review");
    }
  };

  // Handle approve action
  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to approve review");
      }

      toast.success("Review approved successfully");
      onClose();
    } catch (error) {
      console.error("Error approving review:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while approving the review");
    }
  };

  // Handle reject action
  const handleReject = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reject review");
      }

      toast.success("Review rejected successfully");
      onClose();
    } catch (error) {
      console.error("Error rejecting review:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while rejecting the review");
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-lg font-medium">Review ID: {review.id}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600"
            onClick={handleApprove}
            disabled={review.status === "Approved"}
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={handleReject}
            disabled={review.status === "Rejected"}
          >
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            Reject
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-2 text-red-600" />
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {/* Submitted By */}
        <div className="space-y-2">
          <p className="text-xs">Submitted By</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={review.userName || "Unknown"} />
              <AvatarFallback>{review.userName?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{review.userName || "Unknown"}</h3>
              <p className="text-sm">{review.serviceOffered || "N/A"}</p>
            </div>
          </div>
        </div>
        {/* Reviewed By */}
        <div className="space-y-2">
          <p className="text-xs">Reviewed</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={review.reviewer?.name || "Unknown"} />
              <AvatarFallback>{review.reviewer?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg">{review.reviewer?.name || "Unknown"}</h3>
              <p className="text-sm font-medium">{review.reviewer?.role || "N/A"}</p>
            </div>
          </div>
        </div>
        {/* Review Details */}
        <div className="space-y-4">
          <div className="pb-2">
            <p className="text-xs pb-3">Service Type</p>
            <p className="text-sm font-medium">{review.serviceOffered || "N/A"}</p>
          </div>
          <div className="pb-2">
            <p className="text-xs pb-2">Rating</p>
            <div className="flex items-center gap-1 text-sm font-medium">
              <span>{review.rating ? review.rating.toFixed(1) : "N/A"}/5.0</span>
              {review.rating && <Star className="h-4 w-4 text-[#0065FF] fill-[#0065FF]" />}
            </div>
          </div>
          <div className="pb-2">
            <p className="text-xs pb-3">Comment</p>
            <p className="text-sm font-medium">{review.reviewText || "No comment provided"}</p>
          </div>
          <div className="pb-2">
            <p className="text-xs pb-3">Submission Date</p>
            <p className="text-sm font-medium">{formatDate(review.date)}</p>
          </div>
          <div className="pb-2">
            <p className="text-xs pb-3">Status</p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 ${
                review.status === "Approved"
                  ? "bg-green-100 text-green-600"
                  : review.status === "Rejected"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  review.status === "Approved"
                    ? "bg-green-500"
                    : review.status === "Rejected"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              {review.status || "Pending"}
            </span>
          </div>
          <div className="w-[18%]">
            <p className="text-xs font-medium pb-3">Flagged</p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 ${
                review.flagged === "Yes"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  review.flagged === "Yes" ? "bg-red-500" : "bg-green-500"
                }`}
              />
              {review.flagged || "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsModal;
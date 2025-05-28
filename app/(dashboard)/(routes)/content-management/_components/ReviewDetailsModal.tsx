import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="h-full p-6 overflow-y-auto ">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-lg font-medium">Review ID: {review.id}</h2>
        <div className="flex items-center space-x-2">
         
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {/* Submitted By */}
        <div className="space-y-2">
          <p className="text-xs ">Submitted By</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={review.userName} />
              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{review.userName}</h3>
              <p className="text-sm ">{review.serviceOffered}</p>
            </div>
          </div>
        </div>
        {/* Reviewed By */}
        <div className="space-y-2">
          <p className="text-xs ">Reviewed</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={review.reviewer.name} />
              <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg ">{review.reviewer.name}</h3>
              <p className="text-sm font-medium">{review.reviewer.role}</p>
            </div>
          </div>
        </div>
        {/* Review Details */}
        <div className="space-y-4">
          <div className="pb-2">
            <p className="text-xs pb-3">Service Type</p>
            <p className="text-sm font-medium">{review.serviceOffered}</p>
          </div>
          <div className="pb-2">
            <p className="text-xs  pb-2">Rating</p>
            <div className="flex items-center gap-1 text-sm font-medium">
              <span>{review.rating}/5.0</span>
              <Star className="h-4 w-4 text-[#0065FF] fill-[#0065FF]" />
            </div>
          </div>
          <div className="pb-2">
            <p className="text-xs  pb-3">Comment</p>
            <p className="text-sm font-medium">{review.reviewText}</p>
          </div>
          <div className="pb-2">
            <p className="text-xs  pb-3">Submission Date</p>
            <p className="text-sm font-medium">{review.date}</p>
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
              {review.flagged}
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ReviewDetailsModal;
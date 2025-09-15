import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewData } from "@/lib/mockData";
import { Transaction } from "../../dashboard/_components/TransactionTable";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  // Function to find matching review
  const findMatchingReview = () => {
    return reviewData.find(
      (review: { reviewer: { name: string }; userName: string; serviceOffered: string }) =>
        review.reviewer.name === transaction.clientName &&
        review.userName === transaction.providerName &&
        review.serviceOffered === transaction.serviceOffered
    );
  };

  const matchingReview = findMatchingReview();

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-base font-medium">Transaction ID: {transaction.id}</h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" className="p-0 h-auto" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Content */}
      <div className="mt-6 space-y-6">
        {/* Client Info */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Client</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={transaction.image} alt={transaction.clientName} />
              <AvatarFallback>{transaction.clientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium">{transaction.clientName}</h3>
              <p className="text-xs text-gray-400">Client&apos;s Information</p>
            </div>
          </div>
        </div>
        {/* Provider Info */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Service Provider&apos;s Information</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={transaction.providerName} />
              <AvatarFallback>{transaction.providerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium">{transaction.providerName}</h3>
              <p className="text-xs text-gray-400">Provider</p>
            </div>
          </div>
        </div>
        {/* Transaction Details */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Transaction Details</h3>
          <div>
            <p className="text-xs flex gap-2">
              Booking ID: <p className="text-sm font-medium">{transaction.bookingId}</p>
            </p>
          </div>
          <div>
            <p className="text-xs flex gap-2">
              Service Type: <p className="text-sm font-medium">{transaction.serviceOffered}</p>
            </p>
          </div>
          <div>
            <p className="text-xs flex gap-2">
              Total Amount: <p className="text-sm font-medium">{transaction.totalAmount}</p>
            </p>
          </div>
          <div className="w-[25%] flex gap-2 items-center">
            <p className="text-xs font-medium text-gray-500">Status:</p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                transaction.status === "Completed"
                  ? "bg-green-100 text-green-600"
                  : transaction.status === "Pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  transaction.status === "Completed"
                    ? "bg-green-500"
                    : transaction.status === "Pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              {transaction.status}
            </span>
          </div>
          <div>
            <p className="text-xs flex gap-2">
              Last Updated: <p className="text-sm font-medium">{transaction.lastLogin}</p>
            </p>
          </div>
        </div>
        {/* Ratings & Review */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Ratings & Review</h3>
          <div>
            <p className="text-xs font-medium text-gray-500">Rating</p>
            <p className="text-sm font-medium">
              {matchingReview ? `${matchingReview.rating}/5.0` : "No review available"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Review ID</p>
            <p className="text-sm font-medium">
              {matchingReview ? matchingReview.id : "No review available"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Review Comment</p>
            <p className="text-sm font-medium">
              {matchingReview ? matchingReview.reviewText : "No review available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
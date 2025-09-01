import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Booking } from "../../dashboard/_components/BookingTable";
import { reviewData } from "@/lib/mockData"; 


interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({

  onClose,
  booking,
}) => {
  if (!booking) return null;

  // Function to find matching review
  const findMatchingReview = () => {
    return reviewData.find(
      (review: { reviewer: { name: string; }; userName: string; serviceOffered: string; }) =>
        review.reviewer.name === booking.clientName &&
        review.userName === booking.providerName &&
        review.serviceOffered === booking.serviceOffered
    );
  };

  const matchingReview = findMatchingReview();

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-base font-medium">Booking ID: {booking.id}</h2>
        <div className="flex items-center space-x-2">
        
          <Button variant="ghost" className="p-0 h-auto" onClick={onClose}>
            <X className="h-5 w-5 " />
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
              <AvatarImage src="/placeholder-avatar.jpg" alt={booking.clientName} />
              <AvatarFallback>{booking.clientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium">{booking.clientName}</h3>
              <p className="text-xs text-gray-400">Client&apos;s Information</p>
            </div>
          </div>
        </div>
        {/* Provider Info */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500"> Service Provider&apos;s Information</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={booking.providerName} />
              <AvatarFallback>{booking.providerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium ">{booking.providerName}</h3>
              <p className="text-xs text-gray-400">Provider</p>
            </div>
          </div>
        </div>
        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Booking Details</h3>
          <div>
            <p className="text-xs  flex gap-2">Service Type:  <p className="text-sm font-medium">{booking.serviceOffered}</p></p>
           
          </div>
          <div>
            <p className="text-xs  flex gap-2">Scheduled Date: <p className="text-sm font-medium">{booking.scheduledDate}</p></p>
            
          </div>
          <div>
            <p className="text-xs  flex gap-2">Scheduled Time:  <p className="text-sm font-medium">{booking.scheduledTime}</p></p>
           
          </div>
          <div>
            <p className="text-xs  flex gap-2">Location: <p className="text-sm font-medium">{booking.location}</p></p>
            
          </div>
          <div className="w-[25%] flex gap-2 items-center">
            <p className="text-xs font-medium text-gray-500">Status:</p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                booking.status === "CONFIRMED"
                  ? "bg-green-100 text-green-600"
                  : booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-500"
                    : booking.status === "PENDING"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              {booking.status}
            </span>
          </div>
        </div>
        {/* Financial Information */}
        <div className="space-y-4">
          <h3 className="text-base font-medium ">Financial Information</h3>
          <div className="flex gap-2">
            <p className="text-xs  ">Payment Amount:</p>
            <p className="text-sm font-medium">{booking.paymentAmount}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xs  ">Platform Fee:</p>
            <p className="text-xs font-medium">{booking.platformFee}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xs  ">Total Amount:</p>
            <p className="text-xs font-medium">{booking.totalAmount}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-xs  ">Transaction ID:</p>
            <p className="text-xs font-medium">{booking.transactionId}</p>
          </div>
          <div>
            <p className="text-xs  ">Status</p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                booking.status === "COMPLETED" ? "bg-green-100 text-green-600" : ""
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  booking.status === "COMPLETED" ? "bg-green-500" : ""
                }`}
              />
              {booking.status === "COMPLETED" ? "Processed" : ""}
            </span>
          </div>
        </div>
        {/* Ratings & Review */}
        <div className="space-y-4">
          <h3 className="text-base font-medium ">Ratings & Review</h3>
          <div>
            <p className="text-xs font-medium text-gray-500">Rating</p>
            <p className="text-sm font-medium">
              {matchingReview ? `${matchingReview.rating}/5.0` : "No review available"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Review ID</p>
            <p className=" text-sm font-medium">
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

export default BookingDetailsModal;
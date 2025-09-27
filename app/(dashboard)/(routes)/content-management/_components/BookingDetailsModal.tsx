import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking } from "../../dashboard/_components/BookingTable";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}
const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  onClose,
  booking,
}) => {
  if (!booking) {
    console.log("No booking data provided to BookingDetailsModal");
    return null;
  }

  console.log("Booking data in modal:", booking);

  // Format date and time using the raw data
  const formatDate = (dateString: string) => {
    if (!dateString) {
      console.log("No date provided for booking:", booking.id);
      return "Not scheduled";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log("Invalid date format for booking:", booking.id, dateString);
        return "Invalid date";
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date for booking:", booking.id, error);
      return "Error formatting date";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) {
      console.log("No time provided for booking:", booking.id);
      return "";
    }
    try {
      const time = new Date(timeString);
      if (isNaN(time.getTime())) {
        console.log("Invalid time format for booking:", booking.id, timeString);
        return "Invalid time";
      }
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting time for booking:", booking.id, error);
      return "Error formatting time";
    }
  };

  const scheduledDate = formatDate(booking.date);
  const startTime = formatTime(booking.startTime);
  const endTime = formatTime(booking.endTime);
  const scheduledTime = startTime && endTime && startTime !== "Invalid time" && endTime !== "Invalid time"
    ? `${startTime} - ${endTime}`
    : "Not scheduled";

  // Format location with proper addressing
  const location = [booking.address, booking.city, booking.country]
    .filter(Boolean)
    .join(", ") || "Not specified";
  console.log("Formatted location:", location);
  console.log("Formatted scheduledDate:", scheduledDate);
  console.log("Formatted scheduledTime:", scheduledTime);

  // Calculate average rating from reviews
  const averageRating = booking.reviews.length > 0
    ? booking.reviews.reduce((sum, review) => sum + review.rating, 0) / booking.reviews.length
    : 0;

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-base font-medium">Booking ID: {booking.id}</h2>
        <Button variant="ghost" className="p-0 h-auto" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="mt-6 space-y-6">
        {/* Client Info */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Client</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={booking.clientName} />
              <AvatarFallback>
                {booking.user?.firstName?.charAt(0) || booking.clientName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium">{booking.clientName}</h3>
              <p className="text-xs text-gray-400">{booking.clientEmail}</p>
              <p className="text-xs text-gray-400">
                Client ID: {booking.user?.id || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Info */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Service Provider</p>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt={booking.providerName} />
              <AvatarFallback>{booking.providerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium">{booking.providerName}</h3>
              <p className="text-xs text-gray-400">{booking.providerEmail}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Booking Details</h3>
          <div>
            <p className="text-xs text-gray-500">Service Type</p>
            <p className="text-sm font-medium">{booking.serviceOffered}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Scheduled Date</p>
            <p className="text-sm font-medium">{booking.date}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Scheduled Time</p>
            <p className="text-sm font-medium">{scheduledTime}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium">{location}</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-xs text-gray-500">Status:</p>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                booking.status === "CONFIRMED"
                  ? "bg-green-100 text-green-600"
                  : booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-600"
                  : booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-500"
                    : booking.status === "PENDING"
                    ? "bg-yellow-500"
                    : booking.status === "CANCELLED"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />
              {booking.status}
            </span>
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Financial Information</h3>
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">Payment Amount:</p>
            <p className="text-sm font-medium">{booking.paymentAmount}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">Platform Fee:</p>
            <p className="text-sm font-medium">{booking.platformFee}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">Total Amount:</p>
            <p className="text-sm font-medium">{booking.totalAmount}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">Transaction ID:</p>
            <p className="text-sm font-medium">{booking.transactionId}</p>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Ratings & Reviews</h3>
          
          {booking.reviews.length > 0 ? (
            <>
              {/* Average Rating */}
              <div>
                <p className="text-xs text-gray-500">Average Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {averageRating.toFixed(1)}/5.0 ({booking.reviews.length} review{booking.reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Individual Reviews</p>
                {booking.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium">{review.rating}/5.0</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">Review ID: {review.id}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No reviews available for this booking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
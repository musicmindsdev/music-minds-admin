import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  // Add debug logging
  React.useEffect(() => {
    console.log('TransactionDetailsModal - isOpen:', isOpen);
    console.log('TransactionDetailsModal - transaction:', transaction);
    console.log('TransactionDetailsModal - transaction status:', transaction?.status);
    console.log('TransactionDetailsModal - transaction rawStatus:', transaction?.rawStatus);
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) {
    console.log('Modal not rendering - isOpen:', isOpen, 'transaction:', transaction);
    return null;
  }

  // ✅ Use the transaction status directly (it's already mapped consistently)
  // No need for mock data - use real transaction data only

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
              <AvatarFallback>{transaction.clientName?.charAt(0) || 'C'}</AvatarFallback>
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
              <AvatarImage src={transaction.image} alt={transaction.providerName} />
              <AvatarFallback>{transaction.providerName?.charAt(0) || 'P'}</AvatarFallback>
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
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Booking ID:</span>
              <span className="text-sm font-medium">{transaction.bookingId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Service Type:</span>
              <span className="text-sm font-medium">{transaction.serviceOffered}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Total Amount:</span>
              <span className="text-sm font-medium">{transaction.totalAmount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Status:</span>
              <span
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
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
                {/* Show raw status for debugging */}
                {transaction.rawStatus && transaction.rawStatus !== transaction.status && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({transaction.rawStatus})
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Last Updated:</span>
              <span className="text-sm font-medium">{transaction.lastLogin}</span>
            </div>

            {/* Show additional raw data if available */}
            {transaction.rawData && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Transaction Type:</span>
                  <span className="text-sm font-medium">{transaction.rawData.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Service Fee:</span>
                  <span className="text-sm font-medium">${transaction.rawData.serviceFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Net Amount:</span>
                  <span className="text-sm font-medium">${transaction.rawData.netAmount?.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">Additional Information</h3>
          
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              {transaction.rawData?.description || "No additional information available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
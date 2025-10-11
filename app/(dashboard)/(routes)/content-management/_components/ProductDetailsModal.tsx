import * as React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Star, Download,  Calendar, DollarSign,  TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProductTableItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "AUDIO" | "VIDEO" | "DOCUMENT" | "TEMPLATE" | "PRESET" | "COURSE" | "BUNDLE" | "OTHER";
  licenseType: "PERSONAL_USE" | "COMMERCIAL_USE" | "EXTENDED_LICENSE" | "ROYALTY_FREE" | "RIGHTS_MANAGED";
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  isApproved: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  sales: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  fileSize?: string;
  downloadCount?: number;
  tags?: string[];
  category?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductTableItem | null;
  onActionComplete?: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onActionComplete,
}) => {
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) {
    return null;
  }

  // Format date similar to booking modal
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {  
      console.log(error)
      return "Error formatting date";
    }
  };

  const createdDate = formatDate(product.createdAt);
  const updatedDate = formatDate(product.updatedAt);

  // Format price
  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(price);
    } catch (error) {
      console.log(error)
      return `${currency} ${price.toFixed(2)}`;
    }
  };

  const priceFormatted = formatPrice(product.price, product.currency);
  const revenueFormatted = formatPrice(product.revenue, product.currency);

  // Status configuration - similar to booking modal structure
  const statusConfig = {
    DRAFT: { 
      label: "Draft", 
      bgColor: "bg-gray-100", 
      textColor: "text-gray-600",
      dotColor: "bg-gray-500"
    },
    PENDING: { 
      label: "Pending Review", 
      bgColor: "bg-yellow-100", 
      textColor: "text-yellow-600",
      dotColor: "bg-yellow-500"
    },
    APPROVED: { 
      label: "Approved", 
      bgColor: "bg-green-100", 
      textColor: "text-green-600",
      dotColor: "bg-green-500"
    },
    REJECTED: { 
      label: "Rejected", 
      bgColor: "bg-red-100", 
      textColor: "text-red-600",
      dotColor: "bg-red-500"
    },
    ARCHIVED: { 
      label: "Archived", 
      bgColor: "bg-blue-100", 
      textColor: "text-blue-600",
      dotColor: "bg-blue-500"
    },
  };

  // Type configuration
  const typeConfig = {
    AUDIO: { label: "Audio", color: "bg-blue-100 text-blue-600" },
    VIDEO: { label: "Video", color: "bg-purple-100 text-purple-600" },
    DOCUMENT: { label: "Document", color: "bg-green-100 text-green-600" },
    TEMPLATE: { label: "Template", color: "bg-orange-100 text-orange-600" },
    PRESET: { label: "Preset", color: "bg-pink-100 text-pink-600" },
    COURSE: { label: "Course", color: "bg-indigo-100 text-indigo-600" },
    BUNDLE: { label: "Bundle", color: "bg-teal-100 text-teal-600" },
    OTHER: { label: "Other", color: "bg-gray-100 text-gray-600" },
  };

  // License type configuration
  const licenseConfig = {
    PERSONAL_USE: { label: "Personal Use", icon: "👤" },
    COMMERCIAL_USE: { label: "Commercial Use", icon: "💼" },
    EXTENDED_LICENSE: { label: "Extended License", icon: "⭐" },
    ROYALTY_FREE: { label: "Royalty Free", icon: "👑" },
    RIGHTS_MANAGED: { label: "Rights Managed", icon: "⚖️" },
  };

  const status = statusConfig[product.status];
  const productType = typeConfig[product.type];
  const licenseType = licenseConfig[product.licenseType];

  // Action handlers
  const handleFeatureProduct = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api//products/${product.id}/feature`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to feature product");
      }

      toast.success("Product featured successfully");
      product.isFeatured = true;
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to feature product:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while featuring product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfeatureProduct = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${product.id}/unfeature`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to unfeature product");
      }

      toast.success("Product unfeatured successfully");
      product.isFeatured = false;
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to unfeature product:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while unfeaturing product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("Please provide revision notes");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/admin/products/${product.id}/request-revision`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ revisionNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to request revision");
      }

      toast.success("Revision requested successfully");
      setRevisionNotes("");
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to request revision:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while requesting revision");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable actions for non-eligible statuses
  const canFeature = product.status === "APPROVED";
  const canRequestRevision = product.status === "PENDING" || product.status === "APPROVED";

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-full w-[35%] bg-card shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full p-6">
          {/* Header - identical structure to booking modal */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-base font-medium">Product ID: {product.id}</h2>
            <Button variant="ghost" className="p-0 h-auto" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            <h3 className="text-base font-medium">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {product.isFeatured ? (
                <Button
                  onClick={handleUnfeatureProduct}
                  disabled={!canFeature || isSubmitting}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Unfeature Product
                </Button>
              ) : (
                <Button
                  onClick={handleFeatureProduct}
                  disabled={!canFeature || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Feature Product
                </Button>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  placeholder="Enter revision notes"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="flex-1"
                  disabled={!canRequestRevision || isSubmitting}
                />
                <Button
                  onClick={handleRequestRevision}
                  disabled={!canRequestRevision || isSubmitting || !revisionNotes.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Request Revision
                </Button>
              </div>
            </div>
          </div>

          {/* Content - structured like booking modal */}
          <div className="mt-6 space-y-6">
            {/* Product Info - similar to Client Info in booking modal */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Product</p>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={product.creator?.avatar || "/placeholder-product.jpg"} alt={product.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {product.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Product ID: {product.id}</p>
                </div>
              </div>
            </div>

            {/* Product Details - similar to Booking Details in booking modal */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Product Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <Badge variant="secondary" className={productType.color}>
                    {productType.label}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">License Type</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">{licenseType.icon}</span>
                    <p className="text-sm font-medium">{licenseType.label}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <p className="text-xs text-gray-500">Status:</p>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${status.bgColor} ${status.textColor}`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Featured</p>
                  <p className="text-sm font-medium">{product.isFeatured ? "Yes" : "No"}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-sm font-medium">{product.isApproved ? "Yes" : "No"}</p>
                </div>
              </div>

              {product.fileSize && (
                <div>
                  <p className="text-xs text-gray-500">File Size</p>
                  <p className="text-sm font-medium">{product.fileSize}</p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.category && (
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
              )}
            </div>

            {/* Financial Information - similar structure to booking modal */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Financial Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Price:</p>
                  </div>
                  <p className="text-sm font-medium">{priceFormatted}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Total Sales:</p>
                  </div>
                  <p className="text-sm font-medium">{product.sales}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Total Revenue:</p>
                  </div>
                  <p className="text-sm font-medium">{revenueFormatted}</p>
                </div>

                {product.downloadCount !== undefined && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-gray-400" />
                      <p className="text-xs text-gray-500">Downloads:</p>
                    </div>
                    <p className="text-sm font-medium">{product.downloadCount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Information - similar to booking modal's date info */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Created:</p>
                  </div>
                  <p className="text-sm font-medium">{createdDate}</p>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Last Updated:</p>
                  </div>
                  <p className="text-sm font-medium">{updatedDate}</p>
                </div>
              </div>
            </div>

            {/* Ratings & Reviews - identical structure to booking modal */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Ratings & Reviews</h3>
              
              {product.reviewCount > 0 ? (
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
                              star <= Math.round(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {product.rating.toFixed(1)}/5.0 ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No reviews available for this product</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
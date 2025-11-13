"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Search, CheckCircle, XCircle, EllipsisVertical, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ProductDetailsModal from "./ProductDetailsModal";
import Loading from "@/components/Loading";
import Pending from "@/public/pending.png";
import Image from "next/image";

export interface ProductTableItem {
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
}

interface ProductsTableProps {
  showCheckboxes?: boolean;
  showPagination?: boolean;
  onActionComplete?: () => void;
  onExportData?: (products: ProductTableItem[]) => void;
  onFetchAllData?: (dateRangeFrom: string, dateRangeTo: string) => Promise<ProductTableItem[]>;
}

export default function ProductsTable({
  showCheckboxes = false,
  showPagination = true,
  onActionComplete,
  onExportData,
}: ProductsTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [featured, setFeatured] = useState<boolean | null>(null);
  const [digital, setDigital] = useState<boolean | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsData, setProductsData] = useState<ProductTableItem[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductTableItem | null>(null);
  const productsPerPage = 20;

  const validProductTypes = ["AUDIO", "VIDEO", "DOCUMENT", "TEMPLATE", "PRESET", "COURSE", "BUNDLE", "OTHER"];
  const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "ARCHIVED"];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const status = validStatuses.includes(statusFilter) ? statusFilter : "";
      const type = validProductTypes.includes(typeFilter) ? typeFilter : "";
      const tagsQuery = tags.join(",");

      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
        ...(status && { status }),
        ...(type && { type }),
        ...(searchQuery && { search: searchQuery }),
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(rating && { rating }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(creatorId && { creatorId }),
        ...(featured !== null && { featured: featured.toString() }),
        ...(digital !== null && { digital: digital.toString() }),
        ...(tagsQuery && { tags: tagsQuery }),
      }).toString();

      console.log("Fetching products with query:", query);

      const response = await fetch(`/api/products?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("API response status:", response.status, "Status text:", response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized - redirecting to login");
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        let errorData;
        try {
          errorData = await response.json();
          console.error("API error response:", JSON.stringify(errorData, null, 2));
        } catch {
          errorData = { error: `HTTP Error: ${response.status} ${response.statusText}` };
        }
        throw new Error(errorData.error || `Failed to fetch products (Status: ${response.status})`);
      }

      const { data, meta } = await response.json();

      setProductsData(
        Array.isArray(data)
          ? data.map((product: ProductTableItem) => ({
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              currency: product.currency,
              type: product.type,
              licenseType: product.licenseType,
              status: product.status,
              isApproved: product.isApproved,
              isFeatured: product.isFeatured,
              rating: product.rating,
              reviewCount: product.reviewCount,
              sales: product.sales,
              revenue: product.revenue,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            }))
          : []
      );
      setTotalProducts(meta?.total || data?.length || 0);
      setTotalPages(meta?.last_page || Math.ceil((meta?.total || data?.length || 0) / productsPerPage));
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err instanceof Error
        ? `${err.message}${err.message.includes("Status: 500") ? " - This may be due to a server issue. Please try again later or contact support." : ""}`
        : "An error occurred while fetching products";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    statusFilter,
    typeFilter,
    searchQuery,
    category,
    minPrice,
    maxPrice,
    rating,
    sortBy,
    sortOrder,
    creatorId,
    featured,
    digital,
    tags,
    productsPerPage,
    router,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (onExportData) {
      onExportData(productsData);
    }
  }, [productsData, onExportData]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(productsData.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleViewDetails = (product: ProductTableItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          notes: "Product meets all quality standards",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to approve product");
      }

      toast.success("Product approved successfully");
      fetchProducts();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to approve product:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while approving product");
    }
  };

  const handleRejectProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rejectionReason: "Product file quality is below standards",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reject product");
      }

      toast.success("Product rejected successfully");
      fetchProducts();
      onActionComplete?.();
    } catch (err) {
      console.error("Failed to reject product:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred while rejecting product");
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const productId of selectedProducts) {
        await handleApproveProduct(productId);
      }
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to bulk approve products:", error);
    }
  };

  const handleBulkReject = async () => {
    try {
      for (const productId of selectedProducts) {
        await handleRejectProduct(productId);
      }
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to bulk reject products:", error);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-100 text-yellow-600",
    APPROVED: "bg-green-100 text-green-600",
    REJECTED: "bg-red-100 text-red-600",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  const typeColors = {
    AUDIO: "bg-blue-100 text-blue-600",
    VIDEO: "bg-purple-100 text-purple-600",
    DOCUMENT: "bg-green-100 text-green-600",
    TEMPLATE: "bg-orange-100 text-orange-600",
    PRESET: "bg-pink-100 text-pink-600",
    COURSE: "bg-indigo-100 text-indigo-600",
    BUNDLE: "bg-teal-100 text-teal-600",
    OTHER: "bg-gray-100 text-gray-600",
  };

  // Loading state - using your custom Loading component
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchProducts}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-4 flex items-center pb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search for products by name or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 p-2 border rounded-lg w-full bg-background"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2">
              <Filter className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-96 p-4 shadow-lg border border-gray-200 rounded-lg"
          >
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Status Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Product Status</p>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Statuses</option>
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <DropdownMenuSeparator />

            {/* Type Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Product Type</p>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Types</option>
                {validProductTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <DropdownMenuSeparator />

            {/* Price Range */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Price Range</p>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Rating Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Minimum Rating</p>
              <Input
                type="number"
                placeholder="e.g., 4"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min={0}
                max={5}
                className="w-full"
              />
            </div>

            <DropdownMenuSeparator />

            {/* Sort Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Sort By</p>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="createdAt">Created At</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                  <option value="sales">Sales</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Other Filters */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Other Filters</p>
              <Input
                placeholder="Category (slug or ID)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full"
              />
              <Input
                placeholder="Creator ID"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                className="w-full"
              />
              <div className="flex space-x-2">
                <Checkbox
                  checked={featured === true}
                  onCheckedChange={(checked) => setFeatured(checked ? true : null)}
                />
                <p className="text-sm">Featured Products</p>
              </div>
              <div className="flex space-x-2">
                <Checkbox
                  checked={digital === true}
                  onCheckedChange={(checked) => setDigital(checked ? true : null)}
                />
                <p className="text-sm">Digital Products</p>
              </div>
              <Input
                placeholder="Tags (comma-separated)"
                value={tags.join(",")}
                onChange={(e) => setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                className="w-full"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex justify-end space-x-2 mt-2 p-4">
          <Button
            variant="outline"
            size="sm"
            className="text-green-600"
            onClick={handleBulkApprove}
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={handleBulkReject}
          >
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            Reject
          </Button>
        </div>
      )}

      {/* Empty state - using the same pattern as other tables */}
      {productsData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image src={Pending} alt="No products found" className="mx-auto mb-2" />
          <p>No products found.</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {showCheckboxes && (
                  <TableHead>
                    <Checkbox
                      checked={selectedProducts.length === productsData.length && productsData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsData.map((product) => (
                <TableRow key={product.id}>
                  {showCheckboxes && (
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="/placeholder-product.jpg" alt={product.name} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {product.currency} {product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${typeColors[product.type]}`}>
                      {product.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.sales}</p>
                      <p className="text-sm text-gray-500">
                        {product.currency} {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.rating}/5.0</p>
                      <p className="text-sm text-gray-500">{product.reviewCount} reviews</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[product.status]}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          product.status === "APPROVED"
                            ? "bg-green-500"
                            : product.status === "PENDING"
                            ? "bg-yellow-500"
                            : product.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      />
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost"><EllipsisVertical /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {product.status === "PENDING" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveProduct(product.id)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectProduct(product.id)} className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {showPagination && (
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <IoIosArrowBack />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <IoIosArrowForward />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm">
                  Showing {Math.min((currentPage - 1) * productsPerPage + 1, totalProducts)} -{" "}
                  {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm">Go to page</p>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(Number(e.target.value))}
                    className="w-16"
                  />
                  <Button className="text-white" size="sm" onClick={() => goToPage(currentPage)}>
                    Go
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <ProductDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
}
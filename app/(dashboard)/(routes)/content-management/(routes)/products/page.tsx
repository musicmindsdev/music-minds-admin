"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import ProductsTable from "../../_components/ProductsTable";
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
}
export default function ProductsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [products, ]= useState<ProductTableItem[]>([])


  return (
    <div className="p-6 space-y-6">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg text-light">Products</h2>
        <Button
          className="text-white flex items-center space-x-2"
          onClick={() => setIsExportModalOpen(true)}
        >
          <CiExport className="mr-2" />
          <span className="hidden md:inline">Export Data</span>
        </Button>
      </div>
      
      {/* Products Table */}
      <Card className="rounded-none">
        <CardContent>
          <ProductsTable
            showCheckboxes={true}
            showPagination={true}
            onActionComplete={() => console.log("Product action completed")}
          />
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Products Data"
          data={products}
        dataType="products"
        statusFilters={[
          { label: "Draft", value: "DRAFT" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" },
          { label: "Archived", value: "ARCHIVED" },
        ]}
        roleFilters={[]}
        fieldOptions={[
          { label: "Product ID", value: "id" },
          { label: "Product Name", value: "name" },
          { label: "Description", value: "description" },
          { label: "Price", value: "price" },
          { label: "Currency", value: "currency" },
          { label: "Product Type", value: "type" },
          { label: "License Type", value: "licenseType" },
          { label: "Status", value: "status" },
          { label: "Rating", value: "rating" },
          { label: "Review Count", value: "reviewCount" },
          { label: "Sales", value: "sales" },
          { label: "Revenue", value: "revenue" },
          { label: "Downloads", value: "downloads" },
          { label: "File Format", value: "fileFormat" },
          { label: "File Size", value: "fileSize" },
          { label: "Creator Name", value: "creatorName" },
          { label: "Creator Email", value: "creatorEmail" },
          { label: "Is Featured", value: "isFeatured" },
          { label: "Is Approved", value: "isApproved" },
          { label: "Created Date", value: "createdAt" },
          { label: "Updated Date", value: "updatedAt" },
        ]}
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CiExport } from "react-icons/ci";
import ExportModal from "@/components/ExportModal";
import ProductsTable, { ProductTableItem } from "../../_components/ProductsTable";

export default function ProductsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [productsData, setProductsData] = useState<ProductTableItem[]>([]);

  // This receives the data from the ProductsTable
  const handleExportData = (products: ProductTableItem[]) => {
    setProductsData(products);
  };

  const fetchAllProducts = async (exportDateRangeFrom: string, exportDateRangeTo: string) => {
    try {
      const queryParams: Record<string, string> = {
        limit: "10000",
      };

      if (exportDateRangeFrom) {
        queryParams.fromDate = exportDateRangeFrom;
      }
      if (exportDateRangeTo) {
        queryParams.toDate = exportDateRangeTo;
      }

      const query = new URLSearchParams(queryParams).toString();

      const response = await fetch(`/api/products?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all products");
      }

      const { data } = await response.json();

      const allProducts: ProductTableItem[] = Array.isArray(data)
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
        : [];

      return allProducts;
    } catch (err) {
      console.error("Error fetching all products for export:", err);
      return [];
    }
  };


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
            onExportData={handleExportData} 
            onFetchAllData={fetchAllProducts}
          />
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Products Data"
        data={productsData} // Use the data from table
        dataType="products"
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
          { label: "Is Featured", value: "isFeatured" },
          { label: "Is Approved", value: "isApproved" },
          { label: "Created Date", value: "createdAt" },
          { label: "Updated Date", value: "updatedAt" },
        ]}
        onFetchAllData={fetchAllProducts}
      />
    </div>
  );
}
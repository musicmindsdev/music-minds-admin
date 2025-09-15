"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchModal from "./SearchModal";

interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  status: string;
  verified: boolean;
  lastLogin: string;
  image: string;
}

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  providerName: string;
  providerEmail: string;
  serviceOffered: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
  paymentAmount: string;
  platformFee: string;
  transactionId: string;
}

interface Transaction {
  id: string;
  bookingId: string;
  clientName: string;
  providerName: string;
  serviceOffered: string;
  totalAmount: string;
  status: string;
  lastLogin: string;
  image: string;
}

interface SearchInputProps {
  users: User[];
  bookings: Booking[];
  transactions: Transaction[];
}

export const SearchInput = ({ users, bookings, transactions }: SearchInputProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleInputClick = () => {
    console.log("Input clicked, setting isModalOpen to true");
    setIsModalOpen(true);
  };

  return (
    <SearchModal
      searchQuery={searchQuery}
      isOpen={isModalOpen}
      onClose={() => {
        console.log("Closing modal, setting isModalOpen to false");
        setIsModalOpen(false);
      }}
      users={users}
      bookings={bookings}
      transactions={transactions}
      trigger={
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={handleInputClick}
          className="pl-10 bg-blue-50 border-none rounded-lg h-10 w-[400px] max-w-md focus:ring-2 focus:ring-blue-200"
        />
      }
    >
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={handleInputClick}
          className="pl-10 bg-blue-50 border-none rounded-lg h-10 w-[400px] max-w-md focus:ring-blue-200"
        />
      </form>
    </SearchModal>
  );
};
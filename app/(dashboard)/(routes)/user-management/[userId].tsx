"use client";

import { useParams, useRouter } from "next/navigation";
import { usersData } from "@/lib/mockData";
import UserDetailsView from "./_components/UserDetailsView";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const user = usersData
    .map((u) => ({
      ...u,
      status: u.status as "Active" | "Suspended" | "Deactivated",
    }))
    .find((u) => u.id === userId) || null;

  const handleBack = () => {
    router.push("/user-management");
  };

  return (
    <div className="min-h-screen p-6">
      <UserDetailsView user={user} onClose={handleBack} />
    </div>
  );
}
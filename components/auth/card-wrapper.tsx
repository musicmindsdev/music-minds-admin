"use client";

import { Card,
    CardContent,
    CardHeader
 } from "@/components//ui/card";
import { Header } from "@/components/auth/header";
// import Logo from "@/public/Musicmindlogo.svg"
import Image from "next/image";

interface CardWrapperProps {
  children: React.ReactNode;
  headerH1: string;
  headerLabel: string;
};

export default function CardWrapper({ children, headerLabel, headerH1 }: CardWrapperProps) {
  return (
    <div>
    <div className="flex justify-center mb-4">
    <Image
      src="/Musicmindlogo.svg"
      alt="Logo"
      className="w-32 h-32" 
    />
    </div>
    <Card className="w-[600px] shadow-md p-8">
      <CardHeader>
        <Header h1={headerH1} label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
  );
}

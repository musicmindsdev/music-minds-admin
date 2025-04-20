"use client";

import { Card,
    CardContent,
    CardFooter,
    CardHeader
 } from "@/components//ui/card";
import { Header } from "@/components/auth/header";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
};

export default function CardWrapper({ children, headerLabel }: CardWrapperProps) {
  return (
    <div>
    <div className="flex justify-center mb-4">
    <img
      src="/Musicmindlogo.svg"
      alt="Your Alt Text"
      className="w-32 h-32" 
    />
    </div>
    <Card className="w-[600px] shadow-md p-8">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
  );
}

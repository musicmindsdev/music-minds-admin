"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/modetoggle";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';



export default function Home() {
  const router = useRouter();

 
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000); 


    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="flex flex-col items-center">
      <DotLottieReact
      src="https://lottie.host/92108111-4ec5-4e02-ac34-77e29f881690/nhmOEpHDwV.lottie"
      loop
      autoplay
      className="w-50 h-50"
    />
      <ModeToggle/>
      </div>
    </div>
  );
}

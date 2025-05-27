"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

export default function NProgressWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("Route change started:", pathname, searchParams.toString());
    NProgress.configure({ showSpinner: false, speed: 500, easing: "ease" });
    NProgress.start();

    return () => {
      console.log("Route change completed:", pathname, searchParams.toString());
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return <>{children}</>;
}
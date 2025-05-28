"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

export default function NProgressWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, speed: 500, easing: "ease" });
    NProgress.start();

    // Delay stopping the bar to simulate content load
    const doneTimeout = setTimeout(() => {
      NProgress.done();
    }, 400); // Adjust this value if needed

    return () => clearTimeout(doneTimeout);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
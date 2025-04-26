"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarItemProps {
  label: string;
  href: string;
  image: string; 
}

export const SidebarItem = ({ label, href, image }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };


  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(image);
        const text = await response.text();
        setSvgContent(text);
      } catch (error) {
        console.error("Failed to fetch SVG:", error);
      }
    };
    fetchSvg();
  }, [image]);

  const renderSvgWithGradient = () => {
    if (!svgContent) return null;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    svgElement.setAttribute("width", "16");
    svgElement.setAttribute("height", "16");
    svgElement.setAttribute("class", "w-4 h-4");

    const elementsWithFill = svgElement.querySelectorAll("[fill]");
    elementsWithFill.forEach((el) => {
      if (el.getAttribute("fill") !== "none") {
        el.setAttribute("fill", isActive ? "url(#activeGradient)" : "#64748b");
      }
    });

    if (isActive) {
      const defs = svgDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
      const linearGradient = svgDoc.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient"
      );
      linearGradient.setAttribute("id", "activeGradient");
      linearGradient.setAttribute("x1", "0%");
      linearGradient.setAttribute("y1", "0%");
      linearGradient.setAttribute("x2", "100%");
      linearGradient.setAttribute("y2", "0%");

      const stop1 = svgDoc.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("style", "stop-color:#0065FF;stop-opacity:1");

      const stop2 = svgDoc.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "50%");
      stop2.setAttribute("style", "stop-color:#952BDA;stop-opacity:1");

      const stop3 = svgDoc.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop3.setAttribute("offset", "100%");
      stop3.setAttribute("style", "stop-color:#FE02BF;stop-opacity:1");

      linearGradient.appendChild(stop1);
      linearGradient.appendChild(stop2);
      linearGradient.appendChild(stop3);
      defs.appendChild(linearGradient);
      svgElement.insertBefore(defs, svgElement.firstChild);
    }

    return <div dangerouslySetInnerHTML={{ __html: svgElement.outerHTML }} />;
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive && "bg-[#F5F2FF] hover:bg-sky-200/20"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <div className="relative w-4 h-4">{renderSvgWithGradient()}</div>
        <span
          className={cn(
            isActive &&
              "bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF] bg-clip-text text-transparent"
          )}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  );
};
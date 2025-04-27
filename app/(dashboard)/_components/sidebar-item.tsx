"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SidebarItemProps {
  label: string;
  href: string;
  image?: string;
  children?: { label: string; href: string }[];
}

export const SidebarItem = ({ label, href, image, children }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = (href: string) => {
    router.push(href);
  };

  // Fetch the SVG content from the public folder
  useEffect(() => {
    if (image) {
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
    }
  }, [image]);

  // Modify the SVG to apply the gradient when active
  const renderSvgWithGradient = () => {
    if (!svgContent) return null;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    // Set width and height to match your design (16x16 pixels)
    svgElement.setAttribute("width", "16");
    svgElement.setAttribute("height", "16");
    svgElement.setAttribute("class", "w-4 h-4");

    // Find all elements with fill attributes and set them to use the gradient or fallback color
    const elementsWithFill = svgElement.querySelectorAll("[fill]");
    elementsWithFill.forEach((el) => {
      if (el.getAttribute("fill") !== "none") {
        el.setAttribute("fill", isActive ? "url(#activeGradient)" : "#64748b");
      }
    });

    // Inject the gradient definition if active
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

  // If the item has children, render it as a collapsible section
  if (children && children.length > 0) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div
          className={cn(
            "flex items-center w-full transition-all",
            isActive && "bg-[#F5F2FF] dark:bg-sky-200/10 "
          )}
        >
          {/* Main route content (click to navigate) */}
          <button
            onClick={() => onClick(href)}
            type="button"
            className={cn(
              "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600  flex-1",
              isActive && "bg-transparent" // Prevent nested background color
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
          </button>
          {/* Chevron button (click to expand/collapse) */}
          <CollapsibleTrigger asChild>
            <button className="pr-6">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pl-12">
          {children.map((child) => (
            <button
              key={child.href}
              onClick={() => onClick(child.href)}
              type="button"
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 w-full py-2",
                pathname === child.href &&
                  "bg-[#F5F2FF] hover:bg-sky-200/20 bg-gradient-to-r from-[#0065FF] via-[#952BDA] to-[#FE02BF] bg-clip-text text-transparent"
              )}
            >
              {child.label}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // If the item has no children, render it as a single link
  return (
    <button
      onClick={() => onClick(href)}
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
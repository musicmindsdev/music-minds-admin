import localFont from "next/font/local";
import { cn } from "@/lib/utils";

// Configure the Campton font with all weights and styles
export const camptonFont = localFont({
  src: [
    {
      path: "../../fonts/campton/CamptonBlack.otf", // Updated path
      weight: "900",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonBlackItalic.otf",
      weight: "900",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonExtraBoldItalic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonBold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonBoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonSemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonSemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonMediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonBook.otf",
      weight: "450",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonBookItalic.otf",
      weight: "450",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonLight.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonLightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonExtraLightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../fonts/campton/CamptonThin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../fonts/campton/CamptonThinItalic.otf",
      weight: "100",
      style: "italic",
    },
  ],
  variable: "--font-campton", // Optional: CSS variable for global usage
});

interface HeaderProps {
  label: string;
  h1: string;
}

export const Header = ({ label, h1 }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-2 items-start justify-center">
      <h1
        className={cn(
          "text-3xl font-semibold",
          camptonFont.className 
        )}
      >
        {h1}
      </h1>
      <p  className={cn(
          "text-muted-foreground text-sm ",
          camptonFont.className 
        )}>{label}</p>
    </div>
  );
};
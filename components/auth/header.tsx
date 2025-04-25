import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
    label: string;
    h1: string;
}

export const Header = ({
    label,
    h1,
}: HeaderProps) => {
return (
    <div className="w-full flex flex-col gap-y-2 items-start justify-center">
        <h1 className={cn(
            "text-3xl font-semibold",
            font.className,
        )}>{h1}</h1>
        <p className="text-muted-foreground text-sm">
            {label}
        </p>
    </div>
)
}
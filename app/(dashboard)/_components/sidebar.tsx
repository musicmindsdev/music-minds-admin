import Image from "next/image"
import { SidebarRoutes } from "./sidebar-routes"
// import Logo from "@/public/Musicmindlogo.svg"


export const Sidebar = () => {
    return (
        <div className="h-full md:w-[250px] border-r 
        flex flex-col items-center overflow-y-auto bg-card 
        shadow-sm">
           <div className="p-6">
           <Image
           width={32}
           height={32}
      src="/Musicmindlogo.svg"
      alt="Logo"
      className="w-32 h-32  " 
    />
           </div>
           <div className="flex flex-col w-full">
            <SidebarRoutes />
           </div>
        </div>
    )
}
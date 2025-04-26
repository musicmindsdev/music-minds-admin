import { SidebarRoutes } from "./sidebar-routes"



export const Sidebar = () => {
    return (
        <div className="h-full w-[250px] border-r 
        flex flex-col items-center overflow-y-auto bg-background 
        shadow-sm">
           <div className="p-6">
           <img
      src="/Musicmindlogo.svg"
      alt="Your Alt Text"
      className="w-32 h-32" 
    />
           </div>
           <div className="flex flex-col w-full">
            <SidebarRoutes />
           </div>
        </div>
    )
}
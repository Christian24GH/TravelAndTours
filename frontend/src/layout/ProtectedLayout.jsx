import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet } from "react-router";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import AuthContext from "../context/AuthProvider";

export function Layout() {
  const {auth, loading} = useContext(AuthContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!loading && !auth) {
      navigate("/login"); // redirect if not logged in
    }
  }, [auth, loading, navigate]);

  if (loading) {
    return <p className="p-4">Checking authentication...</p>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
        </header>

        {/** Main Div */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Toaster richColors/>
          <Outlet/>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

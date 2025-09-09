import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Outlet } from "react-router"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import AuthContext from "../context/AuthProvider"
import Breadcrumps from "../components/bread-crumbs"

export function Layout({allowedRoles}) {
  const {auth, loading, logout} = useContext(AuthContext)
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(null)

  useEffect(() => {
    if (!loading) {
      if (!auth) {
        setAuthorized(false)
        const timer = setTimeout(() => {
          navigate("/login")
        }, 2500)
        return () => clearTimeout(timer)
      } else if (!allowedRoles.includes(auth.role)) {
        setAuthorized(false)
        toast.error("Unauthorized User! Redirecting to login...", {
          position: "top-center",
        });

        const timer = setTimeout(() => {
          logout();
        }, 2500)

        return () => clearTimeout(timer)
      } else {
        setAuthorized(true)
      }
    }
  }, [auth, loading, allowedRoles, logout, navigate])

  if (loading || authorized === null) {
    return (
      <SidebarProvider>
        <title>Loading...</title>
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
            <Skeleton className="h-1/3 w-full" />
            <Skeleton className="h-2/3 w-full" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (authorized === false) {
    return (
      <>
        <p className="p-4">Unauthorized access, redirecting...</p>
      </>
    )
    
  }

  return (
    <>
      <SidebarProvider>
        <title>JOLI - Admin</title>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumps/>
            </div>
          </header>

          {/** Main Div */}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Toaster richColors/>
            <Outlet/>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
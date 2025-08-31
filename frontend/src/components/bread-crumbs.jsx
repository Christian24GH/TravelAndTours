import { Home, HomeIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLocation, Link } from "react-router"
import React from "react"
export default function Breadcrumps(){

const location = useLocation()
    const curLocation = location.pathname

    // Split pathname into segments
    const pathnames = curLocation.split("/").filter(Boolean)
    
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {pathnames.map((segment, index) => {
                // Build the URL up to this segment
                const to = "/" + pathnames.slice(0, index + 1).join("/")

                // Capitalize segment
                const label = segment.charAt(0).toUpperCase() + segment.slice(1)
                return (
                    <BreadcrumbItem key={to}>
                        {index === pathnames.length - 1 ? (
                            <span className="font-medium">{label == 'LogisticsII' ? 'Home' : label}</span> // last item not a link
                        ) : index === 0 ? (
                            <>
                                <BreadcrumbLink asChild>
                                    <Link to={to}>
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                                <BreadcrumbSeparator/>
                            </>
                        ): (
                            <>
                                <BreadcrumbLink asChild>
                                    <Link to={to}>
                                        {label}
                                    </Link>
                                </BreadcrumbLink>
                                <BreadcrumbSeparator/>
                            </>
                        )}
                    </BreadcrumbItem>
                )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
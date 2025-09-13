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
                
                    const to = "/" + pathnames.slice(0, index + 1).join("/")
                
                    const label = segment.charAt(0).toUpperCase() + segment.slice(1)
                    return (
                        <React.Fragment key={`${to}-${index}`}>
                            <BreadcrumbItem>
                                {index === pathnames.length - 1 ? (
                                    <span className="font-medium">{label == 'LogisticsII' ? 'Home' : label}</span>
                                ) : index === 0 ? (
                                    <>
                                        <BreadcrumbLink asChild>
                                            <Link to={to}>
                                                Home
                                            </Link>
                                        </BreadcrumbLink>
                                        
                                    </>
                                ): (
                                    <>
                                        <BreadcrumbLink asChild>
                                            <Link to={to}>
                                                {label}
                                            </Link>
                                        </BreadcrumbLink>                       
                                    </>
                                )}
                            </BreadcrumbItem>
                        {index !== pathnames.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
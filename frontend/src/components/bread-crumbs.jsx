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

    const pathnames = curLocation.split("/").filter(Boolean)
    console.log(pathnames)
    return (
        <Breadcrumb>
        <BreadcrumbList>
            {pathnames.map((segment, index) => {
            const to = "/" + pathnames.slice(0, index + 1).join("/")
            console.log(to)
            const label = segment.charAt(0).toUpperCase() + segment.slice(1)
            
            console.log(label)
            return (
                <React.Fragment key={to}>
                    <BreadcrumbItem>
                        {index === pathnames.length - 1 ? (
                            <span className="font-medium">{label}</span>
                        ) : index === pathnames[0] ? (
                            <BreadcrumbLink asChild>
                                <Link to={to}>
                                    {label}
                                </Link>
                            </BreadcrumbLink>
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
                </React.Fragment>
            )
            })}
        </BreadcrumbList>
        </Breadcrumb>
    )
}
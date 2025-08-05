import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { Link } from "@inertiajs/react"
import { web_routes } from "@/routes"
import icon from "./img/placeholder.webp"
export default function MenuBar(){
    return (
        <div className="flex items-center w-screen justify-center h-19 fixed bg-background drop-shadow-sm">
            <div className="flex items-center grow-2 h-full px-10">
                <div className="object-contain flex items-center h-4/5 aspect-square">
                    <img src={icon} alt="Logo" className="size-full"/>
                </div>
                <h1 className="font-medium">Travel and Tours</h1>
            </div>
            <div className={"grow-2"}>
                <NavigationMenu >
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link>Home</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href={web_routes.login_page}>Login</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    )
}
import MenuBar from "@/components/menu-bar"
import { Button } from "@/components/ui/button"
export default function Landing(){
    return (
        <>
            <MenuBar></MenuBar>
            <div className="h-screen pt-19 bg-accent">
                <div className="border-2 h-full p-3">
                    <div className="bg-amber-50 width-20 h-4/5"></div>
                    <Button className={'mt-2'}>Get Started</Button>
                </div>
            </div>
        </>
        
    )
}
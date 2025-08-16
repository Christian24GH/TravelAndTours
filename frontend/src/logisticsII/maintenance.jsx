import { Header } from '@/components/logisticsII/tabs'

const panels = [
    {
        title: "Maintenance",
        path: "/maintenance"
    },
    {
        title: "Maintenance Request",
        path: "/maintenance/service"
    },
]
export function MaintenancePage({}){
    return (
        <main>
            <Header items={panels}/>
        </main>
    )
}
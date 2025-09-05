/** TODO: Change the vehicle reservation 
 *  FROM: VIN and CAPACITY 
 *  TO:   TYPE and CAPACITY 
 *  STATUS: DONE
 * */
import {motion} from 'motion/react'
import { Label } from "@/components/ui/label"
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger
} from "@/components/ui/tabs"
import { 
    SingleReservation, 
    BatchReservation 
} from "@/components/logisticsII/reservation/make";



export default function MakeReservationPage(){
    return(
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 h-full ">
            <div className="flex flex-col w-full">
                
                <Label className="text-xl mb-2">Make Reservation</Label>

                <section>
                    <Label className="text-sm mb-1">Mode</Label>
                    <Tabs defaultValue="single" className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="single">Single</TabsTrigger>
                            <TabsTrigger value="batch">Batch</TabsTrigger>
                        </TabsList>
                        <TabsContent value="single">
                            <SingleReservation/>
                        </TabsContent>
                        <TabsContent value="batch">
                            <BatchReservation/>
                        </TabsContent>
                    </Tabs>
                </section>

            </div>
        </motion.div>
    )
}
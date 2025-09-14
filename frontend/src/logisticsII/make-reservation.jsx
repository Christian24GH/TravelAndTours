/** TODO: Change the vehicle reservation 
 *  FROM: VIN and CAPACITY 
 *  TO:   TYPE and CAPACITY 
 *  STATUS: DONE
 * */
import {motion} from 'motion/react'
import { Label } from "@/components/ui/label"
import { 
    BatchReservation 
} from "@/components/logisticsII/reservation/make";

export default function MakeReservationPage(){
    return(
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 h-full"
        >
            <div className="flex flex-col w-full">
                <Label className="text-xl mb-2">Make Reservation</Label>
                <section>
                    <BatchReservation />
                </section>
            </div>
        </motion.div>
    )
}
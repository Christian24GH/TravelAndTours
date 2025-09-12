import { useState, useEffect, useLayoutEffect } from "react";
import { useParams } from "react-router";

import axios from 'axios'
import { logisticsII } from "@/api/logisticsII";
const api = logisticsII.backend.api;
const reverb = logisticsII.reverb

reverb.config()

import { useEchoPublic } from "@laravel/echo-react";

import { motion } from "motion/react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

import { DriverSelect } from "@/components/logisticsII/inputs/driver-select";
import Map from "@/components/logisticsII/reservation/map";

import BusImage from '@/assets/bus-placeholder.jpg'

export default function ReservationDetails(){
    const { batch_number } = useParams()
    const [record, setRecord] = useState()
    const [loading, setLoading] = useState(false)

    useLayoutEffect(()=>{
        setLoading(true)
        if(!batch_number) return
        axios
            .get(api.reservationDetails, {
                params: {
                    batch_number: batch_number
                }})
            .then(response=>{
                const data = response.data?.reservation
                console.log(data)
                setRecord(data)
            })
            .catch(errors=>{
                toast.error('Failed to fetch details', {position:"top-center"})
            }).finally(()=>{
                setLoading(false)
            })
    }, [batch_number])

    //console.log(record)

    const [assignments, setAssignments] = useState([])

    const handleAssign = (vehicle_id, driver_id) => {
        setAssignments((prev) => {
            
            const exists = prev.find(a => a.vehicle_id === vehicle_id)

            if (exists) {
                return prev.map(a =>
                    a.vehicle_id === vehicle_id ? 
                    { ...a, driver_id } : a
                )
            } else {
                return [...prev, { vehicle_id, driver_id }]
            }
        })
    }

    const handleSave = () => {
        if (
            !assignments.length || 
            assignments.some(a => !a.driver_id || !a.vehicle_id)
        ) {
            toast.error("Please assign both driver and vehicle before saving.", { position: "top-center" });
            return;
        }
        
        const payload = {
            id: record?.id,
            assignments: assignments
        }

        axios
            .put(api.approveReservation, payload)
            .then(response=>{
                toast.success('Reservation approved, dispatch created', {position:"top-center"})
            })
            .catch(error=>{
                console.log(error)
                toast.error(`Failed to update reservation ${error.response.data.message}`, {position:"top-center"})
            })
    }

    const handleReject = () => {
        if(!record?.id) return

        const payload = {
            id: record?.id
        }
        axios
            .put(api.cancelReservation, payload)
            .then(response=>{
                toast.success('Reservation rejected, resources freed', {position:"top-center"})
            })
            .catch(error=>{
                console.log(error)
                toast.error(`Failed to update reservation ${error.response.data.message}`, {position:"top-center"})
            })
    }

    useEchoPublic('reservation_channel', "ReservationUpdates", (e)=>{
        let r = e.reservations
        setRecord(r)
    })

    
    return(
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 h-full">
            {loading?(
                <div className="grid grid-cols-2 gap-4 h-full w-full">
                    <div className="grid grid-rows-4 gap-2 h-full">
                        <div className="row-span-2">
                            <Skeleton className="w-full h-full" />
                        </div>

                        <div>
                            <Skeleton className="w-full h-full" />
                        </div>
                        <div>
                            <Skeleton className="w-full h-full" />
                        </div>
                        <div>
                            <Skeleton className="w-full h-full" />
                        </div>
                    </div>

                    <div>
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>
            ):(
                <>
                <div className={"flex flex-col w-1/2"}>
                    <div className="h-1/12 flex justify-between p-2">
                        <Label className="font-semibold text-2xl">RESERVATION {record?.batch_number || null}</Label>
                        <span className="border rounded-full py-0 px-3 flex items-center">{record?.status || null}</span>
                    </div>
                    <Separator/>
                    <div className="flex-1 p-2">
                        <Label className="w-full flex justify-between">Requested By: <span className="font-medium">{record?.employee_id}</span></Label>
                        
                        <div className="my-4 w-full">
                            <Label className="font-semibold">Date and Time</Label>
                            <Separator className="my-1"/>
                            <div className="flex flex-col gap-2 w-full">
                                <Label className="w-full flex justify-between">Start:   <span className="font-medium">{record?.start_time}</span></Label>
                                <Label className="w-full flex justify-between">End:     <span className="font-medium">{record?.end_time}</span></Label>
                            </div>
                        </div>

                        <div className="my-4 w-full">
                            <Label className="font-semibold">Location</Label>
                            <Separator className="my-1"/>
                            <div className="flex flex-col gap-2 w-full">
                                <Label className="w-full flex justify-between">Start:   
                                    <span className="font-medium">{record?.pickup ? JSON.parse(record.pickup).address : 'No address'}</span>
                                </Label>
                                <Label className="w-full flex justify-between">End:     
                                    <span className="font-medium">{record?.dropoff ? JSON.parse(record?.dropoff).address : 'No address'}</span>
                                </Label>
                            </div>
                        </div>

                        <div className="my-4 w-full">
                            <div className="flex w-full justify-between">
                                <Label className="font-semibold">Vehicles and Drivers</Label>
                            {(record?.status === 'Pending' && record?.assignments?.length > 0) ? (
                                    <div className="flex gap-2">
                                        <Label className="hover:underline cursor-pointer" onClick={handleReject}>
                                            Reject
                                        </Label>
                                        <Label className="hover:underline cursor-pointer" onClick={handleSave}>
                                            Approve
                                        </Label>
                                    </div>
                                ) : null}

                            </div>
                            <Separator className="my-1"/>
                            <div className="flex flex-col gap-2 w-full">
                                {record?.assignments.length > 0 && (
                                    record?.assignments.map((d, i)=>(
                                        <div key={i} className="flex justify-end border rounded h-48 shadow">
                                            {/**Place Image here 
                                             * TODO: Later add vehicle image and map them here
                                            */}
                                            <div className="w-full h-full flex-1 object-scale-down">
                                                <img src={BusImage} className="w-full h-full" alt="" loading="lazy" />
                                            </div>
                                            <Separator orientation="vertical"/>
                                            <div className="flex flex-1 flex-col p-2 gap-2">
                                                <div className="flex justify-between">
                                                    <Label>Type: {d.type}</Label>
                                                    <Label>{d.status}</Label>
                                                </div>
                                                <div>
                                                    <Label className="">Capacity: {d.capacity}</Label>
                                                </div>
                                                <div>
                                                    {/**Assign Driver Input */}
                                                    {   record.status === "Cancelled" ? null : 
                                                        d.driver_name ? (
                                                            <Label className="">Driver: {d.driver_name}</Label>
                                                        ) : (
                                                            <DriverSelect
                                                                assignments={assignments}
                                                                onSelect={(driver) => handleAssign(d.vehicle_id, driver.id)}
                                                                defaultValue={d.driver_name}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-1/2 border aspect-square">
                    {record?.pickup && record?.dropoff && (() => {
                        const pickup = JSON.parse(record.pickup)
                        const dropoff = JSON.parse(record.dropoff)

                        return (
                            <Map 
                                start_cord={pickup.coordinates} 
                                end_cord={dropoff.coordinates} 
                            />
                        )
                    })()}

                </div>
                </>
            )}

        </motion.div>
    )
}
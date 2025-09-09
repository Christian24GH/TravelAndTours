import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { DriverSelect } from "@/components/logisticsII/inputs/driver-select";
import Map from "@/components/logisticsII/reservation/map";

import BusImage from '@/assets/bus-placeholder.jpg'

export default function ReservationDetails(){
    const { batch_number } = useParams()
    const [record, setRecord] = useState()
    const [loading, setLoading] = useState(false)

    const lastSerialized = useRef(null)
    const controllerRef = useRef(null)

    const fetchRecord = useCallback(() => {
        // cancel previous request if any
        try {
            if (controllerRef.current) controllerRef.current.abort()
        } catch (e) {}

        const controller = new AbortController()
        controllerRef.current = controller

        axios
            .get(api.reservationDetails, {
                params: { batch_number: batch_number },
                signal: controller.signal,
            })
            .then(response => {
                const data = response.data?.reservation
                // avoid expensive stringify every time by caching
                const serialized = JSON.stringify(data)
                if (lastSerialized.current !== serialized) {
                    lastSerialized.current = serialized

                    // parse frequently used JSON fields once
                    let parsedPickup = null
                    let parsedDropoff = null
                    let parsedGeometry = null
                    try { parsedPickup = data?.pickup ? JSON.parse(data.pickup) : null } catch(e) { parsedPickup = null }
                    try { parsedDropoff = data?.dropoff ? JSON.parse(data.dropoff) : null } catch(e) { parsedDropoff = null }
                    try { parsedGeometry = data?.pretrip_geometry ? JSON.parse(data.pretrip_geometry) : null } catch(e) { parsedGeometry = null }

                    setRecord(prev => ({
                        // keep existing shape, add parsed helpers
                        ...data,
                        _parsedPickup: parsedPickup,
                        _parsedDropoff: parsedDropoff,
                        _parsedGeometry: parsedGeometry,
                    }))
                }
            })
            .catch(errors => {
                if (errors?.name === 'CanceledError' || errors?.message === 'canceled') return
                toast.error('Failed to fetch details', { position: "top-center" })
            }).finally(() => {
                setLoading(false)
            })

    }, [batch_number])

    useEffect(()=>{
        setLoading(true)
        if(!batch_number) return

        // initial fetch then poll
        fetchRecord()
        const polling = setInterval(fetchRecord, 5000)
        return () => {
            clearInterval(polling)
            try { if (controllerRef.current) controllerRef.current.abort() } catch(e) {}
        }
    }, [fetchRecord])

    //console.log(record)

    const [assignments, setAssignments] = useState([])
    const handleAssign = (vehicle_id, driver_uuid) => {
        setAssignments((prev) => {
            
            const exists = prev.find(a => a.vehicle_id === vehicle_id)

            if (exists) {
                return prev.map(a =>
                    a.vehicle_id === vehicle_id ? 
                    { ...a, driver_uuid } : a
                )
            } else {
                return [...prev, { vehicle_id, driver_uuid }]
            }
        })
    }

    const [approveLoading, setApproveLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)
    const handleSave = () => {
        if (
            !assignments.length || 
            assignments.some(a => !a.driver_uuid || !a.vehicle_id)
        ) {
            toast.error("Please assign both driver and vehicle before saving.", { position: "top-center" });
            return;
        }
        
        setApproveLoading(true)
        const payload = {
            id: record?.id,
            assignments: assignments,
        }

        axios
            .put(api.approveReservation, payload)
            .then(response=>{
                toast.success('Reservation approved, budget request sent', {position:"top-center"})
            })
            .catch(error=>{
                console.log(error)
                toast.error(`Failed to update reservation ${error.response.data.message}`, {position:"top-center"})
            }).finally(()=>setApproveLoading(false))
    }

    const handleReject = () => {
        if(!record?.id) return

        setRejectLoading(true)
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
            }).finally(()=>setRejectLoading(false))
    }

    /*
    useEchoPublic('reservation_channel', "ReservationUpdates", (e)=>{
        let r = e.reservations
        setRecord(r)
    })
    */

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
                <div className={"flex flex-col w-1/2 border shadow rounded-md"}>
                    <div className="h-1/12 flex justify-between px-4 py-2">
                        <Label className="font-semibold text-2xl">RESERVATION {record?.batch_number || null}</Label>
                        {(record?.status === 'Pending' && record?.assignments?.length > 0) ? (
                            <div className="flex gap-2 items-center h-full">
                                <Button disabled={approveLoading} size="sm" onClick={handleSave}>{approveLoading ? 'Submitting' : 'Approve'}</Button>
                                <Button variant="destructive" disabled={rejectLoading} size="sm" onClick={handleReject}>{rejectLoading ? 'Submitting' : 'Reject'}</Button>
                            </div>
                        ) : <span className="border rounded-full py-0 px-3 flex items-center">{record?.status || null}</span>}
                    </div>
                    <Separator/>
                    <div className="flex-1 p-2">
                        <Label className="w-full flex justify-between">Requested By: <span className="font-medium">{record?.requestor_uuid}</span></Label>
                        
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
                            </div>
                            <Separator className="my-1"/>
                            <div className="flex flex-col gap-2 w-full">
                                {record?.assignments.length > 0 && (
                                    record?.assignments.map((d, i)=>(
                                        <div key={i} className="flex justify-end h-48">
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
                                                                onSelect={(driver) => handleAssign(d.vehicle_id, driver.uuid)}
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
                <div className="flex flex-col w-1/2 h-full gap-3">
                    <div className="flex flex-1 w-full gap-2">
                        <Card className="flex-1 rounded-md">
                            <CardHeader>
                                <CardTitle>Estimated Cost</CardTitle>
                                <CardDescription>Pre-trip estimated cost</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label className="text-xl text-gray-500">Philippine Peso</Label>
                                <Label className="text-3xl font-semibold">
                                    {record?.pretrip_cost ?? 0}
                                </Label>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 rounded-md">
                            <CardHeader>
                                <CardTitle>Travel Distance</CardTitle>
                                <CardDescription>Distance between 2 points</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label className="text-xl text-gray-500">Kilometer</Label>
                                <Label className="text-3xl font-semibold">
                                    {record?.pretrip_distance ?? 0}
                                </Label>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 rounded-md">
                            <CardHeader>
                                <CardTitle>Travel Duration</CardTitle>
                                <CardDescription>Duration between 2 points</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label className="text-xl text-gray-500">Minutes</Label>
                                <Label className="text-3xl font-semibold">
                                    {record?.pretrip_duration ?? 0}
                                </Label>
                            </CardContent>
                        </Card>
                    </div>
                    {record?.pickup && record?.dropoff && (() => {
                        const pickup = JSON.parse(record.pickup)
                        const dropoff = JSON.parse(record.dropoff)

                        return (
                            <div className="flex-2 rounded-md">
                                <Map className={"w-full h-full"}
                                    key={`${pickup.coordinates}-${dropoff.coordinates}`}
                                    start_cord={pickup.coordinates}
                                    end_cord={dropoff.coordinates}
                                    geometry={JSON.parse(record.pretrip_geometry)} 
                                />
                            </div>
                        )
                    })()}

                </div>
                </>
            )}

        </motion.div>
    )
}
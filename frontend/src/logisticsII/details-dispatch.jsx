import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Play } from "lucide-react";
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton";
import {motion} from 'motion/react'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'

import axios from "axios";
import { logisticsII } from "@/api/logisticsII";
import { toast } from "sonner"
const api = logisticsII.backend.api;

import MemoizedMap from "@/components/logisticsII/reservation/map"

export default function DispatchDetail(){
    const {batch_number} = useParams()
    const [record, setRecord] = useState()
    const [loading, setLoading] = useState(false)
    const [fired, setFired] = useState(false)
    const [ playBtnLoading, setPlayBtnLoading ] = useState(false)
    const fetchRecord = useCallback(() => {
        axios.get(api.dispatchDetails, {
            params: {batch_number: batch_number}
        })
        .then(response=>{
            console.log(response.data)
            setRecord(response.data)
        })
        .catch(errors=>{
            if(!fired){
                toast.error('Failed to retrieve dispatch');
                setFired(true)
            }
        }).finally(()=>setLoading(false))
    }, [batch_number])
    
    useEffect(()=>{
        setLoading(true)
        if(!batch_number) return
        let polling = setInterval(fetchRecord, 10000)
        return () => clearInterval(polling)
    }, [fetchRecord])

    const tripMetrics = record?.metrics?.map(m => ({
        ...m,
        geometry: m.geometry ? JSON.parse(m.geometry) : null
    })) ?? [];
    
    let geometry = {
        type: "MultiLineString",
        coordinates: tripMetrics
        .map(r => r.geometry?.coordinates)
        .filter(Boolean) // remove nulls
    };
    
    const handleStart = (dispatchId) => {
        if(!dispatchId) return

        setPlayBtnLoading(true)
        

        axios.put(`${api.dispatchStart}/${dispatchId}`)
            .then(response => {toast.success('Dispatch Started')})
            .catch(e => {
                console.log(e)
                toast.warning(e.response.data.message)
            })
            .finally(()=>setPlayBtnLoading(false))
    }
    return (
        <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 h-full"
            >
              {loading ? (
                <div className="grid grid-cols-2 gap-4 h-full w-full">
                  <Skeleton className="w-full h-full col-span-2" />
                </div>
              ) : (
            <div className="w-full h-full container flex gap-2">
                <div className="flex flex-col gap-2 flex-1">
                    <Card className="rounded-md max-h-1/4">
                        <CardHeader>
                            <CardTitle>
                                {batch_number}
                            </CardTitle>
                            <CardDescription>
                                {record?.reservation.status}
                            </CardDescription>
                            <CardAction>
                                <Button disabled={playBtnLoading} onClick={()=>handleStart(record?.dispatch_orders[0].dispatch_id)}>
                                    <Play/>
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <Label className="font-normal">Start Date: <Label className="text-gray-700">{record?.reservation.start_date ? record?.reservation.start_date : 'Waiting'}</Label></Label>
                            <Label className="font-normal">End Date: <Label className="text-gray-700">{record?.reservation.end_date ? record?.reservation.end_date : 'Waiting'}</Label></Label>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col flex-1 max-h-3/4 gap-3 px-4">
                        <div className="flex-1 overflow-y-auto">
                            <Label className="text-2xl">Dispatches</Label>
                            {record?.dispatch_orders.map((dispatch, index) => {
                                const item = dispatch?.assignment
                                return(
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between">
                                            <Label>Assignment {index + 1}</Label>
                                            <Label>{dispatch?.dispatch_status}</Label>
                                        </div>
                                        <div className="px-2 space-y-1 mb-2">
                                            <Label>Vehicle</Label>
                                            <div className="flex justify-between">
                                                <Label className="font-normal text-gray-700">{item.model}</Label>
                                                <Label className="font-normal text-gray-700">{item.type}</Label>
                                                <Label className="font-normal text-gray-700">{item.capacity} max</Label>
                                                <Label className="font-normal text-gray-700">{item.vehicle_status}</Label>
                                            </div>
                                    
                                            <Label>Driver</Label>
                                            <div className="flex justify-between">
                                                <Label className="font-normal text-gray-700">{item.driver_name}</Label>
                                                <Label className="font-normal text-gray-700">{item.driver_status}</Label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <Label className="text-2xl">Routes</Label>
                            {record?.routes.length != 0 ? 
                                record?.routes.map((item, index) => (
                                    <div key={index}>
                                        <Label>Route {index + 1}</Label>
                                        <div className="px-2 space-y-1 mb-2">
                                            <Label>From</Label>
                                            <div className="flex justify-between">
                                                <Label className="font-normal text-gray-700">{item.start_address}</Label>
                                            </div>
                                            <Label>To</Label>
                                            <div className="flex justify-between">
                                                <Label className="font-normal text-gray-700">{item.end_address}</Label>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            : null}
                        </div>
                    </div>
                </div>
                <div className="flex-3 rounded-md p-1 max-h-3/4">
                    {record?.routes?.length >= 1 && (
                        <div className="rounded-md h-full relative">
                            <MemoizedMap
                            className="w-full h-full relative overflow-hidden"
                            key={record.routes.map((r) => r.id).join("|")}
                            stops={record.routes.flatMap((r) => [
                                [r.start_longitude, r.start_latitude],
                                [r.end_longitude, r.end_latitude],
                            ])}
                            geometry={geometry}
                            />
                        </div>
                    )}
                </div>
            </div>
            )}
        </motion.div>
    )
}
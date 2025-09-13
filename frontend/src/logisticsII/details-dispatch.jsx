import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'

import axios from "axios";
import { logisticsII } from "@/api/logisticsII";
const api = logisticsII.backend.api;


export default function DispatchDetail(){
    const {batch_number} = useParams()
    const [record, setRecord] = useState()
    const [loading, setLoading] = useState(false)

    const fetchRecord = useCallback(() => {
        axios.get(api.dispatchDetails, {
            params: {batch_number: batch_number}
        })
        .then(response=>{
            setRecord(response.data.dispatch)
        })
        .catch(errors=>{
            console.log(errors)
        })
    }, [batch_number])

    useEffect(()=>{
        setLoading(true)
        if(!batch_number) return
        fetchRecord()
        console.log(record)
    }, [fetchRecord])

    return (
        <>
            <Card className="rounded-md">
                <CardContent>
                    <Label className="3xl">{batch_number}</Label>
                </CardContent>
            </Card>
            <div className="w-full h-full container gap-2 flex">
                <div className="flex flex-col flex-1 h-full gap-3">
                    <Card className="rounded-md flex-1">
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>

                        </CardContent>
                        <CardFooter>

                        </CardFooter>
                    </Card>
                    <Card className="rounded-md flex-2">
                        <CardHeader>
                            <CardTitle>Logs</CardTitle>
                        </CardHeader>
                        <CardContent>

                        </CardContent>
                        <CardFooter>

                        </CardFooter>
                    </Card>
                </div>
                <Card className="flex-3 rounded-md">

                </Card>
            </div>
        </>
    )
}
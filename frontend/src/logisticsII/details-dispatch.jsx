import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'


export default function DispatchDetail(){
    const { uuid } = useParams()

    return (
        <>
            <Card className="rounded-md">

            </Card>
        </>
    )
}
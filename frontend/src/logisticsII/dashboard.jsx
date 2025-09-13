import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import ReservationTrendChart from '@/components/logisticsII/charts/reservation-trend-chart'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'


import { motion } from 'motion/react'
import React, {useState, useEffect, useContext, useCallback} from 'react';
import axios from 'axios'
import { logisticsII } from '@/api/logisticsII';

const api = logisticsII.backend.api

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

export default function Dashboard() {
  return (
    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex flex-col gap-3 h-full">
      <div className="flex w-full gap-2">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Reservation Trend</CardTitle>
            <CardContent>
              <ReservationTrendChart/>
            </CardContent>
          </CardHeader>
          <CardContent>
            <Label>Data</Label>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Data 2</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Data</Label>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Data 3</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Data</Label>
          </CardContent>
        </Card>
      </div>
      <div className="flex w-full gap-2 h-full">
        <Card className="flex-2/3 h-full">
          <CardContent>
            MapInstance
          </CardContent>
        </Card>
        <Card className="flex-1/3 h-full">
          <CardHeader>
            <CardTitle>
              <Label className="text-2xl">Dispatch Operations</Label>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </motion.div>
  );
}

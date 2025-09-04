import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, LogIn, LogOut } from "lucide-react";

export default function EmployeeClocking() {
  const clockingData = [
    { id: 1, time: "18:00", type: "Clock-In", device: "Web Browser", status: "Success" },
    { id: 2, time: "18:30", type: "Break-In", device: "Web Browser", status: "Success" },
    { id: 3, time: "18:45", type: "Break-Out", device: "Web Browser", status: "Success" },
    { id: 4, time: "19:00", type: "Clock-Out", device: "Web Browser", status: "Success" },
  ];

  return (
    <Dialog>
      <div className="rounded-2xl shadow-md border bg-white h-full p-6 space-y-6">
        {/* Top Status Row */}
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-sm bg-gray-50">
            <h1 className="text-lg font-semibold">Status</h1>
            <Badge variant="secondary" className="mt-2 text-lg px-3 py-1">
              Off-Duty
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-sm bg-gray-50">
            <h1 className="text-lg font-semibold">Shift</h1>
            <p className="text-xl text-gray-700">18:00 – 06:00</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-sm bg-gray-50">
            <h1 className="text-lg font-semibold">Department</h1>
            <p className="text-xl text-gray-700">Human Resources</p>
          </div>
        </div>

        {/* Buttons + Info */}
        <div className="grid grid-rows-2 gap-6">
          {/* Clocking Buttons */}
          <div className="grid grid-cols-4 gap-4">
            <Button className="text-lg rounded-xl flex gap-2 items-center bg-green-600 hover:bg-green-700">
              <LogIn size={20} /> Clock-In
            </Button>
            <Button className="text-lg rounded-xl flex gap-2 items-center bg-yellow-600 hover:bg-yellow-700">
              <Coffee size={20} /> Break-In
            </Button>
            <Button className="text-lg rounded-xl flex gap-2 items-center bg-orange-600 hover:bg-orange-700">
              <Coffee size={20} /> Break-Out
            </Button>
            <Button className="text-lg rounded-xl flex gap-2 items-center bg-red-600 hover:bg-red-700">
              <LogOut size={20} /> Clock-Out
            </Button>
          </div>

          {/* Device Info */}
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div className="flex gap-2">
              <span className="font-semibold">Device:</span>
              <span className="text-gray-600">Web Browser</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">IP Address:</span>
              <span className="text-gray-600">192.168.1.100</span>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="rounded-xl border shadow-sm">
          <DialogHeader>
            <DialogTitle className="px-4 py-3 text-lg">Today's Logs</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead className="text-center">Time</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Device</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clockingData.map((entry, i) => (
                <TableRow
                  key={entry.id}
                  className={i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-100"}
                >
                  <TableCell className="text-center">{entry.id}</TableCell>
                  <TableCell className="text-center">{entry.time}</TableCell>
                  <TableCell className="text-center">{entry.type}</TableCell>
                  <TableCell className="text-center">{entry.device}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="success">{entry.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Dialog>
  );
}

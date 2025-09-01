import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
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

export default function EmployeeClocking() {
  const clockingData = [
    { id: 1, time: "18:00", type: "Clock-In", device: "Web Browser", status: "Success" },
    { id: 2, time: "18:30", type: "Break-In", device: "Web Browser", status: "Success" },
    { id: 3, time: "18:45", type: "Break-Out", device: "Web Browser", status: "Success" },
    { id: 4, time: "19:00", type: "Clock-Out", device: "Web Browser", status: "Success" },
  ];

  return (
    <Dialog>
      <div className="shadow-sm inset-shadow-sm rounded-lg h-full">
        <div className="grid h-full grid-rows-18 p-5 gap-5">
          <div className="row-span-3 grid grid-cols-3 items-center p-5 gap-9">
            <div className="shadow-sm inset-shadow-sm rounded-md h-full border text-center flex justify-center items-center gap-3">
              <h1 className="text-2xl tracking-wider font-bold">Status:</h1>
              <p className="text-xl tracking-wider text-gray-500">Off-Duty</p>
            </div>
            <div className="shadow-sm inset-shadow-sm rounded-md h-full border text-center flex justify-center items-center gap-3">
              <h1 className="text-xl tracking-wider font-bold">NameShift:</h1>
              <p className="text-xl tracking-wider text-gray-500">18:00-6:00</p>
            </div>
            <div className="shadow-sm inset-shadow-sm rounded-md h-full border text-center flex justify-center items-center gap-3">
              <h1 className="text-xl tracking-wider font-bold">Department:</h1>
              <p className="text-xl tracking-wider text-gray-500">Human Resources</p>
            </div>
          </div>
          <div className="row-span-6 h-full shadow-sm inset-shadow-sm p-5 grid rounded-md grid-rows-2 gap-6">
            <div className="h-full grid grid-cols-4 gap-8 mt-3">
              <div className="flex justify-center items-center"> <Button className="text-xl bg-black hover:bg-gray-700 hover:shadow-2xl">Clock-In</Button></div>
              <div className="flex justify-center items-center"> <Button className="text-xl bg-black hover:bg-gray-700 hover:shadow-2xl">Break-In</Button></div>
              <div className="flex justify-center items-center"> <Button className="text-xl bg-black hover:bg-gray-700 hover:shadow-2xl">Break-Out</Button></div>
              <div className="flex justify-center items-center"> <Button className="text-xl bg-black hover:bg-gray-700 hover:shadow-2xl">Clock-Out</Button></div>
            </div>
            <div className="h-full grid grid-cols-4 gap-8">
              <div className="flex justify-center items-center">
                <h1 className="text-xl tracking-wider font-bold mr-3">Device:</h1>
                <p className="text-xl tracking-wider text-gray-500">Web Browser</p>
              </div>
              <div className="flex justify-center items-center">
                <h1 className="text-xl tracking-wider font-bold mr-3">Ip Address:</h1>
                <p className="text-xl tracking-wider text-gray-500">192.168.1.100</p>
              </div>
              <div className="flex justify-center items-center"></div>
              <div className="flex justify-center items-center"></div>
            </div>
          </div>
          <div className="row-span-9 shadow-sm inset-shadow-sm h-full">
            <DialogTitle className="p-3">Today's Logs</DialogTitle>
            <Table className="w-full text-center h-69">
              <TableHeader className="border-t">
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Device</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clockingData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.id}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{entry.device}</TableCell>
                    <TableCell>{entry.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
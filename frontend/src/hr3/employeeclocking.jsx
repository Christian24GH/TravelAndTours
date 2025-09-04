import React, { useState } from "react";
import {
  Dialog,
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
import { Coffee, LogIn, LogOut } from "lucide-react";

export default function EmployeeClocking() {
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("Off-Duty");

  // Track actions to prevent multiple clicks
  const [actionsDone, setActionsDone] = useState({
    clockIn: false,
    breakIn: false,
    breakOut: false,
    clockOut: false,
  });

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addLog = (type) => {
    const newLog = {
      id: logs.length + 1,
      time: getTime(),
      type,
      device: "Web Browser",
      status: "Success",
    };
    setLogs([...logs, newLog]);
  };

  const handleClockIn = () => {
    if (actionsDone.clockIn) return; // Prevent duplicate
    addLog("Clock-In");
    setStatus("On-Duty");
    setActionsDone({ ...actionsDone, clockIn: true });
  };

  const handleBreakIn = () => {
    if (actionsDone.breakIn) return;
    addLog("Break-In");
    setStatus("On Break");
    setActionsDone({ ...actionsDone, breakIn: true });
  };

  const handleBreakOut = () => {
    if (actionsDone.breakOut) return;
    addLog("Break-Out");
    setStatus("On-Duty");
    setActionsDone({ ...actionsDone, breakOut: true });
  };

  const handleClockOut = () => {
    if (actionsDone.clockOut) return;
    addLog("Clock-Out");
    setStatus("Off-Duty");

    const clockIn = logs.find((l) => l.type === "Clock-In")?.time || "-";
    const breakIn = logs.find((l) => l.type === "Break-In")?.time || "-";
    const breakOut = logs.find((l) => l.type === "Break-Out")?.time || "-";
    const clockOut = getTime();

    let totalHours = "-";
    if (clockIn !== "-" && clockOut !== "-") {
      const [inH, inM] = clockIn.split(":").map(Number);
      const [outH, outM] = clockOut.split(":").map(Number);
      const start = new Date();
      const end = new Date();
      start.setHours(inH, inM);
      end.setHours(outH, outM);
      const diffMs = end - start;
      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
      const diffM = Math.floor((diffMs / (1000 * 60)) % 60);
      totalHours = `${diffH}h ${diffM}m`;
    }

    const shiftRecord = {
      date: new Date().toLocaleDateString(),
      status: "Pending",
      clockIn,
      breakIn,
      breakOut,
      clockOut,
      totalHours,
    };

    setHistory([...history, shiftRecord]);
    setLogs([]);
    setActionsDone({ clockIn: false, breakIn: false, breakOut: false, clockOut: false }); // reset for next shift
  };

  return (
    <Dialog>
      <div className="rounded-2xl shadow-md border bg-white h-full p-6 space-y-6">
        {/* Buttons */}
        <div className="grid grid-cols-4 gap-4">
          <Button
            onClick={handleClockIn}
            disabled={actionsDone.clockIn}
            className="text-lg rounded-xl flex gap-2 items-center bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <LogIn size={20} /> Clock-In
          </Button>

          <Button
            onClick={handleBreakIn}
            disabled={actionsDone.breakIn}
            className="text-lg rounded-xl flex gap-2 items-center bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
          >
            <Coffee size={20} /> Break-In
          </Button>

          <Button
            onClick={handleBreakOut}
            disabled={actionsDone.breakOut}
            className="text-lg rounded-xl flex gap-2 items-center bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
          >
            <Coffee size={20} /> Break-Out
          </Button>

          <Button
            onClick={handleClockOut}
            disabled={actionsDone.clockOut}
            className="text-lg rounded-xl flex gap-2 items-center bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <LogOut size={20} /> Clock-Out
          </Button>
        </div>

        {/* Today's Logs */}
        <div className="rounded-xl border shadow-sm mt-6">
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
              {logs.map((entry, i) => (
                <TableRow key={entry.id} className="hover:bg-gray-100">
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

        {/* Shift History */}
        <div className="rounded-xl border shadow-sm mt-6">
          <DialogHeader>
            <DialogTitle className="px-4 py-3 text-lg">Shift History</DialogTitle>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="p-4 text-gray-500">No shift history yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Time In</TableHead>
                  <TableHead className="text-center">Break In</TableHead>
                  <TableHead className="text-center">Break Out</TableHead>
                  <TableHead className="text-center">Time Out</TableHead>
                  <TableHead className="text-center">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((shift, i) => (
                  <TableRow key={i} className="hover:bg-gray-100">
                    <TableCell className="text-center">{shift.date}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{shift.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{shift.clockIn}</TableCell>
                    <TableCell className="text-center">{shift.breakIn}</TableCell>
                    <TableCell className="text-center">{shift.breakOut}</TableCell>
                    <TableCell className="text-center">{shift.clockOut}</TableCell>
                    <TableCell className="text-center">{shift.totalHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Dialog>
  );
}

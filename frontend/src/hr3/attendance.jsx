import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import AddAttendance from "@/components/hr3/AddAttendance";
import ExportData from "@/components/hr3/ExportData";
import ApproveAdjustments from "@/components/hr3/ApproveAdjustments";

export default function Attendance() {
  const columns = [
    { id: "id", label: "ID" },
    { id: "employeeName", label: "Employee Name" },
    { id: "date", label: "Date" },
    { id: "timeIn", label: "Time In" },
    { id: "breakIn", label: "Break In" },
    { id: "breakOut", label: "Break Out" },
    { id: "timeOut", label: "Time Out" },
    { id: "total", label: "Total" },
    { id: "status", label: "Status" },
  ];

  const data = [
    { id: 1, employeeName: 'John Doe', date: '2023-01-01', status: 'Present', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 2, employeeName: 'Jane Smith', date: '2023-01-01', status: 'Absent', timeIn: '00:00', breakIn: '00:00', breakOut: '00:00', timeOut: '00:00', total: '00:00' },
    { id: 4, employeeName: 'Sarah Williams', date: '2023-01-01', status: 'Late', timeIn: '08:30', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '7:30' },
    { id: 7, employeeName: 'James Wilson', date: '2023-01-02', status: 'Leave', timeIn: '-', breakIn: '-', breakOut: '-', timeOut: '-', total: '0:00' },
    { id: 8, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '09:00', breakIn: '12:30', breakOut: '13:30', timeOut: '18:00', total: '8:00' },
  ];

  // Calculate summary values
  const totalEmployees = data.length;
  const presentCount = data.filter(item => item.status === 'Present').length;
  const absentCount = data.filter(item => item.status === 'Absent').length;
  const lateCount = data.filter(item => item.status === 'Late').length;
  const leaveCount = data.filter(item => item.status === 'Leave').length;
  const adjustmentsCount = data.filter(item => item.status === 'Adjustment').length;

  const [search, setSearch] = useState('');

  const filteredData = data.filter(item =>
    item.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  // map statuses to badge colors
  const statusVariant = {
    Present: "success",
    Absent: "destructive",
    Late: "secondary",
    Leave: "default",
    Adjustment: "secondary",
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Total</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{totalEmployees}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Present</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">{presentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Absent</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">{absentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Late</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-600">{lateCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>On Leave</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-blue-600">{leaveCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Adjustments</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-purple-600">{adjustmentsCount}</CardContent>
        </Card>
      </div>

      {/* Actions + Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 sticky top-0 bg-white z-10 py-2">
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Attendance</Button>
            </DialogTrigger>
            <AddAttendance />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Export Data</Button>
            </DialogTrigger>
            <ExportData />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Approve Adjustments</Button>
            </DialogTrigger>
            <ApproveAdjustments />
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full"
          />
          <Button variant="outline" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-auto rounded-lg border max-h-[500px]">
        <Table className="w-full">
          <TableCaption>Attendance Records</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.id === "status" ? (
                      <Badge variant={statusVariant[row.status] || "default"}>
                        {row[column.id]}
                      </Badge>
                    ) : (
                      row[column.id]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

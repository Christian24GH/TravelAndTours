import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription} from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    { id: 3, employeeName: 'Mike Johnson', date: '2023-01-01', status: 'Present', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 4, employeeName: 'Sarah Williams', date: '2023-01-01', status: 'Late', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 5, employeeName: 'David Brown', date: '2023-01-02', status: 'Present', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 6, employeeName: 'Lisa Davis', date: '2023-01-02', status: 'Absent', timeIn: '00:00', breakIn: '00:00', breakOut: '00:00', timeOut: '00:00', total: '00:00' },
    { id: 7, employeeName: 'James Wilson', date: '2023-01-02', status: 'Leave', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 8, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 9, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 10, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 11, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 12, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 13, employeeName: 'Sarah Williams', date: '2023-01-01', status: 'Late', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 14, employeeName: 'David Brown', date: '2023-01-02', status: 'Present', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 15, employeeName: 'Lisa Davis', date: '2023-01-02', status: 'Absent', timeIn: '00:00', breakIn: '00:00', breakOut: '00:00', timeOut: '00:00', total: '00:00' },
    { id: 16, employeeName: 'James Wilson', date: '2023-01-02', status: 'Leave', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 17, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 18, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
    { id: 19, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Adjustment', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  ];
  
  // Calculate summary values
  const totalEmployees = data.length;
  const presentCount = data.filter(item => item.status === 'Present').length;
  const absentCount = data.filter(item => item.status === 'Absent').length;
  const lateCount = data.filter(item => item.status === 'Late').length;
  const leaveCount = data.filter(item => item.status === 'Leave').length;
  const adjustmentsCount = data.filter(item => item.status === 'Adjustment').length;

  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  const filteredData = [...data]
    .filter(item => item.employeeName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.id - a.id); // Sort by ID descending to show newest first
  console.log(filteredData);

  return (
    <div className="px-4 h-auto">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1><hr />
        <div className="mt-3">
          <div className="grid grid-cols-6 gap-5 h-[10rem] text-center pl-2">
            <div className="col-span-1 rounded-md shadow-sm inline-shadow-sm grid grid-cols-3">
              <div className="col-span-2 bg-gray-200 text-wrap text-start text-2xl font-bold items-center flex p-2">Total Employees</div>
              <div className="text-3xl font-bold items-center flex justify-center p-2">{totalEmployees}</div>
            </div>
            <div className="col-span-1 rounded-md shadow-sm inline-shadow-sm grid grid-cols-3">
              <div className="col-span-2 bg-gray-200 text-wrap text-start text-2xl font-bold items-center flex p-2">Present</div>
              <div className="text-3xl font-bold items-center flex justify-center p-2">{presentCount}</div>
            </div>
            <div className="col-span-1 rounded-md shadow-sm inline-shadow-sm grid grid-cols-3">
              <div className="col-span-2 bg-gray-200 text-wrap text-start text-2xl font-bold items-center flex p-2">Absent</div>
              <div className="text-3xl font-bold items-center flex justify-center p-2">{absentCount}</div>
            </div>
            <div className="col-span-1 rounded-md shadow-sm inline-shadow-sm grid grid-cols-3">
              <div className="col-span-2 bg-gray-200 text-wrap text-start text-2xl font-bold items-center flex p-2">Late</div>
              <div className="text-3xl font-bold items-center flex justify-center p-2">{lateCount}</div>
            </div>
            <div className="col-span-1 rounded-md shadow-sm inline-shadow-sm grid grid-cols-3">
              <div className="col-span-2 bg-gray-200 text-wrap text-start text-2xl font-bold items-center flex p-2">On Leave</div>
              <div className="text-3xl font-bold items-center flex justify-center p-2">{leaveCount}</div>
            </div>
            <div className="col-span-1 rounded-md shadow-sm inline-shadow-s grid grid-cols-3">
              <div className="col-span-2 bg-gray-200 text-start text-wrap text-2xl font-bold items-center flex justify-center p-2">Pending Adjustments</div>
              <div className="text-3xl font-bold items-center flex justify-center p-2">{adjustmentsCount}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 items-center my-5">
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
        
        <div className="grid grid-cols-5 gap-1">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[100%] h-[40px] col-span-4 rounded-full"
          />
          <Button className="items-center w-fit rounded-full" variant="outline"><Search className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="h-[80%] overflow-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Table className="w-full h-[80%]">
          <TableCaption>Attendance Records</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.id}>{row[column.id]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

  );
}
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { TimesheetDialog } from '@/components/hr3/timesheetDialog';
import { useState } from 'react'

const columns = [
  { id: "id", label: "ID" },
  { id: "employeeName", label: "Name" },
  { id: "status", label: "Status" },
  { id: "action", label: "Action" },
];
const allData = [
  { id: 1, employeeName: 'John Doe', date: '2023-01-01', status: 'Pending', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 11, employeeName: 'John Doe', date: '2023-01-02', status: 'Pending', timeIn: '08:15', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '7:45' },
  { id: 12, employeeName: 'John Doe', date: '2023-01-03', status: 'Approved', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 2, employeeName: 'Jane Smith', date: '2023-01-01', status: 'Approved', timeIn: '00:00', breakIn: '00:00', breakOut: '00:00', timeOut: '00:00', total: '00:00' },
  { id: 13, employeeName: 'Jane Smith', date: '2023-01-02', status: 'Pending', timeIn: '08:30', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '7:30' },
  { id: 3, employeeName: 'Mike Johnson', date: '2023-01-01', status: 'Pending', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 14, employeeName: 'Mike Johnson', date: '2023-01-03', status: 'Pending', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 4, employeeName: 'Sarah Williams', date: '2023-01-01', status: 'Pending', timeIn: '08:30', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '7:30' },
  { id: 5, employeeName: 'David Brown', date: '2023-01-02', status: 'Approved', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 6, employeeName: 'Lisa Davis', date: '2023-01-02', status: 'Pending', timeIn: '00:00', breakIn: '00:00', breakOut: '00:00', timeOut: '00:00', total: '00:00' },
  { id: 15, employeeName: 'Lisa Davis', date: '2023-01-04', status: 'Approved', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 7, employeeName: 'James Wilson', date: '2023-01-02', status: 'Approved', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 8, employeeName: 'Emily Clark', date: '2023-01-02', status: 'Pending', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 16, employeeName: 'Emily Clark', date: '2023-01-03', status: 'Pending', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 9, employeeName: 'Robert Taylor', date: '2023-01-02', status: 'Approved', timeIn: '08:15', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '7:45' },
  { id: 10, employeeName: 'Maria Garcia', date: '2023-01-02', status: 'Pending', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
  { id: 17, employeeName: 'Maria Garcia', date: '2023-01-04', status: 'Approved', timeIn: '08:00', breakIn: '12:00', breakOut: '13:00', timeOut: '17:00', total: '8:00' },
];

// Get unique employees with their first record
const uniqueEmployees = allData.reduce((acc, current) => {
  const x = acc.find(item => item.employeeName === current.employeeName);
  if (!x) {
    return acc.concat([current]);
  } else {
    return acc;
  }
}, []);

export default function Timesheet() {
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <div className="h-full overflow-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Table className="w-full h-full">
          <TableCaption>Attendance Records</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(showAllRecords ? allData.filter(row => row.employeeName === currentEmployee?.employeeName) : uniqueEmployees).map((row) => (
              <TableRow key={row.id}>
                <TimesheetDialog 
                  employee={showAllRecords ? allData.filter(r => r.employeeName === row.employeeName) : row} 
                  open={openDialog && selectedEmployee?.id === row.id} 
                  onOpenChange={setOpenDialog} 
                />
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedEmployee(row);
                      setOpenDialog(true);
                      setCurrentEmployee(row);
                      setShowAllRecords(true);
                    }}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Update status logic would go here
                      const updatedData = allData.map(item => 
                        item.id === row.id ? {...item, status: 'Approved'} : item
                      );
                      // In a real app, you would update state or make an API call here
                    }}
                  >
                    Approve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
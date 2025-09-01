import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const dummyLeaveRequests = [
  { id: 1, employee: "John Doe", type: "Sick Leave", date: "2024-06-01", status: "Pending" },
  { id: 2, employee: "Jane Smith", type: "Vacation", date: "2024-06-05", status: "Approved" },
  { id: 3, employee: "Alice Johnson", type: "Emergency", date: "2024-06-03", status: "Rejected" },
];

const dummyLeaveBalances = [
  { id: 1, employee: "John Doe", vacation: 10, sick: 5, emergency: 2 },
  { id: 2, employee: "Jane Smith", vacation: 15, sick: 3, emergency: 1 },
];

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useState(dummyLeaveRequests);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Leave Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>{req.employee}</TableCell>
              <TableCell>{req.type}</TableCell>
              <TableCell>{req.date}</TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell>
                <Button disabled={req.status !== "Pending"}>Approve</Button>
                <Button disabled={req.status !== "Pending"} className="ml-2">Reject</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="text-xl font-bold mt-8 mb-4">Leave Balances</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Vacation</TableCell>
            <TableCell>Sick</TableCell>
            <TableCell>Emergency</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyLeaveBalances.map((balance) => (
            <TableRow key={balance.id}>
              <TableCell>{balance.employee}</TableCell>
              <TableCell>{balance.vacation}</TableCell>
              <TableCell>{balance.sick}</TableCell>
              <TableCell>{balance.emergency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="text-xl font-bold mt-8 mb-4">Leave Calendar (Placeholder)</h2>
      <p>Integrated view with shifts and schedules will appear here.</p>

      <h2 className="text-xl font-bold mt-8 mb-4">Leave Reports (Placeholder)</h2>
      <p>Insights for planning and compliance will appear here.</p>
    </div>
  );
}
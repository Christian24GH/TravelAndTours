import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const dummyClaims = [
  { id: 1, employee: "John Doe", type: "Travel", amount: 150, status: "Pending" },
  { id: 2, employee: "Jane Smith", type: "Food", amount: 50, status: "Approved" },
  { id: 3, employee: "Alice Johnson", type: "Medical", amount: 200, status: "Rejected" },
];

export default function Claims() {
  const [claims, setClaims] = useState(dummyClaims);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Claims Submission</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow key={claim.id}>
              <TableCell>{claim.employee}</TableCell>
              <TableCell>{claim.type}</TableCell>
              <TableCell>${claim.amount}</TableCell>
              <TableCell>{claim.status}</TableCell>
              <TableCell>
                <Button disabled={claim.status !== "Pending"}>Approve</Button>
                <Button disabled={claim.status !== "Pending"} className="ml-2">Reject</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="text-xl font-bold mt-8 mb-4">Receipt Upload & Verification (Placeholder)</h2>
      <p>Attach scanned receipts or proof here.</p>

      <h2 className="text-xl font-bold mt-8 mb-4">Reimbursement Tracking</h2>
      <p>Pending, approved, and released reimbursements will be tracked here.</p>

      <h2 className="text-xl font-bold mt-8 mb-4">Claims Reports (Placeholder)</h2>
      <p>Expense analytics for finance will appear here.</p>
    </div>
  );
}
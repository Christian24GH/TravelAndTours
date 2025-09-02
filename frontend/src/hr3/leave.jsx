import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const dummyLeaveRequests = [
  { 
    id: 1, 
    employee: "John Doe", 
    type: "Sick Leave", 
    startDate: "2024-06-01",
    endDate: "2024-06-02",
    reason: "Medical appointment",
    status: "Pending" 
  },
  { 
    id: 2, 
    employee: "Jane Smith", 
    type: "Vacation", 
    startDate: "2024-06-05",
    endDate: "2024-06-07",
    reason: "Family vacation",
    status: "Approved" 
  },
];

const dummyLeaveBalances = [
  { id: 1, employee: "John Doe", vacation: 10, sick: 5, emergency: 2 },
  { id: 2, employee: "Jane Smith", vacation: 15, sick: 3, emergency: 1 },
];

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useState(dummyLeaveRequests);
  const [leaveBalances, setLeaveBalances] = useState(dummyLeaveBalances);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleApprove = (requestId) => {
    // Update leave request status
    const updatedRequests = leaveRequests.map(req =>
      req.id === requestId ? { ...req, status: "Approved" } : req
    );

    // Update leave balance
    const request = leaveRequests.find(req => req.id === requestId);
    const updatedBalances = leaveBalances.map(balance => {
      if (balance.employee === request.employee) {
        const type = request.type.toLowerCase().split(' ')[0];
        return {
          ...balance,
          [type]: balance[type] - 1
        };
      }
      return balance;
    });

    setLeaveRequests(updatedRequests);
    setLeaveBalances(updatedBalances);
  };

  const handleReject = (requestId) => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === requestId ? { ...req, status: "Rejected" } : req
    ));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Leave Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>{req.employee}</TableCell>
              <TableCell>{req.type}</TableCell>
              <TableCell>{format(new Date(req.startDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(new Date(req.endDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {req.status}
                </span>
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewRequest(req)}
                >
                  View
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(req.id)} 
                  disabled={req.status !== "Pending"}
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(req.id)} 
                  disabled={req.status !== "Pending"}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Leave Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review leave request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold">Employee</label>
                  <p>{selectedRequest.employee}</p>
                </div>
                <div>
                  <label className="font-bold">Leave Type</label>
                  <p>{selectedRequest.type}</p>
                </div>
                <div>
                  <label className="font-bold">Start Date</label>
                  <p>{format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="font-bold">End Date</label>
                  <p>{format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}</p>
                </div>
                <div className="col-span-2">
                  <label className="font-bold">Reason</label>
                  <p>{selectedRequest.reason}</p>
                </div>
                <div>
                  <label className="font-bold">Status</label>
                  <p className={`font-medium ${
                    selectedRequest.status === 'Approved' ? 'text-green-600' :
                    selectedRequest.status === 'Rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {selectedRequest.status}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Balances Table */}
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
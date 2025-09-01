import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function AttendanceRequest() {
  // Sample analytics data
  const analytics = {
    pending: 5,
    approvedToday: 3,
    rejectedToday: 1,
    totalThisMonth: 20,
  };

  // Sample attendance request data
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "John Doe",
      date: "2024-06-01",
      type: "Clock-In",
      proposed: "6:00 AM",
      reason: "Medical Appointment",
      evidence: "medical_note.pdf",
      status: "Pending",
    },
    {
      id: 2,
      name: "Jane Smith",
      date: "2024-06-02",
      type: "Clock-Out",
      proposed: "6:00 PM",
      reason: "Family Emergency",
      evidence: "none",
      status: "Approved",
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState("");

  const openModal = (request) => {
    setSelectedRequest(request);
    setActionStatus("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleActionChange = (status) => {
    setActionStatus(status);
  };

  const handleSubmit = () => {
    if (!selectedRequest) return;
    // Update the request status based on actionStatus
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: actionStatus } : req
      )
    );
    closeModal();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Requests</h1>

      {/* Analytics Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-md shadow-sm inline-shadow-sm grid grid-cols-3 bg-gray-100 p-4">
          <div className="col-span-2 text-start text-2xl font-bold flex items-center">Pending</div>
          <div className="text-3xl font-bold flex justify-center items-center">{analytics.pending}</div>
        </div>
        <div className="rounded-md shadow-sm inline-shadow-sm grid grid-cols-3 bg-gray-100 p-4">
          <div className="col-span-2 text-start text-2xl font-bold flex items-center">Approved Today</div>
          <div className="text-3xl font-bold flex justify-center items-center">{analytics.approvedToday}</div>
        </div>
        <div className="rounded-md shadow-sm inline-shadow-sm grid grid-cols-3 bg-gray-100 p-4">
          <div className="col-span-2 text-start text-2xl font-bold flex items-center">Rejected Today</div>
          <div className="text-3xl font-bold flex justify-center items-center">{analytics.rejectedToday}</div>
        </div>
        <div className="rounded-md shadow-sm inline-shadow-sm grid grid-cols-3 bg-gray-100 p-4">
          <div className="col-span-2 text-start text-2xl font-bold flex items-center">Total This Month</div>
          <div className="text-3xl font-bold flex justify-center items-center">{analytics.totalThisMonth}</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="h-[60vh] overflow-auto">
        <Table className="w-full">
          <TableCaption>Attendance Requests</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">#</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Proposed</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req, index) => (
              <TableRow key={req.id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="text-center">{req.name}</TableCell>
                <TableCell className="text-center">{req.date}</TableCell>
                <TableCell className="text-center">{req.type}</TableCell>
                <TableCell className="text-center">{req.proposed}</TableCell>
                <TableCell className="text-center">{req.status}</TableCell>
                <TableCell className="text-center">
                  <Button size="sm" onClick={() => openModal(req)}>
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedRequest.name}</p>
                  <p><strong>Date:</strong> {selectedRequest.date}</p>
                  <p><strong>Type:</strong> {selectedRequest.type}</p>
                  <p><strong>Proposed:</strong> {selectedRequest.proposed}</p>
                  <div className="flex items-center gap-2">
                    <strong>Current Status:</strong>
                    <Select value={actionStatus} onValueChange={handleActionChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">Approve</SelectItem>
                        <SelectItem value="Rejected">Reject</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSubmit} disabled={!actionStatus}>
                      Save
                    </Button>
                    <Button variant="ghost" onClick={closeModal} className="ml-2">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AttendanceRequest;
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import image from "@/hr3/pics/image.png";


const dummyClaims = [
  { id: 1, employee: "John Doe", type: "Claims", category: "Travel", amount: 150,img: image, status: "Pending" },
  { id: 2, employee: "Jane Smith", type: "Reimbursements", category: "Food", amount: 50,img: image, status: "Pending" },
  { id: 3, employee: "Alice Johnson", type: "Claims", category: "Medical", amount: 200,img: image, status: "Pending" },
  { id: 4, employee: "Bob Brown", type: "Claims", category: "Entertainment", amount: 100,img: image, status: "Pending" },
  { id: 5, employee: "Eve Green", type: "Reimbursements", category: "Travel", amount: 75,img: image, status: "Pending" },
  { id: 6, employee: "David Lee", type: "Claims", category: "Medical", amount: 300,img: image, status: "Pending" },
  { id: 7, employee: "Grace Wilson", type: "Claims", category: "Entertainment", amount: 120,img: image, status: "Pending" },
  { id: 8, employee: "Frank Turner", type: "Reimbursements", category: "Food", amount: 40,img: image, status: "Pending" },
  { id: 9, employee: "Hannah Baker", type: "Claims", category: "Travel", amount: 90,img: image, status: "Pending" },
  { id: 10, employee: "Ivy Davis", type: "Claims", category: "Entertainment", amount: 150,img: image, status: "Pending" },
  { id: 11, employee: "Ivy Davis", type: "Claims", category: "Entertainment", amount: 150,img: image, status: "Pending" },
];

const initialApprovedClaims = [];


export default function Claims() {
  const [claims, setClaims] = useState(dummyClaims);
  const [approvedClaim, setApprovedClaim] = useState(initialApprovedClaims);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState("");
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const handleStatusChange = (value) => {
    setTempStatus(value);
  };

  const handleSubmit = () => {
    if (selectedClaim && tempStatus) {
      if (tempStatus === "Approved") {
        // Remove from claims and add to approved claims
        const updatedClaims = claims.filter(claim => claim.id !== selectedClaim.id);
        const updatedClaim = { ...selectedClaim, status: tempStatus };
        
        setClaims(updatedClaims);
        setApprovedClaim(prev => [...prev, updatedClaim]);
      } else if (tempStatus === "Rejected") {
        // Remove the claim completely when rejected
        const updatedClaims = claims.filter(claim => claim.id !== selectedClaim.id);
        setClaims(updatedClaims);
      } else {
        // Update status for pending claims
        const updatedClaims = claims.map((claim) =>
          claim.id === selectedClaim.id ? { ...claim, status: tempStatus } : claim
        );
        setClaims(updatedClaims);
      }
      
      setSelectedClaim(null);
      setIsDialogOpen(false);
    }
  };

  const handleViewClick = (claim) => {
    setSelectedClaim(claim);
    setTempStatus(claim.status);
    setIsDialogOpen(true);
  };

  const handleImageClick = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  const [isApprovedDialogOpen, setIsApprovedDialogOpen] = useState(false);
const [selectedApprovedClaim, setSelectedApprovedClaim] = useState(null);

// Add new handler for approved claims view
const handleApprovedViewClick = (claim) => {
  setSelectedApprovedClaim(claim);
  setIsApprovedDialogOpen(true);
};

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Claims and Reimbursements Tracking</h2>
      <div className="flex gap-2">
        <Button>Submit New</Button>
        <Button>Generate Reports</Button>
      </div>
      <div className="max-h-[486px] overflow-y-auto mt-4">
        <Table className="h-full overflow-y-auto">
          <TableHeader>
            <TableRow>
              <TableCell className="font-bold px-10 text-md">Employee</TableCell>
              <TableCell className="font-bold px-10 text-md">Type</TableCell>
              <TableCell className="font-bold px-10 text-md">Category</TableCell>
              <TableCell className="font-bold px-10 text-md">Amount</TableCell>
              <TableCell className="font-bold px-10 text-md">Status</TableCell>
              <TableCell className="font-bold px-10 text-md">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="text-md px-10">{claim.employee}</TableCell>
                <TableCell className="text-md px-10">{claim.type}</TableCell>
                <TableCell className="text-md px-10">{claim.category}</TableCell>
                <TableCell className="text-md px-10">₱{claim.amount}</TableCell>
                <TableCell className="text-md px-10">{claim.status}</TableCell>
                <TableCell className="text-md px-10">
                  <Button onClick={() => handleViewClick(claim)} disabled={claim.status !== "Pending"}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <h2 className="text-xl font-bold mt-8 mb-4">Approved Request</h2>
            <div className="max-h-[500px] overflow-y-auto mt-4">
              <Table className="h-full">
                <TableHeader>
                  <TableRow>
                    <TableCell className="font-bold text-center text-md ">Employee</TableCell>
                    <TableCell className="font-bold text-center text-md ">Type</TableCell>
                    <TableCell className="font-bold text-center text-md ">Category</TableCell>
                    <TableCell className="font-bold text-center text-md ">Amount</TableCell>
                    <TableCell className="font-bold text-center text-md ">Status</TableCell>
                    <TableCell className="font-bold text-center text-md ">Action</TableCell>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {approvedClaim.map((approvedclaim) => (
                    <TableRow key={approvedclaim.id}>
                      <TableCell className="text-center text-md ">{approvedclaim.employee}</TableCell>
                      <TableCell className="text-center text-md ">{approvedclaim.type}</TableCell>
                      <TableCell className="text-center text-md ">{approvedclaim.category}</TableCell>
                      <TableCell className="text-center text-md ">₱{approvedclaim.amount}</TableCell>
                      <TableCell className="text-center text-md ">{approvedclaim.status}</TableCell>
                      <TableCell className="text-center text-md">
                        <Button onClick={() => handleApprovedViewClick(approvedclaim)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Claim Details</DialogTitle>
                <DialogDescription>
                  Review and update the claim status
                </DialogDescription>
              </DialogHeader>
                {selectedClaim && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="font-bold">Employee:</label>
                          <p>{selectedClaim.employee}</p>
                        </div>
                        <div>
                          <label className="font-bold">Type:</label>
                  <p>{selectedClaim.type}</p>
                </div>
                <div>
                  <label className="font-bold">Category:</label>
                  <p>{selectedClaim.category}</p>
                </div>
                <div>
                  <label className="font-bold">Amount:</label>
                  <p>₱{selectedClaim.amount}</p>
                </div>
                  <div>
                    <label className="font-bold">Status:</label>
                    <Select value={tempStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-bold mb-2">Receipt</p>
                  <div 
                    onClick={handleImageClick} 
                    className="cursor-pointer relative hover:opacity-90 transition-opacity"
                  >
                    {selectedClaim && (
                      <img
                        src={selectedClaim.img}
                        alt="Receipt"
                        className="w-full h-auto rounded-lg object-contain max-h-[300px]"
                        onClick={handleImageClick}  // Add click handler here
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100">
                      <span className="text-white bg-black/50 px-2 py-1 rounded text-sm">Click to zoom</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit}>Submit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Image Zoom Dialog */}
      <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
        <DialogContent className="max-w-[90vw] h-[full]">
          <DialogHeader>
            <DialogTitle>Receipt Image</DialogTitle>
            <DialogDescription>
              Enlarged view of the receipt
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={image}
              alt="Receipt"
              className="w-auto max-h-[full] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Approved Claims View Dialog */}
      <Dialog open={isApprovedDialogOpen} onOpenChange={setIsApprovedDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approved Claim Details</DialogTitle>
            <DialogDescription>
              View approved claim information
            </DialogDescription>
          </DialogHeader>
          {selectedApprovedClaim && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="font-bold">Employee:</label>
                  <p>{selectedApprovedClaim.employee}</p>
                </div>
                <div>
                  <label className="font-bold">Type:</label>
                  <p>{selectedApprovedClaim.type}</p>
                </div>
                <div>
                  <label className="font-bold">Category:</label>
                  <p>{selectedApprovedClaim.category}</p>
                </div>
                <div>
                  <label className="font-bold">Amount:</label>
                  <p>₱{selectedApprovedClaim.amount}</p>
                </div>
                <div>
                  <label className="font-bold">Status:</label>
                  <p className="text-green-600 font-medium">{selectedApprovedClaim.status}</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-bold mb-2">Receipt</p>
                <div 
                  onClick={() => {
                    setSelectedClaim(selectedApprovedClaim);
                    setIsImageZoomed(true);
                  }}
                  className="cursor-pointer relative hover:opacity-90 transition-opacity"
                >
                  <img
                    src={selectedApprovedClaim.img}
                    alt="Receipt"
                    className="w-full h-auto rounded-lg object-contain max-h-[300px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100">
                    <span className="text-white bg-black/50 px-2 py-1 rounded text-sm">Click to zoom</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
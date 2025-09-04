import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import image from "@/hr3/pics/image.png";

export default function ClaimsModule() {
  const [claims, setClaims] = useState([
    {
      id: 1,
      employee: "Juan Dela Cruz",
      type: "Travel",
      category: "Transportation",
      amount: 1200,
      status: "Pending",
      img: image,
    },
    {
      id: 2,
      employee: "Maria Santos",
      type: "Medical",
      category: "Consultation",
      amount: 800,
      status: "Approved",
      img: "/receipt2.png",
    },
  ]);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");
  const [zoomedImage, setZoomedImage] = useState(null); // ✅ for zoom

  const handleViewClick = (claim) => {
    setSelectedClaim(claim);
    setTempStatus(claim.status);
  };

  const handleStatusChange = (value) => {
    setTempStatus(value);
  };

  const handleSubmit = () => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id ? { ...c, status: tempStatus } : c
      )
    );
    setSelectedClaim(null);
  };

  return (
    <div className="p-6 space-y-10">
      {/* ✅ Pending Claims */}
      <div>
        <h2 className="text-xl font-bold mb-3">Pending Claims</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-10">Employee</TableHead>
              <TableHead className="px-10">Type</TableHead>
              <TableHead className="px-10">Category</TableHead>
              <TableHead className="px-10">Amount</TableHead>
              <TableHead className="px-10">Status</TableHead>
              <TableHead className="px-10">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims
              .filter((c) => c.status === "Pending")
              .map((claim) => (
                <TableRow
                  key={claim.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <TableCell className="text-md px-10 font-medium">
                    {claim.employee}
                  </TableCell>
                  <TableCell className="text-md px-10">{claim.type}</TableCell>
                  <TableCell className="text-md px-10">
                    {claim.category}
                  </TableCell>
                  <TableCell className="text-md px-10">
                    ₱{claim.amount}
                  </TableCell>
                  <TableCell className="text-md px-10">
                    <Badge variant="secondary">{claim.status}</Badge>
                  </TableCell>
                  <TableCell className="text-md px-10">
                    <Button onClick={() => handleViewClick(claim)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Approved Claims */}
      <div>
        <h2 className="text-xl font-bold mb-3">Approved Claims</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-10">Employee</TableHead>
              <TableHead className="px-10">Type</TableHead>
              <TableHead className="px-10">Category</TableHead>
              <TableHead className="px-10">Amount</TableHead>
              <TableHead className="px-10">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims
              .filter((c) => c.status === "Approved")
              .map((claim) => (
                <TableRow key={claim.id} className="hover:bg-muted/50">
                  <TableCell className="text-md px-10 font-medium">
                    {claim.employee}
                  </TableCell>
                  <TableCell className="text-md px-10">{claim.type}</TableCell>
                  <TableCell className="text-md px-10">
                    {claim.category}
                  </TableCell>
                  <TableCell className="text-md px-10">
                    ₱{claim.amount}
                  </TableCell>
                  <TableCell className="text-md px-10">
                    <Badge variant="success">{claim.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Claim Details Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-2xl rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Claim Details
            </DialogTitle>
            <DialogDescription>
              Review and take action on this claim
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              {/* Left: Claim Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Employee:</span>
                  <span>{selectedClaim.employee}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Type:</span>
                  <span>{selectedClaim.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Category:</span>
                  <span>{selectedClaim.category}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Amount:</span>
                  <span>₱{selectedClaim.amount}</span>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <Select value={tempStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="mt-1">
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

              {/* Right: Receipt */}
              <div className="border rounded-xl p-4 bg-muted/30">
                <p className="font-semibold mb-2">Receipt</p>
                <div
                  className="cursor-pointer relative group"
                  onClick={() => setZoomedImage(selectedClaim.img)} // ✅ set zoom
                >
                  <img
                    src={selectedClaim.img}
                    alt="Receipt"
                    className="w-full h-auto rounded-lg object-contain max-h-[280px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white text-sm">Click to Zoom</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Zoom Image Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
          <img
            src={zoomedImage || ""}
            alt="Zoomed Receipt"
            className="w-full h-auto rounded-lg object-contain max-h-[90vh] mx-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

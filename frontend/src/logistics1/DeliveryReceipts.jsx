// src/logistics1/DeliveryReceipts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logisticsI } from '@/api/logisticsI';
import { AppSidebar } from "@/components/app-sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DeliveryReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Fetch function
  async function fetchReceipts() {
    setLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.deliveryReceipts);
      setReceipts(response.data);
    } catch (error) {
      console.error("Failed to fetch delivery receipts", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered data
  const filteredReceipts = receipts.filter((item) =>
    item.receipt_number?.toLowerCase().includes(search.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  // Dialog handlers
  function openAddDialog() {
    setDialogMode("add");
    setFormData({});
    setDialogOpen(true);
  }

  function openEditDialog(data) {
    setDialogMode("edit");
    setFormData(data);
    setDialogOpen(true);
  }

  // Form change
  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Submit
  async function handleSubmit() {
    try {
      if (dialogMode === "add") {
        await axios.post(logisticsI.backend.api.deliveryReceiptAdd, formData);
      } else {
        await axios.put(
          `${logisticsI.backend.api.deliveryReceiptUpdate}/${formData.id}`,
          formData
        );
      }
      fetchReceipts();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save receipt", error);
    }
  }

  // Archive
  async function handleArchive(id) {
    try {
      await axios.put(`${logisticsI.backend.api.deliveryReceiptArchive}/${id}`);
      fetchReceipts();
    } catch (error) {
      console.error("Failed to archive receipt", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Delivery Receipts</h1>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search Receipts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openAddDialog}>Add Receipt</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Receipt Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : filteredReceipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No receipts found.</TableCell>
              </TableRow>
            ) : (
              filteredReceipts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.receipt_number}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleArchive(item.id)}
                    >
                      Archive
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add" : "Edit"} Delivery Receipt
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 pb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div>
                  <Label>Receipt Number</Label>
                  <Input
                    name="receipt_number"
                    value={formData.receipt_number || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    name="supplier"
                    value={formData.supplier || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status || ""} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">{dialogMode === "add" ? "Add" : "Save"}</Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

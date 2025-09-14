// src/logistics1/MaintenanceHistory.jsx
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

export default function MaintenanceHistory() {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // Fetch function
  async function fetchMaintenance() {
    setLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.maintenance);
      setMaintenance(response.data);
    } catch (error) {
      console.error("Failed to fetch maintenance history", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered data
  const filteredMaintenance = maintenance.filter((item) =>
    item.asset_name?.toLowerCase().includes(search.toLowerCase())
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
        await axios.post(logisticsI.backend.api.maintenanceAdd, formData);
      } else {
        await axios.put(
          `${logisticsI.backend.api.maintenanceUpdate}/${formData.id}`,
          formData
        );
      }
      fetchMaintenance();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save maintenance", error);
    }
  }

  // Archive
  async function handleArchive(id) {
    try {
      await axios.put(`${logisticsI.backend.api.maintenanceArchive}/${id}`);
      fetchMaintenance();
    } catch (error) {
      console.error("Failed to archive maintenance", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Maintenance History</h1>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search Assets"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openAddDialog}>Add Maintenance</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Maintenance Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : filteredMaintenance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No maintenance records found.</TableCell>
              </TableRow>
            ) : (
              filteredMaintenance.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.asset_name}</TableCell>
                  <TableCell>{item.maintenance_type}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.technician}</TableCell>
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
                {dialogMode === "add" ? "Add" : "Edit"} Maintenance Record
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
                  <Label>Asset ID</Label>
                  <Input
                    name="asset_id"
                    type="number"
                    value={formData.asset_id || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Maintenance Type</Label>
                  <Select value={formData.maintenance_type || ""} onValueChange={(value) => setFormData({...formData, maintenance_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="predictive">Predictive</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label>Technician</Label>
                  <Input
                    name="technician"
                    value={formData.technician || ""}
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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

// src/logistics1/CheckInOutLogs.jsx
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

export default function CheckInOutLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch function
  async function fetchLogs() {
    setLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.equipmentLogs);
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch check-in/out logs", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered data
  const filteredLogs = logs.filter((item) =>
    item.equipment_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.user?.toLowerCase().includes(search.toLowerCase())
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
        await axios.post(logisticsI.backend.api.equipmentLogAdd, formData);
      } else {
        await axios.put(
          `${logisticsI.backend.api.equipmentLogUpdate}/${formData.id}`,
          formData
        );
      }
      fetchLogs();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save log", error);
    }
  }

  // Archive
  async function handleArchive(id) {
    try {
      await axios.put(`${logisticsI.backend.api.equipmentLogArchive}/${id}`);
      fetchLogs();
    } catch (error) {
      console.error("Failed to archive log", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Check-In/Check-Out Logs</h1>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search Logs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openAddDialog}>Add Log</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No logs found.</TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.equipment_name}</TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.user}</TableCell>
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
                {dialogMode === "add" ? "Add" : "Edit"} Check-In/Check-Out Log
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
                  <Label>Equipment ID</Label>
                  <Input
                    name="equipment_id"
                    type="number"
                    value={formData.equipment_id || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={formData.action || ""} onValueChange={(value) => setFormData({...formData, action: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check-in">Check-In</SelectItem>
                      <SelectItem value="check-out">Check-Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    name="date"
                    type="datetime-local"
                    value={formData.date || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>User</Label>
                  <Input
                    name="user"
                    value={formData.user || ""}
                    onChange={handleFormChange}
                    required
                  />
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

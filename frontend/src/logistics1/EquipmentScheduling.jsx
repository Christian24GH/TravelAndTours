// src/logistics1/EquipmentScheduling.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logisticsI } from '@/api/logisticsI';
import { AppSidebar } from "@/components/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EquipmentScheduling() {
  const [activeTab, setActiveTab] = useState("all");

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Fetch functions
  async function fetchSchedules() {
    setSchedulesLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.equipmentSchedules);
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch equipment schedules", error);
    } finally {
      setSchedulesLoading(false);
    }
  }

  // Filtered data
  const filteredSchedules = schedules.filter((item) => {
    const matchesSearch = item.equipment_name?.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                          item.project_name?.toLowerCase().includes(scheduleSearch.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && item.status === "pending";
    if (activeTab === "approved") return matchesSearch && item.status === "approved";
    return matchesSearch;
  });

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
        await axios.post(logisticsI.backend.api.equipmentScheduleAdd, formData);
      } else {
        await axios.put(
          `${logisticsI.backend.api.equipmentScheduleUpdate}/${formData.id}`,
          formData
        );
      }
      fetchSchedules();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save schedule", error);
    }
  }

  // Approve
  async function handleApprove(id) {
    try {
      await axios.put(`${logisticsI.backend.api.equipmentScheduleApprove}/${id}`);
      fetchSchedules();
    } catch (error) {
      console.error("Failed to approve schedule", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Equipment Scheduling</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Schedules</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Schedules"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={openAddDialog}>Add Schedule</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedulesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No schedules found.</TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.equipment_name}</TableCell>
                      <TableCell>{item.project_name}</TableCell>
                      <TableCell>{item.start_date}</TableCell>
                      <TableCell>{item.end_date}</TableCell>
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
                        {item.status === "pending" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add" : "Edit"} Equipment Schedule
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
                  <Label>Project Name</Label>
                  <Input
                    name="project_name"
                    value={formData.project_name || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    name="start_date"
                    type="date"
                    value={formData.start_date || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date || ""}
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
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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

// src/logistics1/TourReports.jsx
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
import { Textarea } from "@/components/ui/textarea";

export default function TourReports() {
  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or view
  const [formData, setFormData] = useState({});
  const [viewData, setViewData] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch functions
  async function fetchReports() {
    setReportsLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.logisticsReports);
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setReportsLoading(false);
    }
  }

  // Filtered data
  const filteredReports = reports.filter((item) =>
    item.report_type?.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // Dialog handlers
  function openAddDialog() {
    setDialogMode("add");
    setFormData({});
    setDialogOpen(true);
  }

  function openViewDialog(data) {
    setDialogMode("view");
    setViewData(data);
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
      await axios.post(logisticsI.backend.api.logisticsReportAdd, formData);
      fetchReports();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to generate report", error);
    }
  }

  // Archive
  async function handleArchive(id) {
    try {
      await axios.put(`${logisticsI.backend.api.logisticsReportArchive}/${id}`);
      fetchReports();
    } catch (error) {
      console.error("Failed to archive report", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Tour Reports</h1>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search Reports"
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openAddDialog}>Generate Report</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Generated Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportsLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No reports found.</TableCell>
              </TableRow>
            ) : (
              filteredReports.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.report_type}</TableCell>
                  <TableCell>{item.generated_date}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(item)}
                      className="mr-2"
                    >
                      View
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
                {dialogMode === "add" ? "Generate New Report" : "View Report"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 pb-4">
              {dialogMode === "add" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div>
                    <Label>Report Type</Label>
                    <Select value={formData.report_type || ""} onValueChange={(value) => setFormData({...formData, report_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipment Usage">Equipment Usage</SelectItem>
                        <SelectItem value="Delivery Summary">Delivery Summary</SelectItem>
                        <SelectItem value="Tour Performance">Tour Performance</SelectItem>
                        <SelectItem value="Maintenance Logs">Maintenance Logs</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <DialogFooter>
                    <Button type="submit">Generate</Button>
                  </DialogFooter>
                </form>
              ) : (
                <div>
                  <div>
                    <Label>Report Type</Label>
                    <p>{viewData.report_type}</p>
                  </div>
                  <div>
                    <Label>Generated Date</Label>
                    <p>{viewData.generated_date}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p>{viewData.status}</p>
                  </div>
                  <div>
                    <Label>Report Content</Label>
                    <Textarea
                      value={viewData.content || "Report content not available"}
                      readOnly
                      rows={10}
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

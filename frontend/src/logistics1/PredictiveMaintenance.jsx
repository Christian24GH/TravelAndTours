// src/logistics1/PredictiveMaintenance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logisticsI } from '@/api/logisticsI';
import { AppSidebar } from "@/components/app-sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function PredictiveMaintenance() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewData, setViewData] = useState({});

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Fetch function (using maintenance API as placeholder for predictive alerts)
  async function fetchAlerts() {
    setLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.maintenance);
      // Filter for predictive alerts if possible, or use all
      setAlerts(response.data.filter(item => item.type === 'predictive' || true)); // Placeholder filter
    } catch (error) {
      console.error("Failed to fetch predictive alerts", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered data
  const filteredAlerts = alerts.filter((item) =>
    item.equipment_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Dialog handlers
  function openViewDialog(data) {
    setViewData(data);
    setDialogOpen(true);
  }

  // Mark Resolved (placeholder, since no specific API)
  async function handleMarkResolved(id) {
    // Placeholder: In real implementation, call specific API to mark as resolved
    console.log("Marking alert as resolved", id);
    // For now, just remove from list or update status
    setAlerts(alerts.map(alert => alert.id === id ? {...alert, status: 'resolved'} : alert));
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Predictive Maintenance</h1>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search Equipment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Predicted Issue</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No alerts found.</TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.equipment_name || item.asset_name}</TableCell>
                  <TableCell>{item.predicted_issue || item.description}</TableCell>
                  <TableCell>{item.confidence || 'N/A'}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(item)}
                      className="mr-2"
                    >
                      View Details
                    </Button>
                    {item.status !== 'resolved' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMarkResolved(item.id)}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alert Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 pb-4">
              <div>
                <Label>Equipment</Label>
                <p>{viewData.equipment_name || viewData.asset_name}</p>
              </div>
              <div>
                <Label>Predicted Issue</Label>
                <p>{viewData.predicted_issue || viewData.description}</p>
              </div>
              <div>
                <Label>Confidence</Label>
                <p>{viewData.confidence || 'N/A'}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p>{viewData.date}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p>{viewData.status}</p>
              </div>
              <div>
                <Label>Details</Label>
                <p>{viewData.details || 'Additional details not available'}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

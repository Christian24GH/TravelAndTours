// src/logistics1/DeliveryTransportTracking.jsx
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

export default function DeliveryTransportTracking() {
  const [activeTab, setActiveTab] = useState("all");

  // Deliveries state
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliverySearch, setDeliverySearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Fetch functions
  async function fetchDeliveries() {
    setDeliveriesLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.deliveries);
      setDeliveries(response.data);
    } catch (error) {
      console.error("Failed to fetch deliveries", error);
    } finally {
      setDeliveriesLoading(false);
    }
  }

  // Filtered data
  const filteredDeliveries = deliveries.filter((item) => {
    const matchesSearch = item.item_name?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                          item.destination?.toLowerCase().includes(deliverySearch.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "in-transit") return matchesSearch && item.status === "in-transit";
    if (activeTab === "delivered") return matchesSearch && item.status === "delivered";
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
        await axios.post(logisticsI.backend.api.deliveryAdd, formData);
      } else {
        await axios.put(
          `${logisticsI.backend.api.deliveryUpdate}/${formData.id}`,
          formData
        );
      }
      fetchDeliveries();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save delivery", error);
    }
  }

  // Mark Delivered
  async function handleMarkDelivered(id) {
    try {
      await axios.put(`${logisticsI.backend.api.markDelivered}/${id}`);
      fetchDeliveries();
    } catch (error) {
      console.error("Failed to mark delivery as delivered", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Delivery & Transport Tracking</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Deliveries</TabsTrigger>
            <TabsTrigger value="in-transit">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Deliveries"
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={openAddDialog}>Add Delivery</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No deliveries found.</TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.destination}</TableCell>
                      <TableCell>{item.driver_name}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.delivery_date}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        {item.status !== "delivered" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkDelivered(item.id)}
                          >
                            Mark Delivered
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
                {dialogMode === "add" ? "Add" : "Edit"} Delivery
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
                  <Label>Item Name</Label>
                  <Input
                    name="item_name"
                    value={formData.item_name || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Destination</Label>
                  <Input
                    name="destination"
                    value={formData.destination || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Driver Name</Label>
                  <Input
                    name="driver_name"
                    value={formData.driver_name || ""}
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
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delivery Date</Label>
                  <Input
                    name="delivery_date"
                    type="date"
                    value={formData.delivery_date || ""}
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

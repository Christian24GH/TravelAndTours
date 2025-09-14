// src/logistics1/PurchaseProcessing.jsx
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PurchaseProcessing() {
  const [activeTab, setActiveTab] = useState("requests");

  // Purchase Requests state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestSearch, setRequestSearch] = useState("");

  // Purchase Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [dialogType, setDialogType] = useState("request"); // request or order
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchRequests();
    fetchOrders();
  }, []);

  // Fetch functions
  async function fetchRequests() {
    setRequestsLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.purchaseRequests);
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch purchase requests", error);
    } finally {
      setRequestsLoading(false);
    }
  }

  async function fetchOrders() {
    setOrdersLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.purchaseOrders);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch purchase orders", error);
    } finally {
      setOrdersLoading(false);
    }
  }

  // Filtered data
  const filteredRequests = requests.filter((item) =>
    item.item_name?.toLowerCase().includes(requestSearch.toLowerCase())
  );
  const filteredOrders = orders.filter((item) =>
    item.item_name?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Dialog handlers
  function openAddDialog(type) {
    setDialogType(type);
    setDialogMode("add");
    setFormData({});
    setDialogOpen(true);
  }

  function openEditDialog(type, data) {
    setDialogType(type);
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
      if (dialogType === "request") {
        if (dialogMode === "add") {
          await axios.post(logisticsI.backend.api.purchaseRequestAdd, formData);
        } else {
          await axios.put(
            `${logisticsI.backend.api.purchaseRequestUpdate}/${formData.id}`,
            formData
          );
        }
        fetchRequests();
      } else if (dialogType === "order") {
        if (dialogMode === "add") {
          await axios.post(logisticsI.backend.api.purchaseOrderAdd, formData);
        } else {
          await axios.put(
            `${logisticsI.backend.api.purchaseOrderUpdate}/${formData.id}`,
            formData
          );
        }
        fetchOrders();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Purchase Processing</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="requests">Purchase Requests</TabsTrigger>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Requests"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("request")}>Add Request</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No requests found.</TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.supplier_name}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog("request", item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="orders">
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Search Orders"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("order")}>Add Order</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No orders found.</TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.supplier_name}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog("order", item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
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
                {dialogMode === "add" ? "Add" : "Edit"} {dialogType === "request" ? "Purchase Request" : "Purchase Order"}
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
                  <Label>Quantity</Label>
                  <Input
                    name="quantity"
                    type="number"
                    value={formData.quantity || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Supplier ID</Label>
                  <Input
                    name="supplier_id"
                    type="number"
                    value={formData.supplier_id || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                {dialogType === "order" && (
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status || ""} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

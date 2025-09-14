// src/logistics1/AssetRegistration.jsx
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

export default function AssetRegistration() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch function
  async function fetchAssets() {
    setLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.assets);
      setAssets(response.data);
    } catch (error) {
      console.error("Failed to fetch assets", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered data
  const filteredAssets = assets.filter((item) =>
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
        await axios.post(logisticsI.backend.api.assetAdd, formData);
      } else {
        await axios.put(
          `${logisticsI.backend.api.assetUpdate}/${formData.id}`,
          formData
        );
      }
      fetchAssets();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save asset", error);
    }
  }

  // Archive
  async function handleArchive(id) {
    try {
      await axios.put(`${logisticsI.backend.api.assetArchive}/${id}`);
      fetchAssets();
    } catch (error) {
      console.error("Failed to archive asset", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Asset Registration & QR Tagging</h1>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search Assets"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={openAddDialog}>Add Asset</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No assets found.</TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.asset_name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.qr_code}</TableCell>
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
                {dialogMode === "add" ? "Add" : "Edit"} Asset
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
                  <Label>Asset Name</Label>
                  <Input
                    name="asset_name"
                    value={formData.asset_name || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    name="category"
                    value={formData.category || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Label>QR Code</Label>
                  <Input
                    name="qr_code"
                    value={formData.qr_code || ""}
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
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

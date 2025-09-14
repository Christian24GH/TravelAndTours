import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { logisticsI } from "@/api/logisticsI";
import axios from "axios";

export default function StorageOrganization() {
  const [activeTab, setActiveTab] = useState("locations");

  // Storage Locations state
  const [storageLocations, setStorageLocations] = useState([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageSearch, setStorageSearch] = useState("");

  // Equipment in Storage state (for organization)
  const [equipment, setEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [dialogType, setDialogType] = useState("location"); // location or assign
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStorageLocations();
    fetchEquipment();
  }, []);

  // Fetch functions
  async function fetchStorageLocations() {
    setStorageLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.storageLocation);
      setStorageLocations(response.data);
    } catch (error) {
      console.error("Failed to fetch storage locations", error);
    } finally {
      setStorageLoading(false);
    }
  }

  async function fetchEquipment() {
    setEquipmentLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.equipment);
      setEquipment(response.data);
    } catch (error) {
      console.error("Failed to fetch equipment", error);
    } finally {
      setEquipmentLoading(false);
    }
  }

  // Handlers for search inputs
  function handleSearchChange(e, type) {
    const value = e.target.value;
    if (type === "location") setStorageSearch(value);
    else if (type === "equipment") setEquipmentSearch(value);
  }

  // Filtered data based on search
  const filteredStorage = storageLocations.filter((item) =>
    item.name.toLowerCase().includes(storageSearch.toLowerCase())
  );
  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  // Dialog open handlers
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

  // Form input change handler
  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Submit handler for add/edit
  async function handleSubmit() {
    try {
      if (dialogType === "location") {
        if (dialogMode === "add") {
          await axios.post(logisticsI.backend.api.storageLocationAdd, formData);
        } else {
          await axios.put(
            `${logisticsI.backend.api.storageLocationUpdate}/${formData.id}`,
            formData
          );
        }
        fetchStorageLocations();
      } else if (dialogType === "assign") {
        // Assign equipment to location
        await axios.put(
          `${logisticsI.backend.api.equipmentUpdate}/${formData.equipment_id}`,
          { storage_location_id: formData.storage_location_id }
        );
        fetchEquipment();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save data", error);
    }
  }

  // Archive handler
  async function handleArchive(type, id) {
    try {
      if (type === "location") {
        await axios.put(`${logisticsI.backend.api.storageLocationArchive}/${id}`);
        fetchStorageLocations();
      }
    } catch (error) {
      console.error("Failed to archive", error);
    }
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold mb-4">Storage Organization</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="locations">Storage Locations</TabsTrigger>
            <TabsTrigger value="equipment">Equipment in Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <div className="flex justify-between mb-2">
              <Input
                placeholder="Search Storage Locations"
                value={storageSearch}
                onChange={(e) => handleSearchChange(e, "location")}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("location")}>Add Location</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageLoading ? (
                  <TableRow>
                    <TableCell colSpan={3}>Loading...</TableCell>
                  </TableRow>
                ) : filteredStorage.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>No storage locations found.</TableCell>
                  </TableRow>
                ) : (
                  filteredStorage.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog("location", item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleArchive("location", item.id)}
                        >
                          Archive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="equipment">
            <div className="flex justify-between mb-2">
              <Input
                placeholder="Search Equipment"
                value={equipmentSearch}
                onChange={(e) => handleSearchChange(e, "equipment")}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("assign")}>Assign Equipment</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>Loading...</TableCell>
                  </TableRow>
                ) : filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>No equipment found.</TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.storage_location_name || "Not Assigned"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog("assign", { equipment_id: item.id, storage_location_id: item.storage_location_id })}
                        >
                          Reassign
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
                {dialogMode === "add" ? "Add" : "Edit"}{" "}
                {dialogType === "location" ? "Storage Location" : "Equipment Assignment"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 pb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                {dialogType === "location" && (
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <Input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                )}
                {dialogType === "assign" && (
                  <>
                    <div>
                      <label className="block mb-1 font-medium">Equipment ID</label>
                      <Input
                        name="equipment_id"
                        type="number"
                        value={formData.equipment_id || ""}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Storage Location ID</label>
                      <Input
                        name="storage_location_id"
                        type="number"
                        value={formData.storage_location_id || ""}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </>
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

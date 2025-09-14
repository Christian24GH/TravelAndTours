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

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("equipment");

  // Equipment state
  const [equipment, setEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState("");

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Storage state
  const [storageLocations, setStorageLocations] = useState([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageSearch, setStorageSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // add or edit
  const [dialogType, setDialogType] = useState("equipment"); // equipment, category, storage
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
    fetchStorageLocations();
  }, []);

  // Fetch functions
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

  async function fetchCategories() {
    setCategoriesLoading(true);
    try {
      const response = await axios.get(logisticsI.backend.api.equipmentCategory);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setCategoriesLoading(false);
    }
  }

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

  // Handlers for search inputs
  function handleSearchChange(e, type) {
    const value = e.target.value;
    if (type === "equipment") setEquipmentSearch(value);
    else if (type === "category") setCategorySearch(value);
    else if (type === "storage") setStorageSearch(value);
  }

  // Filtered data based on search
  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );
  const filteredCategories = categories.filter((item) =>
    item.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredStorage = storageLocations.filter((item) =>
    item.name.toLowerCase().includes(storageSearch.toLowerCase())
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
      if (dialogType === "equipment") {
        if (dialogMode === "add") {
          await axios.post(logisticsI.backend.api.equipmentAdd, formData);
        } else {
          await axios.put(
            `${logisticsI.backend.api.equipmentUpdate}/${formData.id}`,
            formData
          );
        }
        fetchEquipment();
      } else if (dialogType === "category") {
        if (dialogMode === "add") {
          await axios.post(logisticsI.backend.api.equipmentCategoryAdd, formData);
        } else {
          await axios.put(
            `${logisticsI.backend.api.equipmentCategoryUpdate}/${formData.id}`,
            formData
          );
        }
        fetchCategories();
      } else if (dialogType === "storage") {
        if (dialogMode === "add") {
          await axios.post(logisticsI.backend.api.storageLocationAdd, formData);
        } else {
          await axios.put(
            `${logisticsI.backend.api.storageLocationUpdate}/${formData.id}`,
            formData
          );
        }
        fetchStorageLocations();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save data", error);
    }
  }

  // Archive handler
  async function handleArchive(type, id) {
    try {
      if (type === "equipment") {
        await axios.put(`${logisticsI.backend.api.equipmentArchive}/${id}`);
        fetchEquipment();
      } else if (type === "category") {
        await axios.put(`${logisticsI.backend.api.equipmentCategoryArchive}/${id}`);
        fetchCategories();
      } else if (type === "storage") {
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
        <h1 className="text-xl font-bold mb-4">Inventory Management</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="category">Categories</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <div className="flex justify-between mb-2">
              <Input
                placeholder="Search Equipment"
                value={equipmentSearch}
                onChange={(e) => handleSearchChange(e, "equipment")}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("equipment")}>Add Equipment</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No equipment found.</TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category_name || "N/A"}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.storage_location_name || "N/A"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog("equipment", item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleArchive("equipment", item.id)}
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

          <TabsContent value="category">
            <div className="flex justify-between mb-2">
              <Input
                placeholder="Search Categories"
                value={categorySearch}
                onChange={(e) => handleSearchChange(e, "category")}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("category")}>Add Category</Button>
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
                {categoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={3}>Loading...</TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>No categories found.</TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog("category", item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleArchive("category", item.id)}
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

          <TabsContent value="storage">
            <div className="flex justify-between mb-2">
              <Input
                placeholder="Search Storage Locations"
                value={storageSearch}
                onChange={(e) => handleSearchChange(e, "storage")}
                className="max-w-xs"
              />
              <Button onClick={() => openAddDialog("storage")}>Add Storage</Button>
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
                          onClick={() => openEditDialog("storage", item)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleArchive("storage", item.id)}
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
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add" : "Edit"}{" "}
                {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
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
                  <label className="block mb-1 font-medium">Name</label>
                  <Input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                {dialogType === "equipment" && (
                  <>
                    <div>
                      <label className="block mb-1 font-medium">Category ID</label>
                      <Input
                        name="category_id"
                        type="number"
                        value={formData.category_id || ""}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Stock</label>
                      <Input
                        name="stock"
                        type="number"
                        value={formData.stock || ""}
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

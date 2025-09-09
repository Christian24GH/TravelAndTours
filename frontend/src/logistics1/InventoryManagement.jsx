// src/logistics1/InventoryManagement.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function InventoryManagement() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Inventory Management</h1>
      </main>
    </div>
  );
} 
// src/logistics1/SupplierManagement.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function SupplierManagement() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Supplier Management</h1>
      </main>
    </div>
  );
}
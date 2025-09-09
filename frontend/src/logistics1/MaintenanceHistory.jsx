// src/logistics1/MaintenanceHistory.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function MaintenanceHistory() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Maintenance History</h1>
      </main>
    </div>
  );
}
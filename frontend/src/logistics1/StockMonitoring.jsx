// src/logistics1/StockMonitoring.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function StockMonitoring() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Stock Monitoring</h1>
      </main>
    </div>
  );
}
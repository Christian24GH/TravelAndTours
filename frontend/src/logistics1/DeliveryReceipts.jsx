// src/logistics1/DeliveryReceipts.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function DeliveryReceipts() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Delivery Receipts</h1>
      </main>
    </div>
  );
}
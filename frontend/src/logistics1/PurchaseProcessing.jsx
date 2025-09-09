// src/logistics1/PurchaseProcessing.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function PurchaseProcessing() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Purchase Processing</h1>
      </main>
    </div>
  );
}
// src/logistics1/ExpenseRecords.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function ExpenseRecords() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Expense Records</h1>
      </main>
    </div>
  );
}
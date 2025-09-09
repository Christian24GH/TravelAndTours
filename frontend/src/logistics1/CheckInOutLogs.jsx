// src/logistics1/CheckInOutLogs.jsx
import { AppSidebar } from "../../components/app-sidebar";

export default function CheckInOutLogs() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-bold">Check-In/Check-Out Logs</h1>
      </main>
    </div>
  );
}
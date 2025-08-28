import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

export default function ExportData() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Export Attendance Data</DialogTitle>
        <DialogDescription>
          Select the format and date range for export.
        </DialogDescription>
      </DialogHeader>
      {/* Export options will go here */}
    </DialogContent>
  );
}
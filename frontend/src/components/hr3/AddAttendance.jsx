import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

export default function AddAttendance() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Attendance</DialogTitle>
        <DialogDescription>
          Fill out the form to add a new attendance record.
        </DialogDescription>
      </DialogHeader>
      {/* Form components will go here */}
    </DialogContent>
  );
}
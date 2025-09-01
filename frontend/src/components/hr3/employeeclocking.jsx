import React, { useState } from "react";
import ClockingDialog from "./dialog";

export default function EmployeeClocking() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <button onClick={handleOpen}>Open Clocking Dialog</button>
      <ClockingDialog open={open} onClose={handleClose}>
        <div>
          <p>Employee Clocking UI content goes here.</p>
          {/* Add form fields or clocking controls here */}
        </div>
      </ClockingDialog>
    </>
  );
}
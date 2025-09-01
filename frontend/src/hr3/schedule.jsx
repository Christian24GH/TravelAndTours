import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Dummy shift templates
const dummyShiftTemplates = [
  { id: 1, name: "Morning", start: "08:00", end: "16:00" },
  { id: 2, name: "Night", start: "22:00", end: "06:00" },
  { id: 3, name: "Split", start: "08:00", end: "12:00" },
];

// Dummy employees with departments
const employees = [
  { name: "John Doe", department: "HR" },
  { name: "Jane Smith", department: "HR" },
  { name: "Alice Johnson", department: "IT" },
  { name: "Michael Lee", department: "IT" },
  { name: "Emma Davis", department: "Sales" },
  { name: "Robert Brown", department: "Sales" },
];

export default function Schedule() {
  const [shiftTemplates, setShiftTemplates] = useState(dummyShiftTemplates);
  const [groupName, setGroupName] = useState("");
  const [groupData, setGroupData] = useState(
    Array(5).fill({ employee: "", shift: "" })
  );
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  // Modal state for shift creation
  const [newShift, setNewShift] = useState({ name: "", start: "", end: "" });
  const [open, setOpen] = useState(false);

  // AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState([]);

  const handleCreateShift = (e) => {
    e.preventDefault();
    if (!newShift.name || !newShift.start || !newShift.end) {
      alert("Please fill out all fields.");
      return;
    }
    const newTemplate = {
      id: shiftTemplates.length + 1,
      ...newShift,
    };
    setShiftTemplates([...shiftTemplates, newTemplate]);
    setNewShift({ name: "", start: "", end: "" });
    setOpen(false);
  };

  const viewGroup = (id) => alert("Viewing group " + id);
  const publishGroup = (id) => alert("Publishing group " + id);

  const handleGroupDataChange = (index, value) => {
    const updated = [...groupData];
    updated[index] = { ...updated[index], employee: value };
    setGroupData(updated);
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    if (!selectedShift) {
      alert("Please select a shift.");
      return;
    }
    if (groupData.some((entry) => !entry.employee)) {
      alert("Please select 5 employees.");
      return;
    }

    const newGroup = {
      id: groups.length + 1,
      name: groupName,
      dateCreated: new Date().toLocaleDateString(),
      data: selectedDays.flatMap((day) =>
        groupData.map((entry) => ({
          ...entry,
          day,
          shift: selectedShift,
        }))
      ),
      shift: selectedShift,
    };

    setGroups([...groups, newGroup]);
    setGroupName("");
    setGroupData(Array(5).fill({ employee: "", shift: "" }));
    setSelectedDays([]);
    setSelectedShift("");
    setSelectedDept("");
  };

  const generateAISchedule = () => {
    // Simple AI mock: take first 5 employees and assign random shift
    const suggestion = employees.slice(0, 5).map((emp) => ({
      employee: emp.name,
      day: "Monday",
      shift: shiftTemplates[Math.floor(Math.random() * shiftTemplates.length)]
        .name,
    }));
    setAiSuggestion(suggestion);
  };

  // Filter employees by department
  const filteredEmployees = selectedDept
    ? employees.filter((e) => e.department === selectedDept)
    : [];

  return (
    <div className="p-4">
      {/* Shift Templates */}
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        Shift Templates
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Create Shift Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Shift Name</label>
                <input
                  type="text"
                  value={newShift.name}
                  onChange={(e) =>
                    setNewShift({ ...newShift, name: e.target.value })
                  }
                  className="border rounded p-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  value={newShift.start}
                  onChange={(e) =>
                    setNewShift({ ...newShift, start: e.target.value })
                  }
                  className="border rounded p-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time</label>
                <input
                  type="time"
                  value={newShift.end}
                  onChange={(e) =>
                    setNewShift({ ...newShift, end: e.target.value })
                  }
                  className="border rounded p-1 w-full"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Shift</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shiftTemplates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>{template.start}</TableCell>
              <TableCell>{template.end}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* AI Suggestion */}
      <h2 className="text-xl font-bold mt-8 mb-4">AI Shift Suggestion</h2>
      <Button onClick={generateAISchedule} size="sm" className="mb-2">
        Generate AI Schedule
      </Button>
      {aiSuggestion.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Shift</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aiSuggestion.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.employee}</TableCell>
                <TableCell>{row.day}</TableCell>
                <TableCell>{row.shift}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Manual Schedule */}
      <h2 className="text-xl font-bold mt-8 mb-4">Manual Schedule Generation</h2>
      <form onSubmit={handleGroupSubmit} className="mb-4">
        <div className="mb-2">
          <label className="mr-2">Group Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border rounded p-1"
            required
          />
        </div>

        {/* Department Filter */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Select Department:</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border rounded p-1 w-full"
          >
            <option value="">All Departments</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        {/* Employee selection (5 slots) */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Select 5 Employees {selectedDept ? `(${selectedDept})` : "(All)"}:
          </label>
          {groupData.map((entry, index) => (
            <select
              key={index}
              value={entry.employee}
              onChange={(e) => handleGroupDataChange(index, e.target.value)}
              className="border rounded p-1 w-full mb-2"
              required
            >
              <option value="">Select Employee</option>
              {(selectedDept
                ? employees.filter((emp) => emp.department === selectedDept)
                : employees
              ).map((emp, i) => (
                <option key={i} value={emp.name}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          ))}
        </div>


        {/* Multiple Days for all (checkboxes) */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Select Days:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Single Shift for all */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Select Shift:</label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="border rounded p-1 w-full"
            required
          >
            <option value="">Select Shift</option>
            {shiftTemplates.map((shift) => (
              <option key={shift.id} value={shift.name}>
                {shift.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="sm">
          Submit Group
        </Button>
      </form>
    </div>
  );
}

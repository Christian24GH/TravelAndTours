import React, { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

/* -------------------------- Dummy Employees -------------------------- */
const dummyEmployees = [
  { id: 1, name: "John Doe", department: "IT", role: "Developer" },
  { id: 2, name: "Jane Smith", department: "IT", role: "System Admin" },
  { id: 3, name: "Alice Johnson", department: "IT", role: "Help Desk" },
  { id: 4, name: "Bob Wilson", department: "Sales/Support", role: "Sales Rep" },
  { id: 5, name: "Carol Brown", department: "Sales/Support", role: "Support Agent" },
  { id: 6, name: "Dave Miller", department: "Sales/Support", role: "Support Agent" },
  { id: 7, name: "Eve Thomas", department: "HR", role: "HR Manager" },
  { id: 8, name: "Frank White", department: "HR", role: "HR Assistant" },
  { id: 9, name: "Grace Lee", department: "Finance", role: "Accountant" },
  { id: 10, name: "Henry Clark", department: "Finance", role: "Payroll" },
  { id: 11, name: "Dr. Irene Gray", department: "ER", role: "Doctor" },
  { id: 12, name: "Jack Green", department: "ER", role: "Nurse" },
  { id: 13, name: "Karen Hall", department: "ER", role: "Nurse" },
];

/* -------------------------- Helpers -------------------------- */
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const deptLexicon = [
  { rx: /\b(hr|human\s*resources)\b/i, label: "HR" },
  { rx: /\b(it|tech|engineering|developer|engineer|sysadmin|help\s*desk)\b/i, label: "IT" },
  { rx: /\b(sales|marketing|customer\s*(service|support)|call\s*center|support)\b/i, label: "Sales/Support" },
  { rx: /\b(er|emergency|ward|triage|clinic|nurse|doctor)\b/i, label: "ER" },
  { rx: /\b(finance|accounting|payroll)\b/i, label: "Finance" },
];

/* -------------------------- AI Analysis -------------------------- */
function analyzeShift(input) {
  const text = input.toLowerCase();
  const now = new Date();

  let result = {
    shift_name: "Custom Shift",
    start_time: "",
    end_time: "",
    departments: [], // multiple departments
    headcount: 1,
    days: [],
    description: "",
    start_date: "",
    end_date: "",
  };

  // Detect time
  const timeRegex = /(\d{1,2})(am|pm)?\s*[-–to]+\s*(\d{1,2})(am|pm)?/i;
  const timeMatch = input.match(timeRegex);
  if (timeMatch) {
    let [_, sh, sm, eh, em] = timeMatch;
    const to24 = (h, m) => {
      let hour = parseInt(h, 10);
      if (m?.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (m?.toLowerCase() === "am" && hour === 12) hour = 0;
      return hour.toString().padStart(2, "0") + ":00";
    };
    result.start_time = to24(sh, sm);
    result.end_time = to24(eh, em);
  }

  // Detect days
  for (let d of DAYS) {
    if (text.includes(d.toLowerCase().slice(0, 3))) {
      result.days.push(d);
    }
    }
  if (result.days.length === 0) {
    result.days = DAYS;
  }

  // Detect departments (multiple allowed)
  for (let dept of deptLexicon) {
    if (dept.rx.test(text)) {
      if (!result.departments.includes(dept.label)) {
        result.departments.push(dept.label);
      }
    }
  }

  // If no department found → default to ALL
  if (result.departments.length === 0) {
    result.departments = deptLexicon.map((d) => d.label);
  }

  // Detect headcount
  const countMatch = input.match(/\b(\d+)\s*(staff|people|employees?|person)?/i);
  if (countMatch) {
    result.headcount = parseInt(countMatch[1], 10);
  }

  // Detect duration (weeks)
  let weeks = 1;
  const weekMatch = input.match(/(\d+)\s*weeks?/i);
  if (weekMatch) weeks = parseInt(weekMatch[1], 10);

  // Smart start/end date alignment
  if (result.days.length > 0) {
    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const todayIdx = now.getDay();
    const firstDayIdx = daysOfWeek.indexOf(result.days[0]);
    const lastDayIdx = daysOfWeek.indexOf(result.days[result.days.length - 1]);

    let diff = (firstDayIdx - todayIdx + 7) % 7;
    if (diff === 0) diff = 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diff);

    const lastDiff = (lastDayIdx - firstDayIdx + 7) % 7;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (weeks - 1) * 7 + lastDiff);

    result.start_date = startDate.toISOString().slice(0, 10);
    result.end_date = endDate.toISOString().slice(0, 10);
  }

  // Build shift name (list departments)
  result.shift_name = `${result.departments.join(", ")} Shift`;

  result.description =
    `Shift from ${result.start_time || "N/A"} to ${result.end_time || "N/A"} on ` +
    `${result.days.length ? result.days.join(",") : "N/A"} for ${result.headcount} staff. ` +
    `Departments: ${result.departments.join(", ")}. ` +
    `Duration: ${result.start_date} → ${result.end_date}`;

  return {
    recommendations: [result],
  };
}

/* -------------------------- Employee Filtering -------------------------- */
const getAvailableEmployees = (departments) => {
  if (!departments || departments.length === 0) return dummyEmployees;
  return dummyEmployees.filter((emp) => departments.includes(emp.department));
};

/* -------------------------- Component -------------------------- */
export default function Schedule() {
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [publishing, setPublishing] = useState([]);
  const [published, setPublished] = useState([]);
  const [history, setHistory] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [modalShift, setModalShift] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const runAnalysis = () => {
    if (!aiText.trim()) return;
    const res = analyzeShift(aiText);
    setAiResult(res);
  };

  const openPublishModal = (shift, index = null) => {
    setModalShift({ ...shift, assigned_employees: shift.assigned_employees || [] });
    setEditingIndex(index);
    setOpenModal(true);
  };

  const savePublishing = () => {
    if (editingIndex !== null) {
      const updated = [...publishing];
      updated[editingIndex] = modalShift;
      setPublishing(updated);
    } else {
      setPublishing((prev) => [...prev, modalShift]);
    }
    setOpenModal(false);
    setModalShift(null);
    setEditingIndex(null);
  };

  const publishShift = (idx) => {
    const shift = publishing[idx];
    setPublished((prev) => [...prev, { ...shift, status: "Active" }]);
    setPublishing(publishing.filter((_, i) => i !== idx));
  };

  const reuseShift = (idx) => {
    const shift = history[idx];
    setPublishing((prev) => [...prev, { ...shift }]);
    setHistory(history.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    const stillActive = [];
    const ended = [];

    published.forEach((shift) => {
      if (shift.end_date && new Date(shift.end_date) < twoDaysAgo) {
        ended.push({ ...shift, status: "Ended" });
      } else {
        stillActive.push(shift);
      }
    });

    if (ended.length > 0) {
      setPublished(stillActive);
      setHistory((prev) => [...prev, ...ended]);
    }
  }, [published]);

  return (
    <div className="p-6 space-y-6">
      {/* AI Shift Analysis */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">AI Shift Analysis</h2>
        <Textarea
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="e.g. 3 IT staff Saturday to Sunday 1pm-6pm for 2 weeks"
        />
        <Button className="mt-2" onClick={runAnalysis}>
          Analyze
        </Button>

        {aiResult && (
          <div className="mt-4 space-y-3">
            {aiResult.recommendations.map((r, i) => (
              <div key={i} className="border p-3 rounded bg-gray-50">
                <p><strong>{r.shift_name}</strong></p>
                <p>Time: {r.start_time} – {r.end_time}</p>
                <p>Dept: {r.departments.join(", ")}</p>
                <p>Headcount: {r.headcount}</p>
                <p>Days: {r.days.join(", ")}</p>
                <p>Duration: {r.start_date} → {r.end_date}</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => openPublishModal(r)}
                >
                  Add to Publishing Schedule
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shifts & Schedule Publishing */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">Shifts & Schedule Publishing</h2>
        {publishing.length === 0 ? (
          <p className="text-gray-500">No shifts ready for publishing.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Shift</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Dept</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishing.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell>{s.shift_name}</TableCell>
                  <TableCell>{s.start_time} - {s.end_time}</TableCell>
                  <TableCell>{s.departments.join(", ")}</TableCell>
                  <TableCell>
                    {s.assigned_employees?.length
                      ? s.assigned_employees.map((e) => e.name).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>{s.start_date} → {s.end_date}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => openPublishModal(s, idx)}>
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => publishShift(idx)}>
                      Publish
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Published Shifts */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">Published Shifts & Schedules</h2>
        {published.length === 0 ? (
          <p className="text-gray-500">No active shifts.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Shift</TableCell>
                <TableCell>Dept</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {published.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell>{s.shift_name}</TableCell>
                  <TableCell>{s.departments.join(", ")}</TableCell>
                  <TableCell>{s.start_date} → {s.end_date}</TableCell>
                  <TableCell>{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* History */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">History (Ended Shifts)</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No ended shifts.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Shift</TableCell>
                <TableCell>Dept</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell>{s.shift_name}</TableCell>
                  <TableCell>{s.departments.join(", ")}</TableCell>
                  <TableCell>{s.start_date} → {s.end_date}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reuseShift(idx)}
                    >
                      Reuse
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {/* Published Shifts as Calendar */}
<div className="p-4 border rounded bg-white shadow">
  <h2 className="text-lg font-bold">Published Shifts & Schedules</h2>
  {published.length === 0 ? (
    <p className="text-gray-500">No active shifts.</p>
  ) : (
    <div className="overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableCell className="font-bold">Department</TableCell>
            {DAYS.map((day) => (
              <TableCell key={day} className="font-bold text-center">
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {deptLexicon.map((dept) => (
            <TableRow key={dept.label}>
              <TableCell className="font-semibold">{dept.label}</TableCell>
              {DAYS.map((day) => {
                const shiftsForDay = published.filter(
                  (s) =>
                    s.departments.includes(dept.label) &&
                    s.days.includes(day)
                );
                return (
                  <TableCell key={day} className="align-top">
                    {shiftsForDay.length === 0 ? (
                      <span className="text-gray-400 text-sm">—</span>
                    ) : (
                      <div className="space-y-2">
                        {shiftsForDay.map((shift, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-blue-50 border text-sm text-center"
                          >
                            <div className="flex justify-between">
                              <p className="font-medium">{shift.shift_name}
                              </p>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                                  shift.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {shift.status}
                              </span>
                            </div>
                            <p>
                              {shift.start_time} - {shift.end_time}
                            </p>
                            <p className="text-xs text-gray-600">
                              {shift.assigned_employees?.map((e) => e.name).join(", ") || "No employees"}
                            </p>
                            
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )}
</div>


      {/* Modal for Adding/Editing Employees */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Publishing Shift" : "Add Shift to Publishing"}
            </DialogTitle>
          </DialogHeader>
          {modalShift && (
            <div className="space-y-3">
              <Input
                type="text"
                value={modalShift.shift_name}
                onChange={(e) => setModalShift({ ...modalShift, shift_name: e.target.value })}
                placeholder="Shift Name"
              />
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={modalShift.start_time}
                  onChange={(e) => setModalShift({ ...modalShift, start_time: e.target.value })}
                />
                <Input
                  type="time"
                  value={modalShift.end_time}
                  onChange={(e) => setModalShift({ ...modalShift, end_time: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={modalShift.start_date}
                  onChange={(e) => setModalShift({ ...modalShift, start_date: e.target.value })}
                />
                <Input
                  type="date"
                  value={modalShift.end_date}
                  onChange={(e) => setModalShift({ ...modalShift, end_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm">Assign Employees</label>
                {Array.from({ length: modalShift.headcount }).map((_, i) => (
                  <select
                    key={i}
                    className="w-full border p-1 rounded mb-2"
                    value={modalShift.assigned_employees[i]?.id || ""}
                    onChange={(e) => {
                      const empId = Number(e.target.value);
                      setModalShift((prev) => {
                        const assigned = [...prev.assigned_employees];
                        if (empId) {
                          const emp = dummyEmployees.find((em) => em.id === empId);
                          assigned[i] = emp;
                        } else {
                          assigned.splice(i, 1);
                        }
                        return { ...prev, assigned_employees: assigned };
                      });
                    }}
                  >
                    <option value="">Select Employee {i + 1}</option>
                    {getAvailableEmployees(modalShift.departments)
                      .filter((emp) =>
                        !modalShift.assigned_employees.find((a) => a?.id === emp.id)
                      )
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role}
                        </option>
                      ))}
                  </select>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={savePublishing}>
              {editingIndex !== null ? "Save Changes" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

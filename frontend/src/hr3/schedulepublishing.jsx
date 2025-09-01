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
} from "@/components/ui/dialog";

export default function SchedulePublishing() {
  const [publishedSchedules, setPublishedSchedules] = useState([
    {
      id: 1,
      groupName: "Group A",
      dateCreated: "2024-01-01",
      shift: "Morning",
      assignments: [
        { name: "John Doe", schedule: ["Duty", "Duty", "Off", "Duty", "Duty", "Duty", "Duty"] },
        { name: "Jane Smith", schedule: ["Duty", "Off", "Duty", "Duty", "Off", "Duty", "Duty"] },
        { name: "Mark Lee", schedule: ["Off", "Duty", "Duty", "Off", "Duty", "Duty", "Duty"] },
        { name: "Sarah Kim", schedule: ["Duty", "Duty", "Duty", "Duty", "Off", "Off", "Duty"] },
        { name: "Paul White", schedule: ["Duty", "Duty", "Off", "Duty", "Duty", "Duty", "Off"] },
      ],
    },
    {
      id: 2,
      groupName: "Group B",
      dateCreated: "2024-01-02",
      shift: "Night",
      assignments: [
        { name: "Alice Brown", schedule: ["Duty", "Duty", "Duty", "Off", "Duty", "Duty", "Duty"] },
        { name: "Bob Johnson", schedule: ["Off", "Duty", "Duty", "Duty", "Duty", "Duty", "Off"] },
        { name: "Chris Evans", schedule: ["Duty", "Off", "Duty", "Duty", "Duty", "Off", "Duty"] },
        { name: "Emma Stone", schedule: ["Duty", "Duty", "Off", "Duty", "Duty", "Duty", "Duty"] },
        { name: "Tom Hardy", schedule: ["Duty", "Duty", "Duty", "Duty", "Off", "Duty", "Off"] },
      ],
    },
  ]);

  const [published, setPublished] = useState([]);

  const publishSchedule = (schedule) => {
    setPublished((prev) => [...prev, schedule]);
  };

  return (
    <>
      <h2 className="text-xl font-bold mt-8 mb-4">Schedules to Publish</h2>
      <div style={{ maxHeight: "300px", overflowY: "auto" }} className="mb-8 border rounded-lg shadow w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Group Name</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedSchedules.map((schedule, index) => (
              <TableRow key={schedule.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{schedule.groupName}</TableCell>
                <TableCell>{schedule.dateCreated}</TableCell>
                <TableCell>{schedule.shift}</TableCell>
                <TableCell className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">View</Button>
                    </DialogTrigger>
                    <DialogContent className="w-full p-6">
                      <DialogHeader>
                        <DialogTitle>
                          {schedule.groupName} - {schedule.shift} Shift
                        </DialogTitle>
                      </DialogHeader>
                      <div className="w-fit">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Shift</TableCell>
                              <TableCell>Monday</TableCell>
                              <TableCell>Tuesday</TableCell>
                              <TableCell>Wednesday</TableCell>
                              <TableCell>Thursday</TableCell>
                              <TableCell>Friday</TableCell>
                              <TableCell>Saturday</TableCell>
                              <TableCell>Sunday</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {schedule.assignments.map((member, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{schedule.shift}</TableCell>
                                {member.schedule.map((day, i) => (
                                  <TableCell key={i}>{day}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={() => publishSchedule(schedule)}>
                    Publish
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Published Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Published Schedules</h2>
      {published.length === 0 ? (
        <p>No schedules published yet.</p>
      ) : (
        published.map((schedule) => (
          <div key={schedule.id} className="mb-6">
            <h3 className="font-semibold mb-2">
              {schedule.groupName} - {schedule.shift} Shift
            </h3>
            <div className="w-full border rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Monday</TableCell>
                    <TableCell>Tuesday</TableCell>
                    <TableCell>Wednesday</TableCell>
                    <TableCell>Thursday</TableCell>
                    <TableCell>Friday</TableCell>
                    <TableCell>Saturday</TableCell>
                    <TableCell>Sunday</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.assignments.map((member, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{schedule.shift}</TableCell>
                      {member.schedule.map((day, i) => (
                        <TableCell key={i}>{day}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))
      )}
    </>
  );
}

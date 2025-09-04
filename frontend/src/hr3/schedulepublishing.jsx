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
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
      {/* Pending Schedules */}
      <h2 className="text-2xl font-bold mt-8 mb-4">📋 Schedules to Publish</h2>
      <div className="mb-8 border rounded-lg shadow w-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableCell>#</TableCell>
              <TableCell>Group Name</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedSchedules.map((schedule, index) => (
              <TableRow key={schedule.id} className="hover:bg-gray-50">
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-semibold">{schedule.groupName}</TableCell>
                <TableCell>{schedule.dateCreated}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="px-2 py-1">
                    {schedule.shift}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {/* View Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">View</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-6">
                      <DialogHeader>
                        <DialogTitle>{schedule.groupName} - {schedule.shift} Shift</DialogTitle>
                        <DialogDescription>
                          Detailed weekly schedule assignments
                        </DialogDescription>
                      </DialogHeader>
                      <div className="overflow-x-auto mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
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
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{schedule.shift}</Badge>
                                </TableCell>
                                {member.schedule.map((day, i) => (
                                  <TableCell key={i}>
                                    {day === "Duty" ? (
                                      <Badge className="bg-green-500 text-white">{day}</Badge>
                                    ) : (
                                      <Badge className="bg-red-500 text-white">{day}</Badge>
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Publish Button */}
                  <Button size="sm" onClick={() => publishSchedule(schedule)}>
                    Publish
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Published Schedules */}
      <h2 className="text-2xl font-bold mt-8 mb-4">✅ Published Schedules</h2>
      {published.length === 0 ? (
        <p className="text-gray-500">No schedules published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {published.map((schedule) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg shadow p-4 bg-white"
            >
              <h3 className="font-semibold text-lg mb-2">
                {schedule.groupName} - {schedule.shift} Shift
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableCell>Name</TableCell>
                      <TableCell>Shift</TableCell>
                      <TableCell>Mon</TableCell>
                      <TableCell>Tue</TableCell>
                      <TableCell>Wed</TableCell>
                      <TableCell>Thu</TableCell>
                      <TableCell>Fri</TableCell>
                      <TableCell>Sat</TableCell>
                      <TableCell>Sun</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.assignments.map((member, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{schedule.shift}</Badge>
                        </TableCell>
                        {member.schedule.map((day, i) => (
                          <TableCell key={i}>
                            {day === "Duty" ? (
                              <Badge className="bg-green-500 text-white">{day}</Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white">{day}</Badge>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

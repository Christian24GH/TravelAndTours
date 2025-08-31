import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function TimesheetDialog({ employee, open, onOpenChange }) {
  const [isEditing, setIsEditing] = React.useState(false);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[70%]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>{employee.employeeName}'s Timesheet Details</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Break In</TableHead>
                <TableHead>Break Out</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(employee) ? (
                employee.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {isEditing ? (
                        <input 
                          type="text" 
                          defaultValue={record.date} 
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        record.date
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <select defaultValue={record.status} className="border rounded p-1 w-full">
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                        </select>
                      ) : (
                        record.status
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input 
                          type="time" 
                          defaultValue={record.timeIn} 
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        record.timeIn
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input 
                          type="time" 
                          defaultValue={record.breakIn} 
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        record.breakIn
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input 
                          type="time" 
                          defaultValue={record.breakOut} 
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        record.breakOut
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input 
                          type="time" 
                          defaultValue={record.timeOut} 
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        record.timeOut
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input 
                          type="text" 
                          defaultValue={record.total} 
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        record.total
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>
                    {isEditing ? (
                      <input 
                        type="text" 
                        defaultValue={employee.date} 
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      employee.date
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <select defaultValue={employee.status} className="border rounded p-1 w-full">
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                      </select>
                    ) : (
                      employee.status
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <input 
                        type="time" 
                        defaultValue={employee.timeIn} 
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      employee.timeIn
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <input 
                        type="time" 
                        defaultValue={employee.breakIn} 
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      employee.breakIn
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <input 
                        type="time" 
                        defaultValue={employee.breakOut} 
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      employee.breakOut
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <input 
                        type="time" 
                        defaultValue={employee.timeOut} 
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      employee.timeOut
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <input 
                        type="text" 
                        defaultValue={employee.total} 
                        className="border rounded p-1 w-full"
                      />
                    ) : (
                      employee.total
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {Array.isArray(employee) && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Total Hours:
                  </TableCell>
                  <TableCell className="font-medium">
                    {(() => {
                      const totalMins = employee.reduce((sum, record) => sum + parseFloat(record.total || 0), 0);
                      return `${totalMins}mins`;
                    })()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <div className="flex justify-end space-x-2">
          {!isEditing && (!Array.isArray(employee) || employee.some(r => r.status === 'Pending')) ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Save logic would go here
                  setIsEditing(false);
                  onOpenChange(false);
                }}
              >
                Save Changes
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
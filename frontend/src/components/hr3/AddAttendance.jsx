import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddAttendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    timeIn: "",
    timeOut: "",
    breakIn: "",
    breakOut: ""
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/employees');
        if (!response.data) {
          throw new Error('No data received from API');
        }
        const employeesData = Array.isArray(response.data) ? response.data : [response.data];
        setEmployees(employeesData.map(emp => ({
          id: emp.id,
          name: emp.full_name || 'Unknown Employee',
          department: emp.department || 'N/A',
          position: emp.position || 'N/A'
        })));
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = Array.isArray(employees) 
    ? employees.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/attendance', {
        employee_id: selectedEmployee,
        date: formData.date,
        clock_in: formData.timeIn,
        clock_out: formData.timeOut,
        break_in: formData.breakIn,
        break_out: formData.breakOut
      });
      
      if (response.status === 201) {
        alert('Attendance record created successfully!');
        window.location.reload(); // Refresh to show new record
      }
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert(`Error creating attendance: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      setSelectedEmployeeDetails(employee);
    } else {
      setSelectedEmployeeDetails(null);
    }
  }, [selectedEmployee, employees]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Attendance</DialogTitle>
        <DialogDescription>
          Fill out the form to add a new attendance record.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Employee</label>
          <Select onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {filteredEmployees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedEmployeeDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium">{selectedEmployeeDetails.name}</h4>
              <p className="text-sm text-gray-600">ID: {selectedEmployeeDetails.id}</p>
              <p className="text-sm text-gray-600">Department: {selectedEmployeeDetails.department || 'N/A'}</p>
              <p className="text-sm text-gray-600">Position: {selectedEmployeeDetails.position || 'N/A'}</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block mb-2">Date</label>
          <Input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Clock In</label>
            <Input 
              type="time" 
              value={formData.timeIn}
              onChange={(e) => setFormData({...formData, timeIn: e.target.value})}

            />
          </div>
          
          <div>
            <label className="block mb-2">Clock Out</label>
            <Input 
              type="time" 
              value={formData.timeOut}
              onChange={(e) => setFormData({...formData, timeOut: e.target.value})}

            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Break In</label>
            <Input 
              type="time" 
              value={formData.breakIn}
              onChange={(e) => setFormData({...formData, breakIn: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block mb-2">Break Out</label>
            <Input 
              type="time" 
              value={formData.breakOut}
              onChange={(e) => setFormData({...formData, breakOut: e.target.value})}
            />
          </div>
        </div>
        
        <Button type="submit">Submit</Button>
      </form>
    </DialogContent>
  );
}
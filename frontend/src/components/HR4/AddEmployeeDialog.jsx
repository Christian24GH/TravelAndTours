import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { HR4 } from "../../api/HR4"

const api = HR4.backend.api

export function AddEmployeeDialog({ onAdded, jobs }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    hire_date: "",
    job_id: "",
    salary: "",
    employment_type: "full_time",
    status: "active",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(HR4.backend.api.register, formData) // ← fixed
      toast.success("Employee added successfully")
      setOpen(false)
      setFormData({
        employee_code: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        hire_date: "",
        job_id: "",
        salary: "",
        employment_type: "full_time",
        status: "active",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
      })
      if (onAdded) onAdded(response.data.employee)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to add employee")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Employee</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto p-6 sm:max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill out the form below to register a new employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Employee Code", name: "employee_code" },
            { label: "First Name", name: "first_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone" },
            { label: "Date of Birth", name: "date_of_birth", type: "date" },
            { label: "Hire Date", name: "hire_date", type: "date" },
            { label: "Salary", name: "salary", type: "number" },
            { label: "Address", name: "address" },
            { label: "Emergency Contact", name: "emergency_contact" },
            { label: "Emergency Phone", name: "emergency_phone" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* Job Dropdown */}
          <div>
            <Label htmlFor="job_id">Job</Label>
            <select
              id="job_id"
              name="job_id"
              value={formData.job_id}
              onChange={(e) => setFormData(prev => ({ ...prev, job_id: e.target.value }))}
              className="w-full border rounded p-2"
            >
              <option value="">-- Select Job --</option>
              {Array.isArray(jobs) && jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <Label htmlFor="employment_type">Employment Type</Label>
            <select
              id="employment_type"
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="full_time">Full Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

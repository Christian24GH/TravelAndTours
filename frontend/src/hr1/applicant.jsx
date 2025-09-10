// src/hr1/applicant.jsx
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useEchoPublic } from "@laravel/echo-react"
import { hr1 } from "@/api/hr1"
import PaginationComponent from "@/components/hr1/pagination"
import TableComponent from "@/components/hr1/table"
import RegisterDialog from "@/components/hr1/register-dialog"
import UpdateDialog from "@/components/hr1/edit-dialog"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const api = hr1.backend.api
const reverb = hr1.reverb
reverb.config()

// --- DASHBOARD TABLE COLUMNS (only personal info) ---
const header = [
  { title: "Employee Code", accessor: "employee_code" },
  { title: "Name", accessor: "name", cellClassName: "font-medium" },
  { title: "Email", accessor: "email" },
  { title: "Phone", accessor: "phone" },
  { title: "Status", accessor: "status" },
  { title: "Hire Date", accessor: "hire_date" },
  { title: "Job", accessor: "job" },
  {
    title: "Actions",
    render: (item) => (
      <div className="flex gap-2 justify-end">
        <UpdateDialog item={item} />
        <ViewDialog item={item} />
      </div>
    ),
  },
]

// --- VIEW DIALOG COMPONENT ---
function ViewDialog({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* PERSONAL INFO */}
          <div>
            <h3 className="font-semibold mb-2">Personal Info</h3>
            <p><b>Employee Code:</b> {item.employee_code}</p>
            <p><b>Name:</b> {item.name}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Phone:</b> {item.phone}</p>
            <p><b>Status:</b> {item.status}</p>
            <p><b>Hire Date:</b> {item.hire_date}</p>
          </div>

          {/* JOB INFO */}
          <div>
            <h3 className="font-semibold mb-2">Job Info</h3>
            <p><b>Job Title:</b> {item.job_title}</p>
            <p><b>Employment Type:</b> {item.employment_type}</p>
            <p><b>Department:</b> {item.department}</p>
            <p><b>Salary:</b> {item.salary}</p>
          </div>

          {/* EMERGENCY CONTACT */}
          <div>
            <h3 className="font-semibold mb-2">Emergency Contact</h3>
            <p><b>Contact Name:</b> {item.emergency_contact_name}</p>
            <p><b>Contact Phone:</b> {item.emergency_contact_phone}</p>
            <p><b>Address:</b> {item.emergency_contact_address}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ApplicantPage() {
  const [applicants, setApplicants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [search, setSearch] = useState("")

  const fetchApplicants = useCallback(() => {
    axios
      .get(api.applicants, { params: { page, q: search || undefined } })
      .then((response) => {
        const data = response.data
        setApplicants(Array.isArray(data) ? data : [])
        setTotalPage(1)
      })
      .catch(() =>
        toast.error("Error fetching applicants", { position: "top-center" })
      )
  }, [page, search])

  useEffect(() => {
    const delayDebounce = setTimeout(fetchApplicants, 300)
    return () => clearTimeout(delayDebounce)
  }, [fetchApplicants])

  useEchoPublic("applicant_channel", "ApplicantUpdates", (e) => {
    let a = e.applicant
    setApplicants((prev) => {
      const exist = prev.find((item) => item.id === a.id)
      if (exist) return prev.map((item) => (item.id === a.id ? a : item))
      return [...prev, a]
    })
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex mb-3 gap-2">
            <Input
              placeholder="Search Name, Email, or Position"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <RegisterDialog onApplicantAdded={fetchApplicants} />
          </div>

          <div className="min-h-96">
            <TableComponent
              list={applicants}
              recordName="applicant"
              columns={header}
            />
          </div>
        </div>

        <PaginationComponent
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          className="mt-4"
        />
      </div>
    </motion.div>
  )
}

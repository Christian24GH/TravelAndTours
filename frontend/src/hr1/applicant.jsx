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

const api = hr1.backend.api
const reverb = hr1.reverb
reverb.config()

const header = [
  { title: "Name", accessor: "name", cellClassName: "font-medium" },
  { title: "Email", accessor: "email" },
  { title: "Phone", accessor: "phone" },
  { title: "Position", accessor: "position" },
  { title: "Status", accessor: "status", cellClassName: "text-right" },
  { title: "Applied At", accessor: "created_at", cellClassName: "text-right" },
  { title: "Updated At", accessor: "updated_at", cellClassName: "text-right" },
  { title: "Actions", render: (item) => <UpdateDialog item={item} /> },
]

export default function ApplicantPage() {
  const [applicants, setApplicants] = useState([])
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [search, setSearch] = useState("")

  // Fetch applicants function (can be reused)
  const fetchApplicants = useCallback(() => {
  axios
    .get(api.applicants, { params: { page, q: search || undefined } })
    .then((response) => {
      // If backend returns a plain array:
      const data = response.data // use response.data directly
      setApplicants(Array.isArray(data) ? data : [])
      setTotalPage(1) // if no pagination info
    })
    .catch(() =>
      toast.error("Error fetching applicants", { position: "top-center" })
    )
}, [page, search])


  // Fetch on mount and when page/search changes
  useEffect(() => {
    const delayDebounce = setTimeout(fetchApplicants, 300)
    return () => clearTimeout(delayDebounce)
  }, [fetchApplicants])

  // Listen for real-time updates
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

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { hr1 } from "@/api/hr1"
import TableComponent from "@/components/hr1/table"
import PaginationComponent from "@/components/hr1/pagination"
import { motion } from "framer-motion"

const api = hr1.backend.api

const header = [
  { title: "Applicant", accessor: "applicant" },
  { title: "Date", accessor: "date" },
  { title: "Status", accessor: "status" },
]

export default function Hr1InterviewPage() {
  const [interviews, setInterviews] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)

  const fetchInterviews = useCallback(() => {
    axios
      .get(api.interviews, { params: { page, q: search || undefined } })
      .then((response) => {
        const data = response.data
        setInterviews(Array.isArray(data) ? data : [])
        setTotalPage(1)
      })
      .catch(() =>
        toast.error("Error fetching interviews", { position: "top-center" })
      )
  }, [page, search])

  useEffect(() => {
    const delay = setTimeout(fetchInterviews, 300)
    return () => clearTimeout(delay)
  }, [fetchInterviews])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex mb-3 gap-2">
          <Input
            placeholder="Search applicant or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="min-h-96">
          <TableComponent
            list={interviews}
            recordName="interview"
            columns={header}
          />
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

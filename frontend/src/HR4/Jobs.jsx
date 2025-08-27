import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { useEffect, useState } from "react"


import { HR4 } from "../api/HR4"
const api = HR4.backend.api

function getPaginationNumbers(current, total) {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let last

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (let i of range) {
    if (last) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (i - last !== 1) {
        rangeWithDots.push(<PaginationEllipsis />)
      }
    }
    rangeWithDots.push(i)
    last = i
  }

  return rangeWithDots
}

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios.get(`${api.jobs}`, {
        params: { page, q: search || undefined }
      })
        .then((res) => {
          // your controller returns raw array, not { jobs: ... }
          const data = Array.isArray(res.data) ? res.data : res.data.data ?? []
          setJobs(data)
          setTotalPage(res.data?.last_page || 1) // if you later paginate
        })
        .catch(() => {
          toast.error("Error fetching jobs", { position: "top-center" })
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [page, search])

  return (
    <main>
      {/* Search + Add */}
      <div className="flex mb-3 gap-2">
        <Input
          placeholder="Search jobs by title or department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="min-h-96">
        <Table>
          {jobs.length === 0 && !loading && (
            <TableCaption>No jobs found in the records.</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.description}</TableCell>
                  <TableCell>{job.base_salary}</TableCell>
                  <TableCell>{job.created_at}</TableCell>
                  <TableCell>{job.updated_at}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          try {
                            await axios.delete(`${api.jobs}/${job.id}`)
                            setJobs((prev) => prev.filter((j) => j.id !== job.id))
                            toast.success("Job deleted")
                          } catch {
                            toast.error("Error deleting job")
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              to="#"
              onClick={(e) => {
                e.preventDefault()
                setPage((p) => Math.max(p - 1, 1))
              }}
              aria-disabled={page === 1}
            />
          </PaginationItem>

          {getPaginationNumbers(page, totalPage).map((num, idx) => (
            <PaginationItem key={idx}>
              {num === "..." ? (
                <span className="px-2">...</span>
              ) : (
                <PaginationLink
                  to="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(num)
                  }}
                  isActive={page === num}
                >
                  {num}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              to="#"
              onClick={(e) => {
                e.preventDefault()
                setPage((p) => Math.min(p + 1, totalPage))
              }}
              aria-disabled={page === totalPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </main>
  )
}

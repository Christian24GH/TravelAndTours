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
import { useEchoPublic } from "@laravel/echo-react"

// Custom Components
import { AddEmployeeDialog } from '@/components/HR4/AddEmployeeDialog'
import { UpdateEmployeeDialog } from '@/components/HR4/UpdateEmployeeDialog'

import { HR4 } from "../api/HR4"
const api = HR4.backend.api
const reverb = HR4.reverb

reverb.config()

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

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [jobs, setJobs] = useState([])

  useEffect(() => {
    axios.get(HR4.backend.api.jobs)
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios.get(`${api.employees}`, { params: { page, q: search || undefined } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data.data ?? []
          setEmployees(data) 
          setTotalPage(res.data?.last_page || 1)
        })
        .catch(() => toast.error("Error fetching employees", { position: "top-center" }))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [page, search])

  // Real-time updates (if you broadcast employee events)
  useEchoPublic("employees_channel", "EmployeeUpdates", (e) => {
    let emp = e.employees
    setEmployees((prev) => {
      const exist = prev.find((item) => item.id === emp.id)
      if (exist) {
        return prev.map((item) => (item.id === emp.id ? emp : item))
      }
      return [...prev, emp]
    })
  })

  return (
    <main>
      {/* Search + Add */}
      <div className="flex mb-3 gap-2">
        <Input
          placeholder="Search employees by name, email, or department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AddEmployeeDialog onAdded={(emp) => setEmployees((prev) => [emp, ...prev])} />
      </div>

      {/* Table */}
      <div className="min-h-96">
        <Table>
          {employees.length === 0 && !loading && (
            <TableCaption>No employees found in the records.</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  className={
                    emp.status === "inactive"
                      ? "bg-gray-200"
                      : emp.status === "active"
                        ? "bg-green-200"
                        : emp.status === "terminated"
                          ? "bg-red-200"
                          : ""
                  }
                >
                  <TableCell>{emp.employee_code}</TableCell>
                  <TableCell>{emp.first_name}</TableCell>
                  <TableCell>{emp.last_name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>{emp.status}</TableCell>
                  <TableCell>{emp.created_at}</TableCell>
                  <TableCell>{emp.updated_at}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <UpdateEmployeeDialog employee={emp} />
                      <Button variant="destructive" size="sm">Delete</Button>
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

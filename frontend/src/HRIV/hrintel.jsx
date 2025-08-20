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

//Custom Components
import { UpdateDialog } from '@/components/logisticsII/edit-dialog'
import { RegisterDialog } from '@/components/logisticsII/register-dialog'

import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEchoPublic } from "@laravel/echo-react";

import { logisticsII } from "../api/logisticsII";

const api = logisticsII.backend.api
const reverb = logisticsII.reverb

reverb.config()

function getPaginationNumbers(current, total) {
  const delta = 2; // pages to show before/after current
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (last) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last !== 1) {
        rangeWithDots.push(<PaginationEllipsis/>);
      }
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
}

export default function HRintel() {
  const [ vehicles , setVehicles ] = useState([])
  const [ page , setPage] = useState(1)
  const [ totalPage, setTotalPage ] = useState()
  const [search, setSearch] = useState("")
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios.get(`${api.vehicles}`, {
          params: {
            page,
            q: search || undefined
          }
        })
        .then((response) => {
          let data = response.data.vehicles;
          setVehicles(data.data || []);
          setTotalPage(data.last_page);
          
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error fetching vehicles", { position: "top-center" })

        }).finally(()=>{

          setLoading(false)

        })
    }, 300) // debounce API calls by 300ms

    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  useEchoPublic('vehicle_channel', "VehicleUpdates", (e)=>{
    let v = e.vehicles

    setVehicles((prev)=>{
      const exist = prev.find(item => item.id === v.id)
      if(exist){
        return prev.map(item => item.id === v.id ? v : item)
      }

      return [...prev, v]
    })
  })

  return (
    <main>
      <div className="flex mb-3 gap-2">
        <Input
            placeholder="Search VIN, Plate Number, Brand and Model"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        <RegisterDialog />
      </div>
      <div className={"min-h-96"}> 
        <Table>
            {vehicles.length === 0 && (<TableCaption>No vehicles found in the records.</TableCaption>)}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">VIN</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Year</TableHead>
                <TableHead className="text-right">Created at</TableHead>
                <TableHead className="text-right">Updated at</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {vehicles.map(item=>(
                    <TableRow key={item.id} className={item.status === "retired" ? "bg-gray-200" :
                      item.status === "active" ? "bg-green-200" : item.status === "under_maintenance" ? "bg-red-200" : ""
                    }>
                      <TableCell className="font-medium">{item.vin}</TableCell>
                      <TableCell>{item.make}</TableCell>
                      <TableCell>{item.model}</TableCell>
                      <TableCell className="text-right">{item.year}</TableCell>
                      <TableCell className="text-right">{item.created_at}</TableCell>
                      <TableCell className="text-right">{item.updated_at}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UpdateDialog
                            item={item}
                          />
                          <Button>Archive</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent>          
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(p => Math.max(p - 1, 1));
              }}
              aria-disabled={page === 1}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getPaginationNumbers(page, totalPage).map((num, idx) => (
          <PaginationItem key={idx}>
            {num === "..." ? (
              <span className="px-2">...</span>
            ) : (
              <PaginationLink
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(num);
                }}
                isActive={page === num}
              >
                {num}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(p => Math.min(p + 1, totalPage));
              }}
              aria-disabled={page === totalPage}
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>
    </main>
  );
}

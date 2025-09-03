import { ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

import axios from "axios";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner";
import { Link } from "react-router";
import {motion} from 'motion/react'

import { useEchoPublic } from "@laravel/echo-react";
import { logisticsII } from "@/api/logisticsII";
import PaginationComponent from "@/components/logisticsII/pagination";
import TableComponent from "@/components/logisticsII/table";

import { ViewDialog } from "@/components/logisticsII/reservation/modals";

const api = logisticsII.backend.api;
const reverb = logisticsII.reverb;

reverb.config();

const header = [
  { title: "Batch", accessor: "batch_number", cellClassName: "font-medium h-1"},
  { title: "Employee", accessor: "employee_id", cellClassName: "h-1" },
  { title: "Status", accessor: "status", cellClassName: "h-1" },
  { title: "Created", accessor: "created_at", cellClassName: "h-1"},
  {
    render: (item)=>(
      <Link to={`${item.batch_number}`}>
        <Button variant="" size="sm"><ChevronRightIcon/></Button>
      </Link>
    )
  },
];
export function statusColumn(){
  return (
    <>
    </>
  )
}

export default function Reservation() {
  const [record, setRecord] = useState();
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios
        .get(api.reservations, {
          params: {
            page,
            q: search || undefined,
          },
        })
        .then((response) => {
          let data = response.data.reservations;
          setRecord(data.data || []);
          setTotalPage(data.last_page);
        })

        .catch(() => {
          toast.error("Error fetching reservations", {
            position: "top-center",
          });
        });
    }, 300); // debounce API calls by 300ms

    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  useEchoPublic('reservation_channel', "ReservationUpdates", (e)=>{
    console.log(e)
    let r = e.reservations
    setRecord((prev)=>{
      const exist = prev.find(item => item.id === r.id)
      if(exist){
        return prev.map(item => item.id === r.id ? r : item)
      }

      return [...prev, r]
    })
  })

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 h-full">
        <div className="flex flex-col flex-2 h-full">
            <div className="flex-4/5">
                <div className="flex mb-3 gap-2">
                    <Input
                        placeholder="Search Reservations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                   <Link to="make">
                      <Button>Make Reservation</Button>
                   </Link>
                </div>
                <div className="min-h-96">
                    <TableComponent
                        list={record}
                        recordName="reservations"
                        columns={header}
                        />
                </div>
            </div>
            <PaginationComponent className="flex-2/12"
                totalPage={totalPage}
                page={page}
                setPage={setPage}
            />
        </div>
    </motion.div>
  );
}

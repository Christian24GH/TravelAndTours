import { useEffect, useState } from "react";

import axios from "axios";
import { Input } from "@/components/ui/input"
import { toast } from "sonner";
import {motion} from 'motion/react'

import { useEchoPublic } from "@laravel/echo-react";
import { logisticsII } from "../api/logisticsII";
import PaginationComponent from "../components/logisticsII/pagination";
import TableComponent from "../components/logisticsII/table";

import { ViewDialog } from "../components/logisticsII/reservations";

const api = logisticsII.backend.api;
const reverb = logisticsII.reverb;

reverb.config();

const header = [
  { title: "Request", accessor: "uuid", cellClassName: "font-medium h-1"},
  { title: "VIN", accessor: "vin", cellClassName: "h-1" },
  { title: "Employee", accessor: "employee_id", cellClassName: "h-1" },
  { title: "Status", accessor: "status", cellClassName: "h-1" },
  { title: "Created", accessor: "created_at", cellClassName: "h-1"},
  {
    title: "Actions",
    render: (item)=>(
      <ViewDialog item={item}/>
    )
  },
];
export default function DispatchPage(){
    const [record, setRecord] = useState();
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState();
    const [search, setSearch] = useState("");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
        axios
            .get(`${api.dispatches}`, {
            params: {
                page,
                q: search || undefined,
            },
            })
            .then((response) => {
                let data = response.data.dispatch;
                console.log(data)
                setRecord(data.data || []);
                setTotalPage(data.last_page);
            })

            .catch(() => {
            toast.error("Error fetching dispatch records", {
                position: "top-center",
            });
            });
        }, 300); // debounce API calls by 300ms

        return () => clearTimeout(delayDebounce);
    }, [page, search]);

    useEchoPublic('dispatch_channel', "DispatchUpdates", (e)=>{
        console.log(e)
        let r = e.record
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
                            placeholder="Search Dispatch"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="min-h-96">
                        <TableComponent
                            list={record}
                            recordName="dispatch"
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
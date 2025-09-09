import { ChevronRightIcon } from 'lucide-react'
import { useEffect, useState, useCallback } from "react";

import axios from "axios";
import { Input } from "@/components/ui/input"
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Link } from "react-router";
import {motion} from 'motion/react'

import { useEchoPublic } from "@laravel/echo-react";
import { logisticsII } from "@/api/logisticsII";
import PaginationComponent from "@/components/logisticsII/pagination";
import TableComponent from "@/components/logisticsII/table";

const api = logisticsII.backend.api;
const reverb = logisticsII.reverb;

reverb.config();

const header = [
  { title: "Batch Number", accessor: "batch_number", cellClassName: "font-medium h-1"},
  { title: "Vehicle", accessor: "vehicle_type", cellClassName: "h-1" },
  { title: "Capacity", accessor: "vehicle_capacity", cellClassName: "h-1" },
  { title: "Driver", accessor: "driver_name", cellClassName: "h-1" },
  { title: "Scheduled Time", accessor: "scheduled_time", cellClassName: "h-1" },
  { title: "Status", accessor: "status", cellClassName: "h-1" },
  { title: "Created", accessor: "created_at", cellClassName: "h-1"},
  {
    title: "Actions",
    render: (item)=>(
        <Link to={`${item.uuid}`}>
            <Button variant="" size="sm"><ChevronRightIcon/></Button>
        </Link>
    )
  },
];
export default function DispatchPage(){
    const [record, setRecord] = useState();
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState();
    const [search, setSearch] = useState("");

    const fetchRecord = useCallback(() => {
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
    }, [page, search])

    useEffect(() => {
        let delayDebounce

        delayDebounce = setTimeout(fetchRecord, 300)

        return () => {
            clearTimeout(delayDebounce)
        }
    }, [fetchRecord] );

    useEffect(() => {
        let polling

        polling = setInterval(fetchRecord, 5000)

        return () => {
            clearInterval(polling)
        }
    }, [fetchRecord]);

    /*
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
    })*/

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
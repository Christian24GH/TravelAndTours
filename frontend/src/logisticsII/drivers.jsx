//Custom Components
import { RegisterDialog } from '@/components/logisticsII/register-dialog'

import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"

import { toast } from "sonner";
import { useEchoPublic } from "@laravel/echo-react";

import { logisticsII } from "../api/logisticsII"
import PaginationComponent from "../components/logisticsII/pagination"
import TableComponent from "../components/logisticsII/table";
import {motion} from 'motion/react'

const api = logisticsII.backend.api
const reverb = logisticsII.reverb

reverb.config()

import { Button } from '@/components/ui/button'

const header = [
  { title: "Name", accessor: "name", cellClassName: "font-medium"  },
  { title: "Status", accessor: "status" },
]

export default function Drivers() {
  const [ record , setRecord ] = useState([])
  const [ page , setPage] = useState(1)
  const [ totalPage, setTotalPage ] = useState()
  const [search, setSearch] = useState("")

  useEffect(() => {
    let delayDebounce
    let polling

    const fetchRecord = () => {
      axios.get(`${api.drivers}`, {
          params: {
            page,
            q: search || undefined
          }
        })
        .then((response) => {
          let data = response.data.drivers;
          setRecord(data.data || []);
          setTotalPage(data.last_page);
        })
        .catch(() => {
          toast.error("Error fetching drivers", { position: "top-center" })
        })
    } 
    
    delayDebounce = setTimeout(fetchRecord, 300)
    polling = setInterval(fetchRecord, 2000)

    return () => {
      clearTimeout(delayDebounce)
      clearInterval(polling)
    }
    
  }, [page, search]);

  const [ fetching, setFetching ] = useState(false)

  const fetchDrivers = () => {
    setFetching(true)

    axios.get(api.fetchDrivers)
        .then(response=>{
            console.log(response)
            toast.success('Successfully fetch drivers from HR', {position: "top-center"})
        })
        .catch(errors=>{
            console.log(errors)
            toast.error('Failed to fetch drivers from HR', {position: "top-center"})
        })
        .finally(()=>setFetching(false))
  }

  
  useEchoPublic('driver_channel', "DriverEvent", (e)=>{
    let driver = e.record;
    setRecord((prev) => [driver, ...prev]);
  })

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='h-full'>
      <div className="flex flex-col flex-2 h-full">
        <div className='flex-4/5'>
          <div className="flex mb-3 gap-2">
            <Input
                placeholder="Search Drivers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            <Button disabled={fetching} onClick={fetchDrivers}>Fetch Drivers</Button>
          </div>
          <div className="min-h-96"> 
            <TableComponent 
                list={record} 
                recordName="driver" 
                columns={header} 
              />
          </div>
        </div>
        <PaginationComponent totalPage={totalPage} page={page} setPage={setPage} className="flex-2/12"/>
      </div>
    </motion.div>
  );
}

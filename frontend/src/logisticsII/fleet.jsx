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
import UpdateDialog from '../components/logisticsII/edit-dialog';
import {motion} from 'motion/react'

const api = logisticsII.backend.api
const reverb = logisticsII.reverb

reverb.config()

const header = [
  { title: "VIN", accessor: "vin", cellClassName: "font-medium" },
  { title: "Make", accessor: "make" },
  { title: "Model", accessor: "model" },
  { title: "Year", accessor: "year", cellClassName: "text-right" },
  { title: "Status", accessor: "status", cellClassName: "text-right" },
  { title: "Created At", accessor: "created_at", cellClassName: "text-right" },
  { title: "Updated At", accessor: "updated_at", cellClassName: "text-right" },
  {
    render: (item) => (
      <UpdateDialog item={item} />
    )
  }
]

export default function Fleet() {
  const [ vehicles , setVehicles ] = useState([])
  const [ page , setPage] = useState(1)
  const [ totalPage, setTotalPage ] = useState()
  const [search, setSearch] = useState("")

  useEffect(() => {
    let delayDebounce;
    let polling;

    const fetchVehicles = () => {
      axios.get(`${api.vehicles}`, {
        params: {
          page,
          q: search || undefined,
        },
      })
      .then((response) => {
        let data = response.data.vehicles;
        setVehicles(data.data || []);
        setTotalPage(data.last_page);
      })
      .catch(() => {
        toast.error("Error fetching vehicles", { position: "top-center" });
      });
    };

    delayDebounce = setTimeout(fetchVehicles, 300);

    polling = setInterval(fetchVehicles, 2000);

    return () => {
      clearTimeout(delayDebounce);
      clearInterval(polling);
    };
    
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='h-full'>
      <div className="flex flex-col flex-2 h-full">
        <div className='flex-4/5'>
          <div className="flex mb-3 gap-2">
            <Input
                placeholder="Search VIN, Plate Number, Brand and Model"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            <RegisterDialog />
          </div>
          <div className="min-h-96"> 
            <TableComponent 
                list={vehicles} 
                recordName="vehicle" 
                columns={header} 
              />
          </div>
        </div>
        <PaginationComponent totalPage={totalPage} page={page} setPage={setPage} className="flex-2/12"/>
      </div>
    </motion.div>
  );
}

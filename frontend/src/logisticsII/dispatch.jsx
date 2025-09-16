import { ChevronRightIcon, ArrowUpRight } from 'lucide-react';
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Link } from "react-router";
import { motion } from 'motion/react';
import { Label } from '@/components/ui/label'

import { logisticsII } from "@/api/logisticsII";
import PaginationComponent from "@/components/logisticsII/pagination";

const api = logisticsII.backend.api;


export default function DispatchPage() {
  const [dispatchGroups, setDispatchGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchDispatches = useCallback(() => {
    axios.get(`${api.dispatches}`, { params: { page, q: search || undefined } })
      .then((response) => {
        const data = response.data.dispatches;
        setDispatchGroups(data);
        setTotalPage(data.last_page || 1);
      })
      .catch(() => {
        toast.error("Error fetching dispatch records", { position: "top-center" });
      });
  }, [page, search]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(fetchDispatches, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchDispatches]);

  // Polling for live updates every 5 seconds
  useEffect(() => {
    const polling = setInterval(fetchDispatches, 5000);
    return () => clearInterval(polling);
  }, [fetchDispatches]);
  console.log(dispatchGroups)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 h-full"
    >
        <div className="flex-4/5">
            {/* Search Input */}
            <div className="flex mb-3 gap-2">
                <Input
                placeholder="Search Dispatch"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Dispatch Groups */}
            <div className="flex flex-col gap-6 min-h-96">
                {dispatchGroups.length === 0 ? (
                <p className="text-gray-500 text-center">No dispatch records found.</p>
                ) : (
                dispatchGroups.map((group) => (
                    <div key={group.batch_number} className="border rounded p-4 shadow-sm">
                        <div className="flex justify-between">
                            <h3 className="font-bold mb-2 text-lg">{group.batch_number}</h3>
                            <Link to={group.batch_number}>
                                <Button>
                                    <ArrowUpRight/>
                                </Button>
                            </Link> 
                        </div>
                        <div className="space-y-1">
                            {group.reservations && group.reservations.length > 0 ? 
                                group.reservations.map(r => (
                                    <div key={r.dispatch_id} className='px-4 py-2 flex w-full rounded-md p-2'>
                                        <Label className="font-light flex-1">{r.dispatch_uuid}</Label>
                                        <div className="flex-1">
                                            <Label className="font-light border-1 rounded-full p-2 w-min">{r.dispatch_status}</Label>
                                        </div>
                                    </div>
                                ))
                            : (
                                <p className="text-gray-500">No reservations in this batch.</p>
                            )}
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>

      {/* Pagination */}
      <PaginationComponent
        totalPage={totalPage}
        page={page}
        setPage={setPage}
        className="flex-2/12"
      />
    </motion.div>
  );
}

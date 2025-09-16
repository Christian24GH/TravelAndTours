import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { logisticsII } from "@/api/logisticsII";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { DriverSelect } from "@/components/logisticsII/inputs/driver-select";
import Map from "@/components/logisticsII/reservation/map";

const api = logisticsII.backend.api;

export default function ReservationDetails() {
  const { batch_number } = useParams();
  const [record, setRecord] = useState();
  const [loading, setLoading] = useState(false);
  const lastSerialized = useRef(null);
  const controllerRef = useRef(null);

  const fetchRecord = useCallback(() => {
    try {
      if (controllerRef.current) controllerRef.current.abort();
    } catch (e) {}

    const controller = new AbortController();
    controllerRef.current = controller;

    axios
      .post(api.reservationDetails, 
        { batch_number: batch_number },
        { signal: controller.signal }  
      )
      .then((response) => {
        const data = response.data?.reservation;
        //console.log(data);
        const serialized = JSON.stringify(data);
        if (lastSerialized.current !== serialized) {
          lastSerialized.current = serialized;
          setRecord(data);
        }
      })
      .catch((errors) => {
        //console.log(errors);
        if (errors?.name === "CanceledError") return;
        toast.error("Failed to fetch details", { position: "top-center" });
      })
      .finally(() => setLoading(false));
  }, [batch_number]);

  useEffect(() => {
    setLoading(true);
    if (!batch_number) return;

    const polling = setInterval(fetchRecord, 5000);
    return () => {
      clearInterval(polling);
      try {
        if (controllerRef.current) controllerRef.current.abort();
      } catch (e) {}
    };
  }, [fetchRecord]);

  const [assignments, setAssignments] = useState([]);
  const handleAssign = (vehicle_id, driver_uuid) => {
    setAssignments((prev) => {
      const exists = prev.find((a) => a.vehicle_id === vehicle_id);
      if (exists) {
        return prev.map((a) =>
          a.vehicle_id === vehicle_id ? { ...a, driver_uuid } : a
        );
      }
      return [...prev, { vehicle_id, driver_uuid }];
    });
  };

  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleSave = () => {
    if (!assignments.length || assignments.some((a) => !a.driver_uuid)) {
      toast.error("Please assign drivers before saving.", {
        position: "top-center",
      });
      return;
    }

    setApproveLoading(true);
    axios
      .put(api.approveReservation, {
        batch_number: batch_number,
        assignments,
      })
      .then(() =>
        toast.success("Reservation approved, budget request sent", {
          position: "top-center",
        })
      )
      .catch((error) =>
        toast.error(
          `Failed to update reservation ${error.response?.data?.message}`,
          { position: "top-center" }
        )
      )
      .finally(() => setApproveLoading(false));
  };

  const handleReject = () => {
    if (!record?.id) return;
    setRejectLoading(true);

    axios
      .put(api.cancelReservation, { batch_number: batch_number, })
      .then(() =>
        toast.success("Reservation rejected, resources freed", {
          position: "top-center",
        })
      )
      .catch((error) =>
        toast.error(
          `Failed to update reservation ${error.response?.data?.message}`,
          { position: "top-center" }
        )
      )
      .finally(() => setRejectLoading(false));
  };

  const tripMetrics = record?.trip_metrics?.map(m => ({
    ...m,
    geometry: m.geometry ? JSON.parse(m.geometry) : null
  })) ?? [];
  
  let totalCost = record?.totals?.totalFuelCost ?? 0;
  let totalRoundCost = record?.totals?.totalFuelCostDoubleTrip ?? 0;

  // Sum all distances
  let totalDistance = tripMetrics.reduce((sum, r) => sum + (r.distance || 0), 0);

  // Sum all durations (assuming duration is in seconds/minutes already)
  let totalDuration = tripMetrics.reduce((sum, r) => sum + (r.duration || 0), 0);

  let geometry = {
    type: "MultiLineString",
    coordinates: tripMetrics
      .map(r => r.geometry?.coordinates)
      .filter(Boolean) // remove nulls
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 h-full"
    >
      {loading ? (
        <div className="grid grid-cols-2 gap-4 h-full w-full">
          <Skeleton className="w-full h-full col-span-2" />
        </div>
      ) : (
        <>
          {/* === Left Side === */}
          <div className="flex flex-col w-1/2 border shadow rounded-md">
            <div className="h-1/12 flex justify-between px-4 py-2">
              <Label className="font-semibold text-2xl">
                RESERVATION {record?.batch_number}
              </Label>
              {record?.status === "Pending" &&
              record?.assignments?.length > 0 ? (
                <div className="flex gap-2 items-center h-full">
                  <Button
                    disabled={approveLoading}
                    size="sm"
                    onClick={handleSave}
                  >
                    {approveLoading ? "Submitting" : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={rejectLoading}
                    size="sm"
                    onClick={handleReject}
                  >
                    {rejectLoading ? "Submitting" : "Reject"}
                  </Button>
                </div>
              ) : (
                <span className="border rounded-full py-0 px-3 flex items-center">
                  {record?.status}
                </span>
              )}
            </div>
            <Separator />

            <div className="flex-1 p-2">
              <Label className="w-full flex justify-between">
                Requested By:{" "}
                <span className="font-medium">{record?.requestor_uuid}</span>
              </Label>

              {/* Date/Time */}
              <div className="my-4 w-full">
                <Label className="font-semibold">Date and Time</Label>
                <Separator className="my-1" />
                <Label className="w-full flex justify-between">
                  Start:{" "}
                  <span className="font-medium">{record?.start_date}</span>
                </Label>
                <Label className="w-full flex justify-between">
                  End: <span className="font-medium">{record?.end_date}</span>
                </Label>
              </div>

              {/* Trip Routes */}
              <div className="my-4 w-full">
                <Label className="font-semibold">Trip Routes</Label>
                <Separator className="my-1" />
                <div className="flex flex-col gap-2 w-full">
                  {record?.trip_routes?.length > 0 ? (
                    record.trip_routes.map((r, idx) => (
                      <div key={r.id} className="flex flex-col">
                        <Label className="flex justify-between">
                          <span>Route {idx + 1}</span>
                        </Label>
                        <Label className="text-sm text-gray-600">
                          From:{" "}
                          <span className="font-medium">{r.start_address}</span>
                        </Label>
                        <Label className="text-sm text-gray-600">
                          To:{" "}
                          <span className="font-medium">{r.end_address}</span>
                        </Label>
                      </div>
                    ))
                  ) : (
                    <Label className="text-gray-500">
                      No trip routes available
                    </Label>
                  )}
                </div>
              </div>

              {/* Vehicles & Drivers */}
              <div className="my-4 w-full">
                <Label className="font-semibold">Vehicles and Drivers</Label>
                <Separator className="my-1" />
                {record?.assignments?.map((d, i) => (
                  <div key={i} className="flex justify-end h-48">
                    <div className="w-full h-full flex-1">
                      <img
                        src={d.image_url}
                        className="w-full h-full object-cover rounded-md"
                        alt="Vehicle"
                        loading="lazy"
                      />
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-1 flex-col p-2 gap-2">
                      <div className="flex justify-between">
                        <Label>Type: {d.type}</Label>
                        <Label>{d.vehicle_status}</Label>
                      </div>
                      <Label>Capacity: {d.capacity}</Label>
                      {record.status === "Cancelled" ? null : d.driver_name ? (
                        <Label>Driver: {d.driver_name}</Label>
                      ) : (
                        <DriverSelect
                          assignments={assignments}
                          onSelect={(driver) =>
                            handleAssign(d.vehicle_id, driver.uuid)
                          }
                          defaultValue={d.driver_name}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === Right Side === */}
          <div className="flex flex-col w-1/2 h-full gap-3">
            <div className="flex flex-1 w-full gap-2">
              <Card className="flex-1 rounded-md">
                <CardHeader>
                  <CardTitle>Estimated Cost</CardTitle>
                  <CardDescription>Pre-trip estimated cost</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label className="text-xl text-gray-500">
                    Philippine Peso
                  </Label>
                  <Label className="text-3xl font-semibold">{totalCost}</Label>
                </CardContent>
              </Card>
              <Card className="flex-1 rounded-md">
                <CardHeader>
                  <CardTitle>Travel Distance</CardTitle>
                  <CardDescription>Total distance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label className="text-xl text-gray-500">Kilometer</Label>
                  <Label className="text-3xl font-semibold">
                    {totalDistance}
                  </Label>
                </CardContent>
              </Card>
              <Card className="flex-1 rounded-md">
                <CardHeader>
                  <CardTitle>Travel Duration</CardTitle>
                  <CardDescription>Total duration</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label className="text-xl text-gray-500">Minutes</Label>
                  <Label className="text-3xl font-semibold">
                    {totalDuration}
                  </Label>
                </CardContent>
              </Card>
            </div>

            {/* Multi-stop Map */}
            {record?.trip_routes?.length >= 1 && (
              <div className="flex-2 rounded-md">
                <Map
                  className="w-full h-full relative overflow-hidden"
                  key={record.trip_routes.map((r) => r.id).join("|")}
                  stops={record.trip_routes.flatMap((r) => [
                    [r.start_longitude, r.start_latitude],
                    [r.end_longitude, r.end_latitude],
                  ])}
                  geometry={geometry}
                />
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

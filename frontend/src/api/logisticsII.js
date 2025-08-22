import { configureEcho } from "@laravel/echo-react"
import Echo from "laravel-echo";


//here lies config for logistics II backend
const echoConfig = {
    wsPort: 6061,
    wssPort: 6061,
    broadcaster: "reverb",
    key: "luoioknoyyzonvz8gf6o",
    wsHost: "localhost",
    forceTLS: window.location.protocol === "https:",
    enabledTransports: ["ws", "wss"],
};

const backendPort = 8092;
const backendUri = `http://localhost:${backendPort}`;

export const logisticsII = {
    reverb: {
        ...echoConfig,
        config: ()=>configureEcho(echoConfig)
    },

    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            vehicles: `${backendUri}/api/vehicles`,
            vehiclesAll: `${backendUri}/api/vehicles/all`,
            register: `${backendUri}/api/vehicles/register`,
            update: `${backendUri}/api/vehicles/change`,
            reservations: `${backendUri}/api/reserve`,
            makeReservations: `${backendUri}/api/reserve/submit`,
            approveReservation: `${backendUri}/api/reserve/approve`,
            cancelReservation: `${backendUri}/api/reserve/cancel`,
            drivers: `${backendUri}/api/drivers`,
        },
    }
}
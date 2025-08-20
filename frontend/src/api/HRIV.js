import { configureEcho } from "@laravel/echo-react"


const echoConfig = {
    wsPort: 8080,
    wssPort: 8080,
    broadcaster: "reverb",
    key: "luoioknoyyzonvz8gf6o",
    wsHost: "localhost",
    forceTLS: window.location.protocol === "https:",
    enabledTransports: ["ws", "wss"],
};

const backendPort = 8099;
const backendUri = `http://localhost:${backendPort}`;

export const HRIV = {
    reverb: {
        ...echoConfig,
        config: ()=>configureEcho(echoConfig),
    },

    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            vehicles: `${backendUri}/api/vehicles`,
            register: `${backendUri}/api/vehicles/register`,
            update: `${backendUri}/api/vehicles/change`,
        },
    }
}
import { configureEcho } from "@laravel/echo-react"


//here lies config for hr3 backend
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

export const hr3 = {
    reverb: {
        ...echoConfig,
        config: ()=>configureEcho(echoConfig),
    },

    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            attendance: `${backendUri}/api/attendance`,
            employees: `${backendUri}/api/employees`
        },
    }
}
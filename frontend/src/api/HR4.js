import { configureEcho } from "@laravel/echo-react"


const echoConfig = {
    wsPort: 6001,
    wssPort: 6001,
    broadcaster: "reverb",
    key: "luoioknoyyzonvz8gf6o",
    wsHost: "localhost",
    forceTLS: false,
    enabledTransports: ["ws", "wss"],
};

const backendPort = 8099;
const backendUri = `http://localhost:${backendPort}`;

export const HR4 = {
    reverb: {
        ...echoConfig,
        config: () => configureEcho(echoConfig),
    },

    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            employees: `${backendUri}/api/employees`,
            allEmployees: `${backendUri}/api/employees/all`,
            searchEmployees: `${backendUri}/api/employees/search`,
            register: `${backendUri}/api/employees/register`,
            update: (id) => `${backendUri}/api/employees/update/${id}`,

            /* jobs endpoints */
            jobs: `${backendUri}/api/jobs`,
            searchjobs: `${backendUri}/api/jobs/search`,

            /* NEW payroll endpoints */
            payroll: {
                list: `${backendUri}/api/payroll`,
                all: `${backendUri}/api/payroll/all`,
                show: (id) => `${backendUri}/api/payroll/${id}`,
                calculate: `${backendUri}/api/payroll/calculate`,
                process: (id) => `${backendUri}/api/payroll/${id}/process`,
                delete: (id) => `${backendUri}/api/payroll/${id}`,
               },
            },
        }
    }
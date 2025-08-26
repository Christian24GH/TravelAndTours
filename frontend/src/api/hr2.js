const backendPort = 8091;
const backendUri = `http://localhost:${backendPort}`;

export const hr2 = {
    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            // Competency Management
            competencyIndex: `${backendUri}/api/competency`,
            workProgress: `${backendUri}/api/work-progress`,
            awards: `${backendUri}/api/self/awards`,
            // Learning Management
            learningIndex: `${backendUri}/api/learning`,
            // Succession Planning
            successionIndex: `${backendUri}/api/succession`,
            // Training Management
            trainingIndex: `${backendUri}/api/training`,
        },
        ess: {
            // ESS
            profile: `${backendUri}/api/employees`, // for GET/patch by id: /api/employees/{id}
            leaveRequests: `${backendUri}/api/ess/leave-requests`,
            payslips: `${backendUri}/api/ess/payslips`,
            attendance: `${backendUri}/api/ess/attendance`,
            updateProfile: `${backendUri}/api/employees`, // for PATCH by id: /api/employees/{id}
        }
    }
};
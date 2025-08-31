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
            me: `${backendUri}/api/me`,
			// Learning Management
			learningIndex: `${backendUri}/api/learning`,
			courses: `${backendUri}/api/learning/courses`,
            // Succession Planning
            successionIndex: `${backendUri}/api/succession`,
            successionCandidates: `${backendUri}/api/succession-candidates`,
            // Training Management
            trainingIndex: `${backendUri}/api/training`,
            trainingsAvailable: `${backendUri}/api/trainings/available`,
            trainingsDone: `${backendUri}/api/trainings/done`,
        },
        ess: {
            createAccount: `${backendUri}/api/register`,
            leaveRequests: `${backendUri}/api/ess/leave-requests`,
            payslips: `${backendUri}/api/ess/payslips`,
            attendance: `${backendUri}/api/ess/attendance`,
            profile: `${backendUri}/api/ess/profile`,
        }
    }
};
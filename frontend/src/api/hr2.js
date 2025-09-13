import { Store } from "lucide-react";

const backendPort = 8093;
const backendUri = `http://localhost:${backendPort}`;

export const hr2 = {
    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            // Competency Management
            competencyIndex: `${backendUri}/api/competency`,
            competencyStore: `${backendUri}/api/competency`,
            // Learning Management
            learningIndex: `${backendUri}/api/learning`,
            learningCourses: `${backendUri}/api/learning`,
            learningStore: `${backendUri}/api/learning`,
            learningUpdate: `${backendUri}/api/learning/`, // use as `${learningUpdate}${id}` for PUT
            learningDelete: `${backendUri}/api/learning/`, // use as `${learningDelete}${id}` for DELETE
            quiz: `${backendUri}/api/learning/`, // use as `${quiz}${id}/quiz` for GET
            learningQuizResult: `${backendUri}/api/learning/quiz-result`,
            // Succession Planning
            successionIndex: `${backendUri}/api/succession`,
            successionCandidates: `${backendUri}/api/succession/candidates`,
            // Training Management
            trainingIndex: `${backendUri}/api/training`,
            trainingStore: `${backendUri}/api/training`,
            trainingUpdate: `${backendUri}/api/training/`, // use as `${trainingUpdate}${id}` for PUT
            trainingDelete: `${backendUri}/api/training/`, // use as `${trainingDelete}${id}` for DELETE
            trainingCreate: `${backendUri}/api/training`,
            // Employee Self Service
            employeesIndex: `${backendUri}/api/employees`,
            employeeShow: `${backendUri}/api/employees/`, // use as `${employeeShow}${id}`
            employeeCreate: `${backendUri}/api/employees`,
            employeeUpdate: `${backendUri}/api/employees/`, // use as `${employeeUpdate}${id}`
            employeeDelete: `${backendUri}/api/employees/`, // use as `${employeeDelete}${id}`
            leaveRequests: `${backendUri}/api/leave-requests`,
            // CSRF Token
            csrfToken: `${backendUri}/api/csrf-token`,
        },
        ess: {
            createAccount: `${backendUri}/api/register`,
            leaveRequests: `${backendUri}/api/ess/leave-requests`,
            payslips: `${backendUri}/api/ess/payslips`,
            attendance: `${backendUri}/api/ess/attendance`,
            profile: `${backendUri}/api/employees`,
        }
    }
};

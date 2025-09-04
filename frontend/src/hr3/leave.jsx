import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getEventStyle = (event) => {
  switch (event.type.toLowerCase().split(' ')[0]) {
    case 'vacation':
      return { backgroundColor: '#22C55E', color: 'white' };
    case 'sick':
      return { backgroundColor: '#EF4444', color: 'white' };
    case 'emergency':
      return { backgroundColor: '#F59E0B', color: 'white' };
    default:
      return { backgroundColor: '#3B82F6', color: 'white' };
  }
};

// Dummy Data
const dummyLeaveRequests = [
  { id: 1, employee: "John Doe", type: "Sick Leave", startDate: "2025-09-03", endDate: "2025-09-04", reason: "Medical appointment", status: "Pending" },
  { id: 2, employee: "Jane Smith", type: "Vacation Leave", startDate: "2025-09-10", endDate: "2025-09-15", reason: "Family vacation", status: "Approved" },
  { id: 3, employee: "Alice Johnson", type: "Emergency Leave", startDate: "2025-09-20", endDate: "2025-09-21", reason: "Family emergency", status: "Approved" },
  { id: 4, employee: "Bob Wilson", type: "Vacation Leave", startDate: "2025-09-25", endDate: "2025-09-30", reason: "Summer vacation", status: "Approved" }
];

const dummyLeaveBalances = [
  { id: 1, employee: "John Doe", vacation: { total: 15, used: 5, remaining: 10 }, sick: { total: 10, used: 5, remaining: 5 }, emergency: { total: 3, used: 1, remaining: 2 } },
  { id: 2, employee: "Jane Smith", vacation: { total: 15, used: 0, remaining: 15 }, sick: { total: 10, used: 7, remaining: 3 }, emergency: { total: 3, used: 2, remaining: 1 } },
  { id: 3, employee: "Alice Johnson", vacation: { total: 15, used: 5, remaining: 10 }, sick: { total: 10, used: 3, remaining: 7 }, emergency: { total: 3, used: 0, remaining: 3 } },
  { id: 4, employee: "Bob Wilson", vacation: { total: 15, used: 10, remaining: 5 }, sick: { total: 10, used: 2, remaining: 8 }, emergency: { total: 3, used: 1, remaining: 2 } }
];

// AI Analysis Helper
const analyzeLeaveRequest = (reason) => {
  const keywords = {
    sick: ['sick', 'fever', 'hospital', 'medical', 'doctor', 'illness', 'health'],
    vacation: ['vacation', 'holiday', 'trip', 'travel', 'family', 'rest'],
    emergency: ['emergency', 'urgent', 'death', 'accident', 'crisis']
  };

  reason = reason.toLowerCase();
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => reason.includes(word))) {
      return {
        type: `${type.charAt(0).toUpperCase() + type.slice(1)} Leave`,
        recommendation: 'Approved',
        confidence: 0.85,
        analysis: `Request appears to be a valid ${type} leave based on the provided reason.`
      };
    }
  }

  return {
    type: 'Unspecified Leave',
    recommendation: 'Review Required',
    confidence: 0.5,
    analysis: 'Unable to determine leave type from reason. Manual review recommended.'
  };
};

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useState(dummyLeaveRequests);
  const [leaveBalances, setLeaveBalances] = useState(dummyLeaveBalances);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [calendarView, setCalendarView] = useState('month');

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAiAnalysis(analyzeLeaveRequest(request.reason));
    setIsDialogOpen(true);
  };

  const handleApprove = (requestId) => {
    const request = leaveRequests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequests = leaveRequests.map(req =>
      req.id === requestId ? { ...req, status: "Approved" } : req
    );

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const updatedBalances = leaveBalances.map(balance => {
      if (balance.employee === request.employee) {
        const type = request.type.toLowerCase().split(' ')[0];
        const currentBalance = balance[type];
        if (currentBalance.remaining < durationInDays) {
          alert(`Insufficient ${type} leave balance for ${request.employee}`);
          return balance;
        }
        return {
          ...balance,
          [type]: {
            ...currentBalance,
            used: currentBalance.used + durationInDays,
            remaining: currentBalance.remaining - durationInDays
          }
        };
      }
      return balance;
    });

    setLeaveRequests(updatedRequests);
    setLeaveBalances(updatedBalances);
  };

  const handleReject = (requestId) => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === requestId ? { ...req, status: "Rejected" } : req
    ));
  };

  const getCalendarEvents = () => {
    return leaveRequests
      .filter(leave => leave.status === "Approved")
      .map(leave => ({
        id: leave.id,
        title: `${leave.employee} - ${leave.type}`,
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
        type: leave.type,
        employee: leave.employee,
        reason: leave.reason,
        status: leave.status
      }));
  };

  const handleEventSelect = (event) => {
    const request = leaveRequests.find(req => req.id === event.id);
    if (request) {
      handleViewRequest(request);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          AI Leave Processing & Shift Scheduling using spaCy NLP
        </p>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
        </TabsList>

        {/* Requests */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.employee}</TableCell>
                      <TableCell>{req.type}</TableCell>
                      <TableCell>{format(new Date(req.startDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(req.endDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewRequest(req)}>View</Button>
                        <Button variant="default" size="sm" onClick={() => handleApprove(req.id)} disabled={req.status !== "Pending"}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(req.id)} disabled={req.status !== "Pending"}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balances */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardContent className="pt-6"></CardContent>
            <h2 className="text-xl font-bold mt-8 mb-4">Leave Balances</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell className="text-center" colSpan={3}>Vacation Leave</TableCell>
                  <TableCell className="text-center" colSpan={3}>Sick Leave</TableCell>
                  <TableCell className="text-center" colSpan={3}>Emergency Leave</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Used</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Used</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Used</TableCell>
                  <TableCell>Remaining</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>{balance.employee}</TableCell>
                    <TableCell>{balance.vacation.total}</TableCell>
                    <TableCell>{balance.vacation.used}</TableCell>
                    <TableCell className={balance.vacation.remaining < 5 ? 'text-red-500 font-medium' : ''}>{balance.vacation.remaining}</TableCell>
                    <TableCell>{balance.sick.total}</TableCell>
                    <TableCell>{balance.sick.used}</TableCell>
                    <TableCell className={balance.sick.remaining < 3 ? 'text-red-500 font-medium' : ''}>{balance.sick.remaining}</TableCell>
                    <TableCell>{balance.emergency.total}</TableCell>
                    <TableCell>{balance.emergency.used}</TableCell>
                    <TableCell className={balance.emergency.remaining < 2 ? 'text-red-500 font-medium' : ''}>{balance.emergency.remaining}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="pt-6"></CardContent>
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Leave Calendar</h2>
              <div className="h-[400px] bg-white rounded-lg shadow p-4">
                <Calendar
                  localizer={localizer}
                  events={getCalendarEvents()}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day']}
                  view={calendarView}
                  onView={(view) => setCalendarView(view)}
                  eventPropGetter={event => ({
                    className: '',
                    style: { ...getEventStyle(event), borderRadius: '4px', border: 'none', fontWeight: '500' }
                  })}
                  onSelectEvent={handleEventSelect}
                  tooltipAccessor={event => `${event.employee}\n${event.type}\n${event.reason}`}
                  popup
                  defaultDate={new Date(2025, 8, 1)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              AI-assisted leave request analysis
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Existing request details */}
                <div>
                  <label className="font-bold">Employee</label>
                  <p>{selectedRequest.employee}</p>
                </div>
                <div> 
                  <label className="font-bold">Leave Type</label> 
                  <p>{selectedRequest.type}</p> 
                </div> 
                <div> 
                  <label className="font-bold">Start Date</label> 
                  <p>{format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')}</p> 
                </div> 
                <div> 
                  <label className="font-bold">End Date</label> 
                  <p>{format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}</p> 
                </div> 
                <div className="col-span-2"> 
                  <label className="font-bold">Reason</label> 
                  <p>{selectedRequest.reason}</p> 
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                <h3 className="font-bold text-lg">AI Analysis</h3>
                {aiAnalysis && (
                  <>
                    <div>
                      <label className="font-bold text-sm">Detected Leave Type</label>
                      <p className="text-blue-600">{aiAnalysis.type}</p>
                    </div>
                    <div>
                      <label className="font-bold text-sm">Recommendation</label>
                      <p className={aiAnalysis.recommendation === 'Approved' ? 
                        'text-green-600' : 'text-yellow-600'}>
                        {aiAnalysis.recommendation}
                      </p>
                    </div>
                    <div>
                      <label className="font-bold text-sm">Confidence Score</label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${aiAnalysis.confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {(aiAnalysis.confidence * 100).toFixed(0)}% confident
                      </p>
                    </div>
                    <div>
                      <label className="font-bold text-sm">Analysis</label>
                      <p className="text-sm text-gray-600">{aiAnalysis.analysis}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );  
}
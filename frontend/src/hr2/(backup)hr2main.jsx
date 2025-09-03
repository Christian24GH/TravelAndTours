// This file has been removed. All HR2 system logic is now split into separate files.

// The file is no longer needed and has been deleted.
import ProtectedLayout from "@/layout/ProtectedLayout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { hr2 } from "@/api/hr2";
import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Helmet } from 'react-helmet-async';

const formatPercent = (value) =>
  value === undefined || value === null ? "-" : `${value}%`;

const buildInsight = (emp) => {
  const tech = emp.technical_skill ?? 0;
  const safe = emp.safety_skill ?? 0;
  const lead = emp.leadership_skill ?? 0;
  const overall = emp.overall_score ?? Math.round((tech + safe + lead) / 3);
  const notes = [];
  if (overall >= 70) notes.push("Ready for higher-responsibility tasks");
  if (tech < 50) notes.push("Prioritize technical training");
  if (safe < 50) notes.push("Schedule safety refresher");
  if (lead < 50) notes.push("Add leadership coaching/mentorship");
  if (notes.length === 0) notes.push("Balanced skillset; maintain workload");
  return notes.join(" • ");
};

function CmsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Only show 'Travel and Tours' department
  const [departmentFilter, setDepartmentFilter] = useState("Travel and Tours");
  const [sortBy, setSortBy] = useState("employee_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [workProgress, setWorkProgress] = useState([]);
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    let cancelled = false;
    function getEmployeeId() {
      const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user?.employee_id || user?.employeeID || user?.id;
    }
    const fetchData = async () => {
      try {
        const employeeId = getEmployeeId();
        if (!employeeId) throw new Error('Not authenticated. Please log in.');
        if (cancelled) return;

        // 1. Competency Management: Fetch all employees (with competencies)
        const empRes = await fetch(hr2.backend.ess.profile, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (empRes.url.endsWith('/login') || empRes.status === 401) throw new Error('Not authenticated. Please log in.');
        if (!empRes.ok) throw new Error(`Request failed: ${empRes.status}`);
        const empData = await empRes.json();
        const normalizeEmployee = (emp) => ({
          id: emp.id || emp.employee_id || emp.employeeID,
          first_name: emp.first_name || emp.firstname || '',
          last_name: emp.last_name || emp.lastname || '',
          department: emp.department || emp.dept || '',
          employee_name: emp.employee_name || emp.name || `${emp.first_name || emp.firstname || ''} ${emp.last_name || emp.lastname || ''}`.trim(),
          technical_skill: emp.technical_skill ?? emp.technicalSkill ?? null,
          safety_skill: emp.safety_skill ?? emp.safetySkill ?? null,
          leadership_skill: emp.leadership_skill ?? emp.leadershipSkill ?? null,
          overall_score: emp.overall_score ?? emp.overallScore ?? null,
          task_ai_insight: emp.task_ai_insight ?? emp.insight ?? '',
        });
        setEmployees(Array.isArray(empData) ? empData.map(normalizeEmployee) : []);

        // 2. Work Progress (Learning Management):
        const wp = await fetch(hr2.backend.api.workProgress + `?employee_id=${employeeId}`, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (wp.url.endsWith('/login') || wp.status === 401) throw new Error('Not authenticated. Please log in.');
        if (wp.status === 404) setWorkProgress([]);
        else if (wp.ok) setWorkProgress(await wp.json());

        // 3. Awards (Training Management):
        const aw = await fetch(hr2.backend.api.awards + `?employee_id=${employeeId}`, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (aw.url.endsWith('/login') || aw.status === 401) throw new Error('Not authenticated. Please log in.');
        if (aw.status === 404) setAwards([]);
        else if (aw.ok) setAwards(await aw.json());
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Only allow filtering for 'Travel and Tours' (future: could allow more)
  const availableDepartments = useMemo(() => {
    return ["Travel and Tours"];
  }, []);

  // Filter only 'Travel and Tours' employees, search, sort, and paginate
  const processedRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = employees.filter((emp) => {
      const departmentName = (emp.department && String(emp.department).trim()) || "Unassigned";
      if (departmentName !== "Travel and Tours") return false;
      if (!normalizedQuery) return true;
      const name = (emp.employee_name || `${emp.first_name || ""} ${emp.last_name || ""}`).toLowerCase();
      const idText = String(emp.id ?? "");
      return name.includes(normalizedQuery) || idText.includes(normalizedQuery);
    });
    const compare = (a, b, key) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" || typeof bv === "string") return String(av).localeCompare(String(bv));
      return av - bv;
    };
    const withSortKey = filtered.map((emp) => ({
      ...emp,
      employee_name: emp.employee_name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      overall_sort: emp.overall_score ?? Math.round(((emp.technical_skill ?? 0) + (emp.safety_skill ?? 0) + (emp.leadership_skill ?? 0)) / 3),
    }));
    const key = sortBy === "overall" ? "overall_sort" : sortBy;
    const sorted = withSortKey.sort((a, b) => compare(a, b, key));
    if (sortDirection === "desc") sorted.reverse();
    return sorted;
  }, [employees, searchQuery, sortBy, sortDirection]);

  // For large lists, use pagination (pageSize, currentPage)
  const totalItems = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const visibleRows = processedRows.slice(startIndex, startIndex + pageSize);

  const onClickSort = (field) => {
    if (sortBy === field) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Competency Management</h1>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee Overview</CardTitle>
          <CardDescription>View and manage employee competencies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex gap-3 flex-1">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Department</label>
                <select className="border rounded px-3 py-2" value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}>
                  {availableDepartments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col flex-1 min-w-[220px]">
                <label className="text-sm text-gray-600 mb-1">Search</label>
                <Input placeholder="Search by name, ID, or department..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Rows per page</label>
                <select className="border rounded px-3 py-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                  {[10, 20, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>
            {/* Removed Export CSV button as exportCsv is not defined */}
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">Error loading data: {error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('id')}>ID</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('employee_name')}>Employee {sortBy === 'employee_name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('department')}>Department {sortBy === 'department' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('technical_skill')}>Technical Skills {sortBy === 'technical_skill' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('safety_skill')}>Safety Skills {sortBy === 'safety_skill' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('leadership_skill')}>Leadership {sortBy === 'leadership_skill' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => onClickSort('overall')}>Overall {sortBy === 'overall' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead>Task And AI Insight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.length > 0 ? (
                    visibleRows.map((emp) => (
                      <TableRow key={emp.id} className="align-top">
                        <TableCell className="font-mono text-xs text-gray-500">{emp.id}</TableCell>
                        <TableCell className="font-medium">{emp.employee_name || `${emp.first_name || ""} ${emp.last_name || ""}`}</TableCell>
                        <TableCell className="text-gray-700">{emp.department || "-"}</TableCell>
                        <TableCell>{formatPercent(emp.technical_skill)}</TableCell>
                        <TableCell>{formatPercent(emp.safety_skill)}</TableCell>
                        <TableCell>{formatPercent(emp.leadership_skill)}</TableCell>
                        <TableCell className="font-semibold">{formatPercent(emp.overall_score ?? Math.round(((emp.technical_skill ?? 0) + (emp.safety_skill ?? 0) + (emp.leadership_skill ?? 0)) / 3))}</TableCell>
                        <TableCell className="text-gray-700">{emp.task_ai_insight || buildInsight(emp)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-center text-gray-600" colSpan="8">No employees available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between text-sm text-gray-700">
          <div>Page {currentPageSafe} of {totalPages} • {totalItems} items</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPageSafe <= 1}>Previous</Button>
            <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPageSafe >= totalPages}>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {!loading && !error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Work Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workProgress.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.due_date}</TableCell>
                      <TableCell>
                        <div className="w-40 bg-gray-200 rounded">
                          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded" style={{ width: `${row.progress}%` }}>{row.progress}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Awards: Only view, not download */}
      {!loading && !error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awards.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.issued_at}</TableCell>
                      <TableCell>
                        {a.file_url ? <Button variant="outline" size="sm" asChild><a href={a.file_url} target="_blank" rel="noreferrer">View</a></Button> : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && processedRows.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Competency Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedRows.slice(0, 10)} margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employee_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="technical_skill" stroke="#8884d8" name="Technical Skill" />
                <Line type="monotone" dataKey="safety_skill" stroke="#82ca9d" name="Safety Skill" />
                <Line type="monotone" dataKey="leadership_skill" stroke="#ffc658" name="Leadership Skill" />
                <Line type="monotone" dataKey="overall_score" stroke="#ff7300" name="Overall Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function LmsSection() {
  // Assessment modal state
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentCourse, setAssessmentCourse] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentScore, setAssessmentScore] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Only show courses for the logged-in user (no employee list)
  // Detect HR2 Admin role
  const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = user?.role === 'HR2 Admin' || user?.roles?.includes('HR2 Admin');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  // Sort by most recent (assume items have a 'due_at' or 'completed_at' field)
  const sortedItems = [...items].sort((a, b) => {
    // Use due_at for To Do/Overdue, completed_at for Completed
    const dateA = new Date(a.completed_at || a.due_at || 0);
    const dateB = new Date(b.completed_at || b.due_at || 0);
    return dateB - dateA;
  });
  const grouped = {
    todo: sortedItems.filter(i => i.status === "To Do"),
    overdue: sortedItems.filter(i => i.status === "Overdue"),
    completed: sortedItems.filter(i => i.status === "Completed"),
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(hr2.backend.api.learningIndex, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Normalize learning items if needed
        setItems(Array.isArray(data) ? data.map(i => ({
          ...i,
          course: i.course || i.title || '',
          progress_pct: i.progress_pct ?? i.progress ?? 0,
          due_at: i.due_at || i.dueDate || '',
          completed_at: i.completed_at || i.completedDate || '',
          score: i.score ?? null,
        })) : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Learning Management</h1>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Show To Do and Overdue side by side, Completed below */}
      {!loading && !error && (
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course To Do */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course To Do</CardTitle>
                {isAdmin && (
                  <Button size="sm" onClick={() => setShowUpload(true)}>Upload Course/Video</Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grouped.todo.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.course}</TableCell>
                          <TableCell>
                            <div className="w-40 bg-gray-200 rounded">
                              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded" style={{ width: `${row.progress_pct ?? 0}%` }}>{row.progress_pct ?? 0}%</div>
                            </div>
                          </TableCell>
                          <TableCell>{row.due_at}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={async () => {
                                setAssessmentCourse(row);
                                setAssessmentLoading(true);
                                setAssessmentError(null);
                                setShowAssessment(true);
                                try {
                                  // Simulate AI-generated questions (replace with API call if available)
                                  const questions = Array.from({ length: 5 + Math.floor(Math.random() * 6) }, (_, i) => ({
                                    id: i + 1,
                                    text: `Q${i + 1}. \"${row.course}\"?`,
                                    options: ["A", "B", "C", "D"],
                                    answer: "A"
                                  }));
                                  setAssessmentQuestions(questions);
                                  setAssessmentAnswers({});
                                } catch (err) {
                                  setAssessmentError("Failed to load assessment.");
                                } finally {
                                  setAssessmentLoading(false);
                                }
                              }}>Assessment</Button>
                              {isAdmin && row.uploaded_by_admin && (
                                <Button size="sm" variant="destructive" onClick={async () => {
                                  // TODO: Implement actual delete logic (API endpoint)
                                  // Example: await deleteCourseApi(row.id)
                                  alert(`Delete course: ${row.course}`);
                                }}>Delete</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
      {/* Assessment Modal */}
      <Dialog open={showAssessment} onOpenChange={(open) => {
        setShowAssessment(open);
        if (!open) {
          setAssessmentCourse(null);
          setAssessmentQuestions([]);
          setAssessmentAnswers({});
          setAssessmentScore(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assessment: {assessmentCourse?.course}</DialogTitle>
          </DialogHeader>
          {assessmentLoading ? (
            <div>Loading questions...</div>
          ) : assessmentScore !== null ? (
            <div>
              <div className="text-lg font-bold mb-2">Your Score: {assessmentScore} / {assessmentQuestions.length}</div>
              <Button onClick={() => setShowAssessment(false)}>Close</Button>
            </div>
          ) : assessmentQuestions.length > 0 ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              // Calculate score
              let score = 0;
              assessmentQuestions.forEach(q => {
                if (assessmentAnswers[q.id] === q.answer) score++;
              });
              setAssessmentScore(score);
              // TODO: Send score to backend for storage and integration
              // Example: await fetch('/api/assessment/submit', { method: 'POST', body: JSON.stringify({ courseId: assessmentCourse.id, score }) })
            }} className="flex flex-col gap-4 mt-2">
              {assessmentQuestions.map(q => (
                <div key={q.id} className="mb-2">
                  <div className="font-medium mb-1">{q.text}</div>
                  <div className="flex gap-2">
                    {q.options.map(opt => (
                      <label key={opt} className="flex items-center gap-1">
                        <input type="radio" name={`q${q.id}`} value={opt} checked={assessmentAnswers[q.id] === opt} onChange={() => setAssessmentAnswers(a => ({ ...a, [q.id]: opt }))} required />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <DialogFooter className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAssessment(false)}>Cancel</Button>
                <Button type="submit">Submit Assessment</Button>
              </DialogFooter>
            </form>
          ) : assessmentError ? (
            <div className="text-red-600">{assessmentError}</div>
          ) : null}
        </DialogContent>
      </Dialog>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Upload Modal */}
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Course or Video</DialogTitle>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUploading(true);
                  setUploadError(null);
                  try {
                    // TODO: Implement actual upload logic (API endpoint)
                    // Example: await uploadCourseApi(uploadFile, uploadTitle)
                    // For now, simulate upload by adding to items state
                    const newCourse = {
                      id: Date.now(),
                      course: uploadTitle,
                      progress_pct: 0,
                      due_at: '',
                      completed_at: '',
                      score: null,
                      status: 'To Do',
                      uploaded_by_admin: true,
                    };
                    setItems(prev => [newCourse, ...prev]);
                    setShowUpload(false);
                    setUploadFile(null);
                    setUploadTitle("");
                  } catch (err) {
                    setUploadError(err.message || "Upload failed");
                  } finally {
                    setUploading(false);
                  }
                }} className="flex flex-col gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File (Video or Course)</label>
                    <Input type="file" accept="video/*,application/pdf" onChange={e => setUploadFile(e.target.files[0])} required />
                  </div>
                  {uploadError && <div className="text-red-600 text-sm">{uploadError}</div>}
                  <DialogFooter className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                    <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {/* Overdue Courses */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Overdue Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grouped.overdue.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.course}</TableCell>
                          <TableCell>
                            <div className="w-40 bg-gray-200 rounded">
                              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded" style={{ width: `${row.progress_pct ?? 0}%` }}>{row.progress_pct ?? 0}%</div>
                            </div>
                          </TableCell>
                          <TableCell>{row.due_at}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Completed Courses below */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Completed On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grouped.completed.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.course}</TableCell>
                        <TableCell>{row.score ?? '-'}</TableCell>
                        <TableCell>{row.completed_at || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

  {/* Removed Course Progress Overview */}
    </>
  );
}

function SpsSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ employee_id: '', role_id: '', readiness_level: '', development_plan: '', timeline_for_readiness: '' });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState(null);
  // Fetch employees for nomination
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmpLoading(true);
        setEmpError(null);
        const res = await fetch(hr2.backend.ess.profile, {
          credentials: 'include',
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const empData = await res.json();
        const normalizeEmployee = (emp) => ({
          id: emp.id || emp.employee_id || emp.employeeID,
          name: emp.employee_name || emp.name || `${emp.first_name || emp.firstname || ''} ${emp.last_name || emp.lastname || ''}`.trim(),
          department: emp.department || emp.dept || '',
          overall_score: emp.overall_score ?? emp.overallScore ?? null,
        });
        setEmployees(Array.isArray(empData) ? empData.map(normalizeEmployee) : []);
      } catch (e) {
        setEmpError(e.message);
      } finally {
        setEmpLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch planned successions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(hr2.backend.api.successionIndex, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Submit new succession plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(hr2.backend.api.successionIndex, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ employee_id: '', role_id: '', readiness_level: '', development_plan: '', timeline_for_readiness: '' });
      // Refresh plans
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Succession Planning</h1>
        <p className="text-gray-600 mt-2">Plan for succession by nominating candidates for key roles and tracking readiness.</p>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Employee List for Nomination */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employee List - Nominate for Succession</CardTitle>
        </CardHeader>
        <CardContent>
          {empLoading && <p>Loading employees...</p>}
          {empError && <p className="text-red-600">{empError}</p>}
          {!empLoading && !empError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.id}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.overall_score ?? '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => { setForm(f => ({ ...f, employee_id: emp.id })); setShowModal(true); }}>Nominate</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Nomination Form Modal using Dialog */}
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) setForm({ employee_id: '', role_id: '', readiness_level: '', development_plan: '', timeline_for_readiness: '' });
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nominate Employee ID: {form.employee_id}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <input type="hidden" name="employee_id" value={form.employee_id} />
            <div>
              <label className="block text-sm font-medium">Role ID</label>
              <input className="border rounded px-3 py-2 w-full" name="role_id" value={form.role_id} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Readiness Level</label>
              <input className="border rounded px-3 py-2 w-full" name="readiness_level" value={form.readiness_level} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Development Plan</label>
              <input className="border rounded px-3 py-2 w-full" name="development_plan" value={form.development_plan} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">Timeline for Readiness</label>
              <input className="border rounded px-3 py-2 w-full" name="timeline_for_readiness" value={form.timeline_for_readiness} onChange={handleChange} />
            </div>
            <DialogFooter className="col-span-2 flex gap-2 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); setForm({ employee_id: '', role_id: '', readiness_level: '', development_plan: '', timeline_for_readiness: '' }); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Nominate'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List of Succession Plans & Readiness Chart */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>List of Succession Plans</CardTitle>
            <CardDescription>What needs to succeed and readiness overview</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chart: Readiness Level per Plan */}
            {plans.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Readiness Level Overview</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={plans.map((p, idx) => ({
                    name: `Emp ${p.employee_id}`,
                    readiness: isNaN(Number(p.readiness_level)) ? 0 : Number(p.readiness_level)
                  }))}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="readiness" fill="#2563eb" name="Readiness Level" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role ID</TableHead>
                    <TableHead>Readiness Level</TableHead>
                    <TableHead>Development Plan</TableHead>
                    <TableHead>Timeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.employee_id}</TableCell>
                      <TableCell>{p.role_id}</TableCell>
                      <TableCell>{p.readiness_level}</TableCell>
                      <TableCell>{p.development_plan}</TableCell>
                      <TableCell>{p.timeline_for_readiness}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  ); 
}

function TmsSection() {
  const [data, setData] = useState({ trainings: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch available trainings and done trainings for the logged-in user
        const availableRes = await fetch(hr2.backend.api.trainingsAvailable, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        const doneRes = await fetch(hr2.backend.api.trainingsDone, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (!availableRes.ok || !doneRes.ok) throw new Error('Failed to load trainings');
        const trainings = await availableRes.json();
        const done = await doneRes.json();
        // Normalize trainings
        const normalizeTraining = t => ({
          ...t,
          trainingID: t.trainingID || t.id,
          title: t.title || t.training_name || '',
          trainer: t.trainer || t.instructor || '',
          completionDATE: t.completionDATE || t.completed_at || '',
        });
        setData({
          trainings: Array.isArray(trainings) ? trainings.map(normalizeTraining) : [],
          done: Array.isArray(done) ? done.map(normalizeTraining) : [],
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Training Management</h1>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-6">
          {/* Available Trainings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Available Trainings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Training Name</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Apply</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.trainings.map((t) => (
                      <TableRow key={t.trainingID || t.id}>
                        <TableCell>{t.trainingID || t.id}</TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.trainer || t.instructor}</TableCell>
                        <TableCell>
                          {t.apply_url ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={t.apply_url} target="_blank" rel="noreferrer">Apply</a>
                            </Button>
                          ) : t.apply_email ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`mailto:${t.apply_email}?subject=Training Application: ${t.title}`}>Email</a>
                            </Button>
                          ) : (
                            <span>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          {/* Done Trainings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Done Trainings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Name</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Completed On</TableHead>
                      <TableHead>File</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.done.map((d) => (
                      <TableRow key={d.trainingID || d.id}>
                        <TableCell>{d.title}</TableCell>
                        <TableCell>{d.trainer || d.instructor}</TableCell>
                        <TableCell>{d.completionDATE || d.completed_at}</TableCell>
                        <TableCell>
                          {d.file_url ? <Button variant="outline" size="sm" asChild><a href={d.file_url} target="_blank" rel="noreferrer">View</a></Button> : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

  {/* Removed Training Duration Distribution */}
    </>
  );
}

export default function Unified() {
  const [activeTab, setActiveTab] = useState('cms');

  const renderSection = () => {
    switch (activeTab) {
      case 'cms':
        return <CmsSection />;
      case 'lms':
        return <LmsSection />;
      case 'sps':
        return <SpsSection />;
      case 'tms':
        return <TmsSection />;
      default:
        return <CmsSection />;
    }
  };

  return (
    <SidebarProvider style={{ '--sidebar-width': '12rem' }}>
      <div className="flex flex-1 min-h-screen bg-gray-100" style={{ height: '100vh' }}>
        {/* Sidebar */}
        <AppSidebar style={{ width: '12rem', minWidth: '12rem', maxWidth: '12rem' }} />
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full m-4 font-semibold">
          <Helmet>
            <title>Talent Development</title>
          </Helmet>
          {/* Top bar with hide sidebar button and title */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10 -m-4">
            <SidebarTrigger />
            <h1 className="text-small tracking-tight text-gray-800">HR Dashboard</h1>
          </div>
          {/* Tabs */}
          <div className="mb-4 pt-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('cms')}
                  className={`${activeTab === 'cms' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Competency Management
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('lms')}
                  className={`${activeTab === 'lms' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Learning Management
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('sps')}
                  className={`${activeTab === 'sps' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Succession Planning
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('tms')}
                  className={`${activeTab === 'tms' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Training Management
                </Button>
              </nav>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
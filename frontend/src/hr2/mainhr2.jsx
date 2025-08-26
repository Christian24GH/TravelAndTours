import ProtectedLayout from "@/layout/ProtectedLayout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { hr2 } from "@/api/hr2";
import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("employee_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [workProgress, setWorkProgress] = useState([]);
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
  const res = await fetch(hr2.backend.api.competencyIndex, {
  credentials: 'include',
  headers: { Accept: "application/json" }
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  setEmployees(Array.isArray(data) ? data : []);

  const wp = await fetch(hr2.backend.api.workProgress + '?employee_id=1');
  const aw = await fetch(hr2.backend.api.awards + '?employee_id=1');
  if (wp.ok) setWorkProgress(await wp.json());
  if (aw.ok) setAwards(await aw.json());
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableDepartments = useMemo(() => {
    const names = new Set(
      employees.map((e) => (e.department && String(e.department).trim()) || "Unassigned")
    );
    return ["All", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [employees]);

  const processedRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = employees.filter((emp) => {
      const departmentName = (emp.department && String(emp.department).trim()) || "Unassigned";
      const matchesDept = departmentFilter === "All" || departmentName === departmentFilter;
      if (!matchesDept) return false;
      if (!normalizedQuery) return true;
      const name = (emp.employee_name || `${emp.first_name || ""} ${emp.last_name || ""}`).toLowerCase();
      const idText = String(emp.id ?? "");
      const deptText = departmentName.toLowerCase();
      return name.includes(normalizedQuery) || idText.includes(normalizedQuery) || deptText.includes(normalizedQuery);
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
  }, [employees, searchQuery, departmentFilter, sortBy, sortDirection]);

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

  const exportCsv = () => {
    const headers = ["ID", "Employee", "Department", "Technical Skills", "Safety Skills", "Leadership", "Overall", "Task And AI Insight"];
    const lines = visibleRows.map((emp) => {
      const id = emp.id ?? "";
      const name = (emp.employee_name || `${emp.first_name || ""} ${emp.last_name || ""}`).trim();
      const dept = emp.department || "-";
      const tech = emp.technical_skill ?? "";
      const safe = emp.safety_skill ?? "";
      const lead = emp.leadership_skill ?? "";
      const overall = emp.overall_score ?? Math.round(((emp.technical_skill ?? 0) + (emp.safety_skill ?? 0) + (emp.leadership_skill ?? 0)) / 3);
      const insight = emp.task_ai_insight || "";
      const row = [id, name, dept, tech, safe, lead, overall, insight];
      return row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",");
    });
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "competency_matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
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
            <div className="flex gap-3">
              <Button onClick={exportCsv}>Export CSV</Button>
            </div>
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
                        {a.file_url ? <Button variant="link" asChild><a href={a.file_url} target="_blank" rel="noreferrer">Download</a></Button> : '-'}
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const grouped = {
    todo: items.filter(i=>i.status==="To Do"),
    overdue: items.filter(i=>i.status==="Overdue"),
    completed: items.filter(i=>i.status==="Completed"),
  };

  useEffect(() => {
    const load = async () => {
      try {
  const res = await fetch(hr2.backend.api.learningIndex, {
  credentials: 'include',
  headers: { Accept: "application/json" }});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

      {!loading && !error && (
        <div className="grid gap-6">
          {[
            {key:'todo', title:'Course To Do'},
            {key:'overdue', title:'Overdue Courses'},
            {key:'completed', title:'Completed Courses'},
          ].map(section => (
            <Card key={section.key} className="mt-6">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grouped[section.key].map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.employee_name}</TableCell>
                          <TableCell>{row.course}</TableCell>
                          <TableCell>
                            <div className="w-40 bg-gray-200 rounded">
                              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded" style={{ width: `${row.progress_pct ?? 0}%` }}>{row.progress_pct ?? 0}%</div>
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
          ))}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Course Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'To Do', value: grouped.todo.length },
                { name: 'Overdue', value: grouped.overdue.length },
                { name: 'Completed', value: grouped.completed.length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function SpsSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
  const res = await fetch(hr2.backend.api.successionIndex,{
  credentials: 'include',
  headers: { Accept: "application/json" }
  });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setPlans(await res.json());
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
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Succession Planning</h1>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <Table className="min-w-full border rounded-md">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-left px-4 py-3 border-b">Role</TableHead>
                <TableHead className="text-left px-4 py-3 border-b">Primary Successor</TableHead>
                <TableHead className="text-left px-4 py-3 border-b">Secondary Successor</TableHead>
                <TableHead className="text-left px-4 py-3 border-b">Readiness</TableHead>
                <TableHead className="text-left px-4 py-3 border-b">Skill Gaps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p, idx) => (
                <TableRow key={idx} className="odd:bg-white even:bg-gray-50">
                  <TableCell className="px-4 py-3 border-b">{p.role}</TableCell>
                  <TableCell className="px-4 py-3 border-b">{p.primary_successor}</TableCell>
                  <TableCell className="px-4 py-3 border-b">{p.secondary_successor}</TableCell>
                  <TableCell className="px-4 py-3 border-b">{p.readiness}</TableCell>
                  <TableCell className="px-4 py-3 border-b">{Array.isArray(p.gaps) ? p.gaps.join(', ') : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Readiness Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(plans.reduce((acc, p) => {
                    acc[p.readiness] = (acc[p.readiness] || 0) + 1;
                    return acc;
                  }, {})).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {Object.keys(plans.reduce((acc, p) => {
                    acc[p.readiness] = (acc[p.readiness] || 0) + 1;
                    return acc;
                  }, {})).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function TmsSection() {
  const [data, setData] = useState({ trainings: [], enrollments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
  const res = await fetch(hr2.backend.api.trainingIndex, {
  credentials: 'include',
  headers: { Accept: "application/json" }
  });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
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
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Duration (hrs)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.trainings.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.id}</TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.type}</TableCell>
                        <TableCell>{t.provider}</TableCell>
                        <TableCell>{t.duration_hours}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Employee Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Training ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.enrollments.map((e, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{e.employee_name}</TableCell>
                        <TableCell>{e.training_id}</TableCell>
                        <TableCell>{e.status}</TableCell>
                        <TableCell>{e.due_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && data.trainings.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Training Duration Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(data.trainings.reduce((acc, t) => {
                const duration = t.duration_hours || 0;
                acc[duration] = (acc[duration] || 0) + 1;
                return acc;
              }, {})).map(([name, value]) => ({ name: `${name} hrs`, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Number of Trainings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
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

  // Use the same sidebar width as the old system (16rem)
  return (
    <SidebarProvider style={{ '--sidebar-width': '12rem' }}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <AppSidebar style={{ width: '12rem', minWidth: '12rem', maxWidth: '12rem' }} />
        {/* Main Content */}
  <main className="w-full">
          <Helmet>
            <title>HR Dashboard</title>
          </Helmet>
          {/* Top bar with hide sidebar button and title */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="text-small tracking-tight text-gray-800">HR Dashboard</h1>
          </div>
          {/* Tabs */}
          <div className="mb-4 px-4 pt-4">
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
          {renderSection()}
        </main>
      </div>
    </SidebarProvider>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { hr2 } from "@/api/hr2";

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
}

export default function CompetencyManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

        // Competency Management
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

        // Learning Management
  const wp = await fetch(`${hr2.backend.api.workProgress}?employee_id=${employeeId}`, {
          credentials: 'include',
          headers: { Accept: "application/json" }
        });
        if (wp.url.endsWith('/login') || wp.status === 401) throw new Error('Not authenticated. Please log in.');
        if (wp.status === 404) setWorkProgress([]);
        else if (wp.ok) setWorkProgress(await wp.json());

        // Training Management:
  const aw = await fetch(`${hr2.backend.api.awards}?employee_id=${employeeId}`, {
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

  const availableDepartments = useMemo(() => {
    return ["Travel and Tours"];
  }, []);

  const processedRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = employees.filter((emp) => {
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
      <Helmet>
        <title>Competency Management</title>
      </Helmet>
      
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
                  {[10, 20, 30].map((n) => (<option key={n} value={n}>{n}</option>))}
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

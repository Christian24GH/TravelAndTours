import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { hr2 } from "@/api/hr2";

export default function LearningManagement() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [courses, setCourses] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("title");
	const [sortDirection, setSortDirection] = useState("asc");
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

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

				const res = await fetch(hr2.backend.api.courses + `?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res.url.endsWith('/login') || res.status === 401) throw new Error('Not authenticated. Please log in.');
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = await res.json();
				setCourses(Array.isArray(data) ? data : []);
			} catch (err) {
				if (!cancelled) setError(err.message || "Failed to load data");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		fetchData();
		return () => { cancelled = true; };
	}, []);

	const processedRows = React.useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const filtered = courses.filter((course) => {
			if (!normalizedQuery) return true;
			return (
				(course.title || "").toLowerCase().includes(normalizedQuery) ||
				(course.description || "").toLowerCase().includes(normalizedQuery)
			);
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
		const sorted = filtered.sort((a, b) => compare(a, b, sortBy));
		if (sortDirection === "desc") sorted.reverse();
		return sorted;
	}, [courses, searchQuery, sortBy, sortDirection]);

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
				<h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Learning Management</h1>
			</header>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Courses</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div className="flex gap-3 flex-1">
							<div className="flex flex-col flex-1 min-w-[220px]">
								<label className="text-sm text-gray-600 mb-1">Search</label>
								<Input placeholder="Search by title or description..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
							</div>
							<div className="flex flex-col">
								<label className="text-sm text-gray-600 mb-1">Rows per page</label>
								<select className="border rounded px-3 py-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
									{[10, 20, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
								</select>
							</div>
						</div>
					</div>

					{loading && <p>Loading...</p>}
					{error && <p className="text-red-600">Error loading data: {error}</p>}

					{!loading && !error && (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="cursor-pointer select-none" onClick={() => onClickSort('title')}>Title {sortBy === 'title' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Progress</TableHead>
										<TableHead>Due Date</TableHead>
										<TableHead>View</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									 {visibleRows.length > 0
										 ? visibleRows.map((course) => (
												 <TableRow key={course.id} className="align-top">
													 <TableCell className="font-medium">{course.title}</TableCell>
													 <TableCell className="text-gray-700">{course.description}</TableCell>
													 <TableCell>{course.status}</TableCell>
													 <TableCell>
														 <div className="w-40 bg-gray-200 rounded">
															 <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded" style={{ width: `${course.progress}%` }}>{course.progress}%</div>
														 </div>
													 </TableCell>
													 <TableCell>{course.due_date}</TableCell>
													 <TableCell>
														 <Button variant="outline" size="sm">View</Button>
													 </TableCell>
												 </TableRow>
											 ))
										 : (
												 <TableRow>
													 <TableCell className="text-center text-gray-600" colSpan="6">No courses available.</TableCell>
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
		</>
	);
}

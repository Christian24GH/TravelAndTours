import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { hr2 } from "@/api/hr2";

export default function TrainingManagement() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [trainings, setTrainings] = useState([]);
	const [availableSearchQuery, setAvailableSearchQuery] = useState("");
	const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
	const [completedSearchQuery, setCompletedSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("title");
	const [sortDirection, setSortDirection] = useState("asc");
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [appliedCurrentPage, setAppliedCurrentPage] = useState(1);
	const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
	const [selectedCertificate, setSelectedCertificate] = useState(null);
	const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
	
	// Add Course form state
	const [newCourse, setNewCourse] = useState({
		title: '',
		description: '',
		duration: '',
		type: 'Online'
	});
	const [isCreatingCourse, setIsCreatingCourse] = useState(false);

	// Check if user is HR2 Admin
	const isHR2Admin = () => {
		const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
		return user?.role === 'HR2 Admin' || user?.role === 'hr2_admin' || user?.user_type === 'HR2 Admin';
	};

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

				const res = await fetch(hr2.backend.api.trainingIndex + `?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res.url.endsWith('/login') || res.status === 401) throw new Error('Not authenticated. Please log in.');
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = await res.json();
				setTrainings(Array.isArray(data) ? data : []);
			} catch (err) {
				if (!cancelled) setError(err.message || "Failed to load data");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		fetchData();
		return () => { cancelled = true; };
	}, []);

	// Filter and sort function for each table
	const filterAndSort = (arr, searchQuery) => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const filtered = arr.filter((training) => {
			if (!normalizedQuery) return true;
			return (
				(training.title || "").toLowerCase().includes(normalizedQuery) ||
				(training.description || "").toLowerCase().includes(normalizedQuery)
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
	};

	// Split trainings by status and apply individual filters
	const availableTrainings = filterAndSort(
		trainings.filter(t => t.status === 'available' || !t.status), 
		availableSearchQuery
	);
	const appliedTrainings = filterAndSort(
		trainings.filter(t => t.status === 'applied' || t.status === 'enrolled' || (t.progress > 0 && t.progress < 100)), 
		appliedSearchQuery
	);
	const completedTrainings = filterAndSort(
		trainings.filter(t => t.status === 'completed' || t.progress === 100), 
		completedSearchQuery
	);

	// Pagination function
	const paginate = (arr, page) => {
		const totalItems = arr.length;
		const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
		const currentPageSafe = Math.min(page, totalPages);
		const startIndex = (currentPageSafe - 1) * pageSize;
		const visibleRows = arr.slice(startIndex, startIndex + pageSize);
		return { visibleRows, totalItems, totalPages, currentPageSafe };
	};

	const availablePage = paginate(availableTrainings, currentPage);
	const appliedPage = paginate(appliedTrainings, appliedCurrentPage);
	const completedPage = paginate(completedTrainings, completedCurrentPage);

	// Handle training application
	const handleApply = async (trainingId) => {
		try {
			const res = await fetch(hr2.backend.api.trainingApply, {
				method: 'POST',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'Accept': 'application/json' 
				},
				body: JSON.stringify({ training_id: trainingId })
			});
			
			if (!res.ok) throw new Error('Failed to apply');
			
			// Refresh data
			window.location.reload();
		} catch (err) {
			alert('Failed to apply for training: ' + err.message);
		}
	};

	// Handle add new course
	const handleAddCourse = () => {
		setNewCourse({
			title: '',
			description: '',
			duration: '',
			type: 'Online'
		});
		setShowAddCourseDialog(true);
	};

	// Handle course creation
	const handleCreateCourse = async () => {
		if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.duration.trim()) {
			alert('Please fill in all required fields');
			return;
		}

		setIsCreatingCourse(true);
		try {
			const res = await fetch(hr2.backend.api.trainingCreate, {
				method: 'POST',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'Accept': 'application/json' 
				},
				body: JSON.stringify(newCourse)
			});
			
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || `Failed to create course (${res.status})`);
			}
			
			const result = await res.json();
			alert('Course created successfully!');
			setShowAddCourseDialog(false);
			
			// Refresh data
			window.location.reload();
		} catch (err) {
			alert('Failed to create course: ' + err.message);
		} finally {
			setIsCreatingCourse(false);
		}
	};

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
				<h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Training Management</h1>
			</header>

			{/* Available Courses Table */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Available Courses ({availableTrainings.length})</CardTitle>
						{isHR2Admin() && (
							<Button 
								variant="default" 
								onClick={handleAddCourse}
								className="ml-4"
							>
								Add Course
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div className="flex gap-3 flex-1">
							<div className="flex flex-col flex-1 min-w-[220px]">
								<label className="text-sm text-gray-600 mb-1">Search Available Courses</label>
								<Input placeholder="Search by title or description..." value={availableSearchQuery} onChange={(e) => { setAvailableSearchQuery(e.target.value); setCurrentPage(1); }} />
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
										<TableHead>Title</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{availablePage.visibleRows.length > 0
										? availablePage.visibleRows.map((training) => (
												<TableRow key={training.id} className="align-top">
													<TableCell className="font-medium">{training.title}</TableCell>
													<TableCell className="text-gray-700">{training.description}</TableCell>
													<TableCell>{training.duration || 'N/A'}</TableCell>
													<TableCell>
														<Badge variant="outline">{training.type || 'Online'}</Badge>
													</TableCell>
													<TableCell>
														<Button 
															variant="default" 
															size="sm"
															onClick={() => handleApply(training.id)}
														>
															Apply
														</Button>
													</TableCell>
												</TableRow>
											))
										: (
												<TableRow>
													<TableCell className="text-center text-gray-600" colSpan="5">No available courses.</TableCell>
												</TableRow>
											)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex items-center justify-between text-sm text-gray-700">
					<div>Page {availablePage.currentPageSafe} of {availablePage.totalPages} • {availablePage.totalItems} items</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={availablePage.currentPageSafe <= 1}>Previous</Button>
						<Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(availablePage.totalPages, p + 1))} disabled={availablePage.currentPageSafe >= availablePage.totalPages}>Next</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Applied Courses Table */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>My Applied Courses ({appliedTrainings.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div className="flex gap-3 flex-1">
							<div className="flex flex-col flex-1 min-w-[220px]">
								<label className="text-sm text-gray-600 mb-1">Search Applied Courses</label>
								<Input placeholder="Search by title or description..." value={appliedSearchQuery} onChange={(e) => { setAppliedSearchQuery(e.target.value); setAppliedCurrentPage(1); }} />
							</div>
							<div className="flex flex-col">
								<label className="text-sm text-gray-600 mb-1">Rows per page</label>
								<select className="border rounded px-3 py-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setAppliedCurrentPage(1); }}>
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
										<TableHead>Title</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Progress</TableHead>
										<TableHead>Due Date</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{appliedPage.visibleRows.length > 0
										? appliedPage.visibleRows.map((training) => (
												<TableRow key={training.id} className="align-top">
													<TableCell className="font-medium">{training.title}</TableCell>
													<TableCell className="text-gray-700">{training.description}</TableCell>
													<TableCell>
														<div className="w-40 bg-gray-200 rounded">
															<div className="bg-blue-600 text-white text-xs px-2 py-1 rounded" style={{ width: `${training.progress || 0}%` }}>
																{training.progress || 0}%
															</div>
														</div>
													</TableCell>
													<TableCell>{training.due_date || 'N/A'}</TableCell>
													<TableCell>
														<Button variant="outline" size="sm">Continue</Button>
													</TableCell>
												</TableRow>
											))
										: (
												<TableRow>
													<TableCell className="text-center text-gray-600" colSpan="5">No applied courses.</TableCell>
												</TableRow>
											)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex items-center justify-between text-sm text-gray-700">
					<div>Page {appliedPage.currentPageSafe} of {appliedPage.totalPages} • {appliedPage.totalItems} items</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setAppliedCurrentPage((p) => Math.max(1, p - 1))} disabled={appliedPage.currentPageSafe <= 1}>Previous</Button>
						<Button variant="outline" onClick={() => setAppliedCurrentPage((p) => Math.min(appliedPage.totalPages, p + 1))} disabled={appliedPage.currentPageSafe >= appliedPage.totalPages}>Next</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Completed Courses Table */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Completed Courses ({completedTrainings.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div className="flex gap-3 flex-1">
							<div className="flex flex-col flex-1 min-w-[220px]">
								<label className="text-sm text-gray-600 mb-1">Search Completed Courses</label>
								<Input placeholder="Search by title or description..." value={completedSearchQuery} onChange={(e) => { setCompletedSearchQuery(e.target.value); setCompletedCurrentPage(1); }} />
							</div>
							<div className="flex flex-col">
								<label className="text-sm text-gray-600 mb-1">Rows per page</label>
								<select className="border rounded px-3 py-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCompletedCurrentPage(1); }}>
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
										<TableHead>Title</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Completion Date</TableHead>
										<TableHead>Score</TableHead>
										<TableHead>Certificate</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{completedPage.visibleRows.length > 0
										? completedPage.visibleRows.map((training) => (
												<TableRow key={training.id} className="align-top">
													<TableCell className="font-medium">{training.title}</TableCell>
													<TableCell className="text-gray-700">{training.description}</TableCell>
													<TableCell>{training.completion_date || training.due_date || 'N/A'}</TableCell>
													<TableCell>
														<Badge variant="secondary">{training.score || 'N/A'}%</Badge>
													</TableCell>
													<TableCell>
														<Dialog>
															<DialogTrigger asChild>
																<Button 
																	variant="outline" 
																	size="sm"
																	onClick={() => setSelectedCertificate(training)}
																>
																	View Certificate
																</Button>
															</DialogTrigger>
															<DialogContent className="max-w-2xl">
																<DialogHeader>
																	<DialogTitle>Certificate of Completion</DialogTitle>
																</DialogHeader>
																<div className="text-center border-2 border-gray-300 p-8 bg-gradient-to-b from-blue-50 to-white">
																	<div className="mb-4">
																		<h2 className="text-3xl font-bold text-blue-800 mb-2">Certificate of Completion</h2>
																		<div className="w-20 h-1 bg-blue-600 mx-auto"></div>
																	</div>
																	<p className="text-lg mb-4">This is to certify that</p>
																	<h3 className="text-2xl font-bold mb-4 text-gray-800">
																		{JSON.parse(localStorage.getItem('currentUser') || '{}')?.name || 'Employee Name'}
																	</h3>
																	<p className="text-lg mb-4">has successfully completed the training course</p>
																	<h4 className="text-xl font-semibold mb-6 text-blue-700">{training.title}</h4>
																	<div className="flex justify-between items-end">
																		<div>
																			<p className="text-sm text-gray-600">Completion Date</p>
																			<p className="font-semibold">{training.completion_date || new Date().toLocaleDateString()}</p>
																		</div>
																		<div>
																			<p className="text-sm text-gray-600">Score</p>
																			<p className="font-semibold">{training.score || 'N/A'}%</p>
																		</div>
																	</div>
																</div>
																<div className="flex justify-end mt-4">
																	<Button onClick={() => window.print()}>Print Certificate</Button>
																</div>
															</DialogContent>
														</Dialog>
													</TableCell>
												</TableRow>
											))
										: (
												<TableRow>
													<TableCell className="text-center text-gray-600" colSpan="5">No completed courses.</TableCell>
												</TableRow>
											)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex items-center justify-between text-sm text-gray-700">
					<div>Page {completedPage.currentPageSafe} of {completedPage.totalPages} • {completedPage.totalItems} items</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setCompletedCurrentPage((p) => Math.max(1, p - 1))} disabled={completedPage.currentPageSafe <= 1}>Previous</Button>
						<Button variant="outline" onClick={() => setCompletedCurrentPage((p) => Math.min(completedPage.totalPages, p + 1))} disabled={completedPage.currentPageSafe >= completedPage.totalPages}>Next</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Add Course Dialog - HR2 Admin Only */}
			{isHR2Admin() && (
				<Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Course</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium mb-1 block">Course Title *</label>
								<Input 
									placeholder="Enter course title..." 
									value={newCourse.title}
									onChange={(e) => setNewCourse(prev => ({...prev, title: e.target.value}))}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">Description *</label>
								<Input 
									placeholder="Enter course description..." 
									value={newCourse.description}
									onChange={(e) => setNewCourse(prev => ({...prev, description: e.target.value}))}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">Duration *</label>
								<Input 
									placeholder="e.g., 2 hours, 1 week..." 
									value={newCourse.duration}
									onChange={(e) => setNewCourse(prev => ({...prev, duration: e.target.value}))}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">Type</label>
								<select 
									className="border rounded px-3 py-2 w-full"
									value={newCourse.type}
									onChange={(e) => setNewCourse(prev => ({...prev, type: e.target.value}))}
								>
									<option value="Online">Online</option>
									<option value="In-person">In-person</option>
									<option value="Hybrid">Hybrid</option>
									<option value="Self-paced">Self-paced</option>
								</select>
							</div>
						</div>
						<div className="flex justify-end gap-2 mt-6">
							<Button 
								variant="outline" 
								onClick={() => setShowAddCourseDialog(false)}
								disabled={isCreatingCourse}
							>
								Cancel
							</Button>
							<Button 
								onClick={handleCreateCourse}
								disabled={isCreatingCourse}
							>
								{isCreatingCourse ? 'Creating...' : 'Add Course'}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}

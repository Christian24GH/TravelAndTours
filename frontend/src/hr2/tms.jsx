import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from "react-helmet";
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
	const [completedSearchQuery, setCompletedSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("title");
	const [sortDirection, setSortDirection] = useState("asc");
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
	const [selectedCertificate, setSelectedCertificate] = useState(null);
	const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
	const [showManageDialog, setShowManageDialog] = useState(false);
	const [editingCourse, setEditingCourse] = useState(null);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [appliedCourses, setAppliedCourses] = useState(new Set());
	const [cancellingIds, setCancellingIds] = useState(new Set());
	
	const [newCourse, setNewCourse] = useState({
		title: '',
		description: '',
		durationNumber: '',
		durationUnit: 'Hours',
		type: 'Online'
	});
	const [isCreatingCourse, setIsCreatingCourse] = useState(false);

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

				const res = await fetch(`${hr2.backend.api.trainingIndex}?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res.url.endsWith('/login') || res.status === 401) throw new Error('Not authenticated. Please log in.');
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = await res.json();
				// Map backend fields to frontend expected fields
				const mapped = Array.isArray(data) ? data.map(t => ({
					...t,
					title: t.title ?? t.program_name ?? '',
					description: t.description ?? t.provider ?? '',
					type: t.type ?? t.target_skills ?? '',
				})) : [];
				setTrainings(mapped);
				
				const storedApplied = localStorage.getItem(`appliedCourses_${employeeId}`);
				if (storedApplied) {
					try {
						const arr = JSON.parse(storedApplied);
						setAppliedCourses(new Set((Array.isArray(arr) ? arr : []).map(n => Number(n))));
					} catch (e) {
						setAppliedCourses(new Set());
					}
				}
			} catch (err) {
				if (!cancelled) setError(err.message || "Failed to load data");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		fetchData();
		return () => { cancelled = true; };
	}, []);

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

	const availableTrainings = (() => {
		const filtered = trainings
			.filter(() => true)
			.filter((training) => {
				if (!availableSearchQuery.trim()) return true;
				return (
					(training.title || "").toLowerCase().includes(availableSearchQuery.toLowerCase()) ||
					(training.description || "").toLowerCase().includes(availableSearchQuery.toLowerCase())
				);
			});
		
		const sorted = filtered.sort((a, b) => {
			const aApplied = a.status === 'applied' || appliedCourses.has(Number(a.id));
			const bApplied = b.status === 'applied' || appliedCourses.has(Number(b.id));
			
			if (aApplied && !bApplied) return -1;
			if (!aApplied && bApplied) return 1;
			
			const compare = (a, b, key) => {
				const av = a[key];
				const bv = b[key];
				if (av == null && bv == null) return 0;
				if (av == null) return 1;
				if (bv == null) return -1;
				if (typeof av === "string" || typeof bv === "string") return String(av).localeCompare(String(bv));
				return av - bv;
			};
			
			const result = compare(a, b, sortBy);
			return sortDirection === "desc" ? -result : result;
		});
		
		return sorted;
	})();
	const completedTrainings = filterAndSort(
		trainings.filter(t => t.status === 'completed' || t.progress === 100), 
		completedSearchQuery
	);

	const paginate = (arr, page) => {
		const totalItems = arr.length;
		const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
		const currentPageSafe = Math.min(page, totalPages);
		const startIndex = (currentPageSafe - 1) * pageSize;
		const visibleRows = arr.slice(startIndex, startIndex + pageSize);
		return { visibleRows, totalItems, totalPages, currentPageSafe };
	};

	const availablePage = paginate(availableTrainings, currentPage);
	const completedPage = paginate(completedTrainings, completedCurrentPage);

	const handleApply = async (trainingId) => {
		try {
			const csrfRes = await fetch(hr2.backend.api.csrfToken, {
				credentials: 'include',
				headers: { Accept: "application/json" }
			});
			if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
			const { csrfToken } = await csrfRes.json();

			const res = await fetch(hr2.backend.api.trainingApply, {
				method: 'POST',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrfToken
				},
				body: JSON.stringify({ training_id: trainingId })
			});
			
			if (!res.ok) throw new Error('Failed to apply');
			const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
			const employeeId = user?.employee_id || user?.employeeID || user?.id;
			setAppliedCourses(prev => {
				const newSet = new Set([...prev, trainingId]);
				localStorage.setItem(`appliedCourses_${employeeId}`, JSON.stringify([...newSet]));
				return newSet;
			});
			setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, status: 'applied' } : t));
			try {
				const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
				const employeeId = user?.employee_id || user?.employeeID || user?.id;
				const res2 = await fetch(hr2.backend.api.trainingIndex + `?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res2.ok) {
					const data2 = await res2.json();
						// Map backend fields to frontend expected fields
						const mapped2 = Array.isArray(data2) ? data2.map(t => ({
							...t,
							title: t.title ?? t.program_name ?? '',
							description: t.description ?? t.provider ?? '',
							type: t.type ?? t.target_skills ?? '',
						})) : [];
						setTrainings(mapped2);
				}
			} catch (e) {/* ignore fetch errors */}
			toast.success('Successfully applied for the course!');
		} catch (err) {
			toast.error('Failed to apply for training: ' + err.message);
		}
	};

	const handleCancel = async (trainingIdRaw) => {
		const trainingId = Number(trainingIdRaw);
		if (Number.isNaN(trainingId)) return alert('Invalid training id');

		setCancellingIds(prev => new Set(prev).add(trainingId));
		try {
			const csrfRes = await fetch(hr2.backend.api.csrfToken, {
				credentials: 'include',
				headers: { Accept: "application/json" }
			});
			if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
			const { csrfToken } = await csrfRes.json();

			const res = await fetch(hr2.backend.api.trainingCancel, {
				method: 'PATCH',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrfToken
				},
				body: JSON.stringify({ training_id: trainingId })
			});
			if (!res.ok) {
				let msg = `Request failed: ${res.status}`;
				try {
					const j = await res.json();
					msg = j.message || j.error || JSON.stringify(j);
				} catch (e) {/* ignore parse errors */}
				throw new Error(msg);
			}

			setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, status: 'cancelled' } : t));
			const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
			const employeeId = user?.employee_id || user?.employeeID || user?.id;
			setAppliedCourses(prev => {
				const newSet = new Set([...prev].map(n => Number(n)));
				newSet.delete(trainingId);
				try { localStorage.setItem(`appliedCourses_${employeeId}`, JSON.stringify([...newSet])); } catch (e) {}
				return newSet;
			});
			toast.success('Application cancelled successfully!');
		} catch (err) {
			toast.error('Failed to cancel application: ' + (err.message || err));
		} finally {
			setCancellingIds(prev => {
				const s = new Set(prev);
				s.delete(trainingId);
				return s;
			});
		}
	};

	const handleAddCourse = () => {
		setNewCourse({
			title: '',
			description: '',
			durationNumber: '',
			durationUnit: 'Hours',
			type: 'Online'
		});
		setShowAddCourseDialog(true);
	};

	const handleCreateCourse = async () => {
		if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.durationNumber.trim() || !newCourse.type.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		setIsCreatingCourse(true);
		try {
			const csrfRes = await fetch(hr2.backend.api.csrfToken, {
				credentials: 'include',
				headers: { Accept: "application/json" }
			});
			if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
			const { csrfToken } = await csrfRes.json();

			const res = await fetch(hr2.backend.api.trainingCreate, {
				method: 'POST',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrfToken
				},
				body: JSON.stringify({
					title: newCourse.title,
					description: newCourse.description,
					duration: `${newCourse.durationNumber} ${newCourse.durationUnit}`,
					type: newCourse.type
				})
			});

			if (!res.ok) {
				let errorMsg = `Failed to create course (${res.status})`;
				try {
					const errorData = await res.json();
					if (errorData && (errorData.message || errorData.error)) {
						errorMsg = errorData.message || errorData.error;
					} else if (errorData.errors) {
						errorMsg = Object.values(errorData.errors).flat().join(' ');
					}
				} catch (e) {/* ignore parse errors */}
				toast.error(errorMsg);
				return;
			}

			const result = await res.json();
			console.log('Course created result:', result);
			toast.success('Course created successfully!');
			setShowAddCourseDialog(false);

			// Try to fetch the updated list up to 2 times (in case of backend delay)
			let found = false;
			for (let attempt = 0; attempt < 2; attempt++) {
				try {
					const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
					const employeeId = user?.employee_id || user?.employeeID || user?.id;
					const res2 = await fetch(hr2.backend.api.trainingIndex + `?employee_id=${employeeId}`, {
						credentials: 'include',
						headers: { Accept: "application/json" }
					});
					if (res2.ok) {
						const data2 = await res2.json();
						console.log('Fetched trainings after create:', data2);
						setTrainings(Array.isArray(data2) ? data2 : []);
						// Check if the new course is present
						if (Array.isArray(data2) && data2.some(t => t.title === newCourse.title && t.description === newCourse.description)) {
							found = true;
							break;
						}
					}
				} catch (e) {
					// ignore fetch errors
				}
				// Wait 500ms before retrying
				await new Promise(r => setTimeout(r, 500));
			}
			if (!found) {
				toast.warn('Course created, but it may not be visible yet. Try refreshing the page.');
			}
		} catch (err) {
			toast.error('Failed to create course: ' + err.message);
		} finally {
			setIsCreatingCourse(false);
		}
	};

	const handleDelete = async (trainingId) => {
		if (!window.confirm('Are you sure you want to delete this course?')) return;
		try {
			const csrfRes = await fetch(hr2.backend.api.csrfToken, {
				credentials: 'include',
				headers: { Accept: "application/json" }
			});
			if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
			const { csrfToken } = await csrfRes.json();

			const res = await fetch(`${hr2.backend.api.trainingIndex}/${trainingId}`, {
				method: 'DELETE',
				credentials: 'include',
				headers: { 
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrfToken
				}
			});
        
			if (!res.ok) throw new Error('Failed to delete');
			toast.success('Course deleted successfully!');
			try {
				const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
				const employeeId = user?.employee_id || user?.employeeID || user?.id;
				const res2 = await fetch(hr2.backend.api.trainingIndex + `?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res2.ok) {
					const data2 = await res2.json();
					setTrainings(Array.isArray(data2) ? data2 : []);
				}
			} catch (e) {/* ignore fetch errors */}
		} catch (err) {
			toast.error('Failed to delete course: ' + err.message);
		}
	};

	const handleEditCourse = (course) => {
		setEditingCourse(course);
		setNewCourse({
			title: course.title,
			description: course.description,
			durationNumber: course.duration ? course.duration.split(' ')[0] : '',
			durationUnit: course.duration ? course.duration.split(' ')[1] : 'Hours',
			type: course.type
		});
		setShowEditDialog(true);
	};

	const handleUpdateCourse = async () => {
		if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.durationNumber.trim() || !newCourse.type.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		try {
			const csrfRes = await fetch(hr2.backend.api.csrfToken, {
				credentials: 'include',
				headers: { Accept: "application/json" }
			});
			if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
			const { csrfToken } = await csrfRes.json();

			const res = await fetch(`${hr2.backend.api.trainingIndex}/${editingCourse.id}`, {
				method: 'PUT',
				credentials: 'include',
				headers: { 
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrfToken
				},
				body: JSON.stringify({
					...newCourse,
					duration: `${newCourse.durationNumber} ${newCourse.durationUnit}`
				})
			});
        
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || `Failed to update course (${res.status})`);
			}
        
			const result = await res.json();
			toast.success('Course updated successfully!');
			setShowEditDialog(false);
			try {
				const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
				const employeeId = user?.employee_id || user?.employeeID || user?.id;
				const res2 = await fetch(hr2.backend.api.trainingIndex + `?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res2.ok) {
					const data2 = await res2.json();
					setTrainings(Array.isArray(data2) ? data2 : []);
				}
			} catch (e) {/* ignore fetch errors */}
		} catch (err) {
			toast.error('Failed to update course: ' + err.message);
		}
	};

	// Pending courses state (should be fetched from backend)
	const [pendingCourses, setPendingCourses] = useState([]);
	// TODO: Fetch pending courses from backend API here

	// Handler for scheduling a meeting (to be implemented)
	const handleScheduleMeeting = (pending) => {
		// TODO: Open a dialog or perform scheduling logic
		alert(`Schedule meeting for ${pending.employeeName} - ${pending.courseTitle}`);
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
			<Helmet>
				<title>Training Management</title>
			</Helmet>
			<ToastContainer position="bottom-right" />
            
			<header className="mb-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Training Management</h1>
					{isHR2Admin() && (
						<div className="flex gap-2">
							<Button 
								variant="outline" 
								onClick={() => setShowManageDialog(true)}
							>
								Manage Courses
							</Button>
							<Button 
								variant="default" 
								onClick={handleAddCourse}
							>
								Add Course
							</Button>
						</div>
					)}
				</div>
			</header>

			   {/* Available Courses Table */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Available Courses ({availableTrainings.length})</CardTitle>
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
										   <TableHead className="text-center">Title</TableHead>
										   <TableHead className="text-center">Description</TableHead>
										   <TableHead className="text-center">Duration</TableHead>
										   <TableHead className="text-center">Type</TableHead>
										   <TableHead className="text-center"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{availablePage.visibleRows.length > 0
										? availablePage.visibleRows.map((training) => (
												<TableRow 
													key={training.id} 
													className={`align-top ${((training.status === 'applied') || appliedCourses.has(Number(training.id))) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
												>
														   <TableCell className="text-center font-medium">{training.title}</TableCell>
														   <TableCell className="text-center text-gray-700">{training.description}</TableCell>
														   <TableCell className="text-center">{training.duration || 'N/A'}</TableCell>
														   <TableCell className="text-center">
															<Badge variant="outline">{training.type || 'Online'}</Badge>
														</TableCell>
														<TableCell>
															<div className="flex gap-2">
																{(() => {
																	const isApplied = training.status === 'applied' || appliedCourses.has(Number(training.id));
																	const isCancelling = cancellingIds.has(Number(training.id));
																	return (
																		<Button
																			variant={isApplied ? "outline" : "default"}
																			size="sm"
																			onClick={() => {
																				if (isApplied) return handleCancel(training.id);
																				return handleApply(training.id);
																			}}
																			disabled={isCancelling}
																		>
																			{isCancelling ? 'Cancelling...' : (isApplied ? 'Cancel' : 'Apply')}
																		</Button>
																	);
																})()}
															</div>
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

				{/* Pending Courses Table - HR2 Admin Only */}
				{isHR2Admin() && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Pending Courses ({pendingCourses.length})</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="text-center">Course Title</TableHead>
											<TableHead className="text-center">Employee Name</TableHead>
											<TableHead className="text-center">Meeting Date</TableHead>
											<TableHead className="text-center">Status</TableHead>
										{isHR2Admin() && <TableHead className="text-center">Action</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{pendingCourses.length > 0 ? (
										pendingCourses.map((pending) => (
											<TableRow key={pending.id}>
												<TableCell className="text-center font-medium">{pending.courseTitle}</TableCell>
												<TableCell className="text-center">{pending.employeeName}</TableCell>
												<TableCell className="text-center">{pending.meetingDate || 'Not scheduled'}</TableCell>
												<TableCell className="text-center">
													<Badge variant="secondary">{pending.status || 'Pending'}</Badge>
												</TableCell>
												{isHR2Admin() && (
													<TableCell className="text-center">
														<Button size="sm" onClick={() => handleScheduleMeeting(pending)}>
															Schedule Meeting
														</Button>
													</TableCell>
												)}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell className="text-center text-gray-600" colSpan={isHR2Admin() ? 5 : 4}>No pending courses.</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			)}
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
										   <TableHead className="text-center">Title</TableHead>
										   <TableHead className="text-center">Description</TableHead>
										   <TableHead className="text-center">Completion Date</TableHead>
										   <TableHead className="text-center">Score</TableHead>
										   <TableHead className="text-center"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{completedPage.visibleRows.length > 0
										? completedPage.visibleRows.map((training) => (
												<TableRow key={training.id} className="align-top">
													   <TableCell className="text-center font-medium">{training.title}</TableCell>
													   <TableCell className="text-center text-gray-700">{training.description}</TableCell>
													   <TableCell className="text-center">{training.completion_date || training.due_date || 'N/A'}</TableCell>
													   <TableCell className="text-center">
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
								<div className="flex gap-2">
									<Input 
										type="number"
										placeholder="e.g., 2" 
										value={newCourse.durationNumber}
										onChange={(e) => setNewCourse(prev => ({...prev, durationNumber: e.target.value}))}
										className="flex-1"
									/>
									<select 
										className="border rounded px-3 py-2 flex-1"
										value={newCourse.durationUnit}
										onChange={(e) => setNewCourse(prev => ({...prev, durationUnit: e.target.value}))}
									>
										<option value="Minutes">Minutes</option>
										<option value="Hours">Hours</option>
										<option value="Days">Days</option>
										<option value="Months">Months</option>
									</select>
								</div>
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

			{/* Edit Course - HR2 Admin Only */}
			{isHR2Admin() && (
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Edit Course</DialogTitle>
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
								<div className="flex gap-2">
									<Input 
										type="number"
										placeholder="e.g., 2" 
										value={newCourse.durationNumber}
										onChange={(e) => setNewCourse(prev => ({...prev, durationNumber: e.target.value}))}
										className="flex-1"
									/>
									<select 
										className="border rounded px-3 py-2 flex-1"
										value={newCourse.durationUnit}
										onChange={(e) => setNewCourse(prev => ({...prev, durationUnit: e.target.value}))}
									>
										<option value="Minutes">Minutes</option>
										<option value="Hours">Hours</option>
										<option value="Days">Days</option>
										<option value="Months">Months</option>
									</select>
								</div>
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
								onClick={() => setShowEditDialog(false)}
							>
								Cancel
							</Button>
							<Button 
								onClick={handleUpdateCourse}
							>
								Update Course
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Manage Courses - HR2 Admin Only */}
			{isHR2Admin() && (
				<Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
					<DialogContent className="w-full max-h-[80vh] overflow-y-auto" style={{ maxWidth: '1280px' }}>
						<DialogHeader>
							<DialogTitle>Manage Courses</DialogTitle>
						</DialogHeader>
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
									{availableTrainings.length > 0
										? availableTrainings.map((training) => (
												<TableRow key={training.id} className="align-top">
													<TableCell className="font-medium">{training.title}</TableCell>
													<TableCell className="text-gray-700">{training.description}</TableCell>
													<TableCell>{training.duration || 'N/A'}</TableCell>
													<TableCell>
														<Badge variant="outline">{training.type || 'Online'}</Badge>
													</TableCell>
													<TableCell>
														<div className="flex gap-2">
															<Button 
																variant="outline" 
																size="sm"
																onClick={() => {
																	setShowManageDialog(false);
																	handleEditCourse(training);
																}}
															>
																Edit
															</Button>
															<Button 
																variant="destructive" 
																size="sm"
																onClick={() => handleDelete(training.id)}
															>
																Delete
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))
										: (
												<TableRow>
													<TableCell className="text-center text-gray-600" colSpan="5">No courses available.</TableCell>
												</TableRow>
											)}
								</TableBody>
							</Table>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}

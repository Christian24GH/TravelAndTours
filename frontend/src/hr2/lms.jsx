import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from "react-helmet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hr2 } from "@/api/hr2";
import { ArrowDownToLineIcon } from 'lucide-react';


export default function LearningManagement() {
	const [loading, setLoading] = useState(true);
	const [showFileDialog, setShowFileDialog] = useState(false);
	const [fileDialogCourse, setFileDialogCourse] = useState(null);
	const [error, setError] = useState(null);
	const [courses, setCourses] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("title");
	const [sortDirection, setSortDirection] = useState("asc");
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
	const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
	const [showManageDialog, setShowManageDialog] = useState(false);
	const [editingCourse, setEditingCourse] = useState(null);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [newCourse, setNewCourse] = useState({
		title: '',
		description: '',
		file: null,
		due_date: '',
		due_time: ''
	});
	const [newQuizQuestions, setNewQuizQuestions] = useState([
		{ question: '', options: ['', '', '', ''], answer: 0 }
	]);
	const [isCreatingCourse, setIsCreatingCourse] = useState(false);
	const [showQuizDialog, setShowQuizDialog] = useState(false);
	const [quizCourse, setQuizCourse] = useState(null);
	const [quizAnswers, setQuizAnswers] = useState({});
		const [quizSubmitted, setQuizSubmitted] = useState(false);
	const [quizScore, setQuizScore] = useState(0);
	const [quizQuestions, setQuizQuestions] = useState([]);
	const [quizLoading, setQuizLoading] = useState(false);
	const [quizError, setQuizError] = useState(null);
	const [editQuizQuestions, setEditQuizQuestions] = useState([]);
	const [showAddQuiz, setShowAddQuiz] = useState(true);
	const [showEditQuiz, setShowEditQuiz] = useState(true);
	const [addQuizPage, setAddQuizPage] = useState(0);
	const [editQuizPage, setEditQuizPage] = useState(0);
	const [assessQuizPage, setAssessQuizPage] = useState(0);
	const [reviewMode, setReviewMode] = useState(false);
	const [reviewData, setReviewData] = useState({ course: null, questions: [], answers: {}, score: 0 });
	const QUESTIONS_PER_PAGE = 2;

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

				const res = await fetch(`${hr2.backend.api.learningCourses}?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res.url.endsWith('/login') || res.status === 401) throw new Error('Not authenticated. Please log in.');
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const data = await res.json();
				setCourses(Array.isArray(data) ? data : []);
			} catch (err) {
				if (!cancelled) setError(err.message || "Failed to load data");
		// Remove duplicate state declarations (already declared above)
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		fetchData();
		return () => { cancelled = true; };
	}, []);

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filterAndSort = (arr) => {
		const filtered = arr.filter((course) => {
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
	};

	const todoCourses = filterAndSort(courses.filter(c => c.status === 'todo' || (!c.status && c.progress < 100)));
	const doneCourses = filterAndSort(courses.filter(c => c.status === 'done' || c.progress === 100));

	const paginate = (arr, page) => {
		const totalItems = arr.length;
		const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
		const currentPageSafe = Math.min(page, totalPages);
		const startIndex = (currentPageSafe - 1) * pageSize;
		const visibleRows = arr.slice(startIndex, startIndex + pageSize);
		return { visibleRows, totalItems, totalPages, currentPageSafe };
	};

	const todoPage = paginate(todoCourses, currentPage);
	const donePage = paginate(doneCourses, completedCurrentPage);

	const onClickSort = (field) => {
		if (sortBy === field) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
		else {
			setSortBy(field);
			setSortDirection("asc");
		}
	};

	// --- LMS-specific actions ---
	const handleAssessment = async (course, review = false) => {
		setQuizCourse(course);
		setQuizAnswers({});
		setQuizSubmitted(false);
		setQuizScore(0);
		setQuizQuestions([]);
		setQuizLoading(true);
		setQuizError(null);
		setShowQuizDialog(true);
		setReviewMode(review);
		try {
			const res = await fetch(`${hr2.backend.api.quiz}${course.id}/quiz`, { credentials: 'include' });
			if (!res.ok) throw new Error('Failed to load quiz');
			const data = await res.json();
			setQuizQuestions(Array.isArray(data) ? data : []);
			if (review) {
				// Use saved answers and score from backend if present
				const userAnswers = course.quiz_answers || course.user_answers || {};
				const score = typeof course.quiz_score === 'number' ? course.quiz_score : 0;
				setReviewData({ course, questions: data, answers: userAnswers, score });
			}
		} catch (err) {
			setQuizError(err.message || 'Failed to load quiz');
		} finally {
			setQuizLoading(false);
		}
	};

	const handleQuizChange = (qid, idx) => {
		setQuizAnswers(prev => ({ ...prev, [qid]: idx }));
	};

	// Fix handleQuizSubmit scoring logic
	const handleQuizSubmit = async () => {
		let correct = 0;
		quizQuestions.forEach((q, qIdx) => {
			const key = q.id !== undefined ? q.id : qIdx;
			if (quizAnswers[key] !== undefined && Number(quizAnswers[key]) === Number(q.answer)) correct++;
		});
		const score = quizQuestions.length > 0 ? Math.round((correct / quizQuestions.length) * 100) : 0;
		setQuizScore(score);
		setQuizSubmitted(true);

		// Move course to completed if not already (frontend)
		if (quizCourse) {
			setCourses(prevCourses => {
				const updated = prevCourses.map(c => {
					if (c.id === quizCourse.id) {
						return { ...c, progress: 100, status: 'done', completion_date: new Date().toISOString().split('T')[0], user_answers: { ...quizAnswers } };
					}
					return c;
				});
				return updated;
			});
			// Persist completion to backend
			try {
				const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
				const employeeId = user?.employee_id || user?.employeeID || user?.id;
				// Fetch CSRF token first
				const csrfRes = await fetch(hr2.backend.api.csrfToken, {
					credentials: 'include',
					headers: { Accept: 'application/json' }
				});
				if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
				const { csrfToken } = await csrfRes.json();
				const res = await fetch(hr2.backend.api.learningQuizResult, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-CSRF-TOKEN': csrfToken
					},
					body: JSON.stringify({
						employee_id: employeeId,
						course_id: quizCourse.id,
						quiz_answers: quizAnswers,
						quiz_score: score
					})
				});
				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					toast.error('Failed to save quiz result: ' + (errorData.message || res.status));
				}
			} catch (err) {
				toast.error('Failed to save quiz result: ' + err.message);
			}
		}
	};

	const handleAddCourse = () => {
		setNewCourse({ title: '', description: '', file: null, due_date: '', due_time: '' });
		setNewQuizQuestions([{ question: '', options: ['', '', '', ''], answer: 0 }]);
		setShowAddCourseDialog(true);
	};

	const handleCreateCourse = async () => {
		if (!newCourse.title.trim() || !newCourse.description.trim() || !newCourse.file || !newCourse.due_date || !newCourse.due_time) {
			toast.error('Please fill in all required fields, upload a file, and select a due date and time');
			return;
		}
		if (newQuizQuestions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
			toast.error('Please fill in all quiz questions and options');
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
			const dueDateTime = `${newCourse.due_date}T${newCourse.due_time}`;
			const formData = new FormData();
			formData.append('title', newCourse.title);
			formData.append('description', newCourse.description);
			formData.append('file', newCourse.file);
			formData.append('due_date', dueDateTime);
			formData.append('quiz', JSON.stringify(newQuizQuestions));
			   const res = await fetch(hr2.backend.api.learningStore, {
				method: 'POST',
				credentials: 'include',
				headers: { 'X-CSRF-TOKEN': csrfToken },
				body: formData
			});
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || `Failed to create course (${res.status})`);
			}
			toast.success('E-learning uploaded successfully!');
			setShowAddCourseDialog(false);
			try {
				const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
				const employeeId = user?.employee_id || user?.employeeID || user?.id;
				   const res2 = await fetch(`${hr2.backend.api.learningCourses}?employee_id=${employeeId}`, {
					credentials: 'include',
					headers: { Accept: "application/json" }
				});
				if (res2.ok) {
					const data2 = await res2.json();
					setCourses(Array.isArray(data2) ? data2 : []);
				}
			} catch (e) {/* ignore fetch errors */}
		} catch (err) {
			toast.error('Failed to upload e-learning: ' + err.message);
		} finally {
			setIsCreatingCourse(false);
		}
	};

	// --- UI ---
	return (
		<>
			<Helmet>
				<title>Learning Management</title>
			</Helmet>
			<ToastContainer position="bottom-right" />
			<header className="mb-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Learning Management</h1>
					{isHR2Admin() && (
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => setShowManageDialog(true)}>Manage Courses</Button>
							<Button variant="default" onClick={handleAddCourse}>Add Course</Button>
						</div>
					)}
				</div>
			</header>

			{/* To Do Courses Table */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Courses To Do ({todoCourses.length})</CardTitle>
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
										<TableHead className="text-center">Title</TableHead>
										<TableHead className="text-center">Description</TableHead>
										<TableHead className="text-center">Due Date - Due Time</TableHead>
										<TableHead className="text-center">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{todoPage.visibleRows.length > 0
										? todoPage.visibleRows.map((course) => {
											// Determine if overdue
											let isOverdue = false;
											if (course.due_date) {
												let due = course.due_date.replace(' ', 'T');
												if (due.length === 10) due += 'T23:59:59'; // If only date, treat as end of day
												const dueDateObj = new Date(due);
												isOverdue = dueDateObj < new Date();
											}
											return (
												<TableRow key={course.id} className={`align-top${isOverdue ? ' bg-red-100' : ''}`}>
													<TableCell className="font-medium text-center">{course.title}</TableCell>
													<TableCell className="text-gray-700 text-center">{course.description}</TableCell>
													<TableCell className="text-center">{isOverdue ? <span className="text-red-600 font-bold">Overdue</span> : (() => {
														if (!course.due_date) return '';
														let datePart, timePart;
														if (course.due_date.includes('T')) {
															[datePart, timePart] = course.due_date.split('T');
														} else if (course.due_date.includes(' ')) {
															[datePart, timePart] = course.due_date.split(' ');
														} else {
															datePart = course.due_date;
															timePart = '';
														}
														const [year, month, day] = datePart.split('-');
														const formattedDate = `${month}/${day}/${year}`;
														if (!timePart) return formattedDate;
														const [h, m] = timePart.split(':');
														let hour = parseInt(h, 10);
														const minute = m;
														const ampm = hour >= 12 ? 'PM' : 'AM';
														hour = hour % 12;
														if (hour === 0) hour = 12;
														const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
														return `${formattedDate} - ${hourStr}:${minute} ${ampm}`;
													})()}</TableCell>
													<TableCell className="flex gap-2 justify-center">
														{course.file_path ? (
															<Button variant="outline" size="sm" onClick={() => { setFileDialogCourse(course); setShowFileDialog(true); }}>
																View
															</Button>
														) : '-'}

														{isOverdue ? (
															<Button variant="default" size="sm" disabled style={{ opacity: 0.5, pointerEvents: 'none' }}>Start Assessment</Button>
														) : (
															<Button variant="default" size="sm" onClick={() => handleAssessment(course)}>
																{course.progress > 0 ? (course.progress === 100 ? 'View Result' : 'Continue Assessment') : 'Assess'}
															</Button>
														)}
													</TableCell>
													{/* File View Dialog */}
													<Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
														<DialogContent className="w-full" style={{ width: '80vw', maxWidth: '80vw', minWidth: '80vw', height: '80vh', maxHeight: '80vh', minHeight: 500, padding: 20 }}>
															<DialogHeader>
																<DialogTitle>{fileDialogCourse?.title || 'View File'}</DialogTitle>
															</DialogHeader>
															{fileDialogCourse && fileDialogCourse.file_path ? (
																<div className="space-y-4">
																	{(() => {
																		let fileUrl = fileDialogCourse.file_path;
																		if (!fileUrl.startsWith('http')) {
																			fileUrl = hr2.backend.uri + '/storage/' + fileUrl.replace(/^elearning[\\\/]/, 'elearning/');
																		}
																		const ext = fileUrl.split('.').pop().toLowerCase();
																		if (["pdf"].includes(ext)) {
																			// Tall, scrollable PDF preview
																			return <iframe src={fileUrl} title="PDF" className="w-full rounded border" style={{ minHeight: 600, height: '70vh', maxHeight: 900 }} />;
																		} else if (["mp4","webm","avi","mov","wmv","mkv"].includes(ext)) {
																			// Responsive video: fill dialog with margin
																			return (
																				<div style={{ position: 'relative', width: '100%', height: '70vh', margin: '24px 0' }}>
																					<video src={fileUrl} controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
																				</div>
																			);
																		} else if (["jpg","jpeg","png","gif","bmp","svg"].includes(ext)) {
																			// Large, contained image
																			return <img src={fileUrl} alt="Course File" style={{ display: 'block', maxWidth: '100%', maxHeight: '70vh', margin: '0 auto', objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 8px #0002' }} />;
																		} else {
																			// Download link for other files
																			return <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 text-lg font-semibold">Download File</a>;
																		}
																	})()}
																</div>
															) : (
																<div>No file available.</div>
															)}
														</DialogContent>
													</Dialog>
												</TableRow>
											);
										})
										: (
											<TableRow>
												<TableCell className="text-center text-gray-600" colSpan="6">No courses to do.</TableCell>
											</TableRow>
										)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex items-center justify-between text-sm text-gray-700">
					<div>Page {todoPage.currentPageSafe} of {todoPage.totalPages} • {todoPage.totalItems} items</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={todoPage.currentPageSafe <= 1}>Previous</Button>
						<Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(todoPage.totalPages, p + 1))} disabled={todoPage.currentPageSafe >= todoPage.totalPages}>Next</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Completed Courses Table */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Completed Courses ({doneCourses.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div className="flex gap-3 flex-1">
							<div className="flex flex-col flex-1 min-w-[220px]">
								<label className="text-sm text-gray-600 mb-1">Search</label>
								<Input placeholder="Search by title or description..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCompletedCurrentPage(1); }} />
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
										<TableHead className="text-center">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{donePage.visibleRows.length > 0
										? donePage.visibleRows.map((course) => (
											<TableRow key={course.id} className="align-top">
												<TableCell className="font-medium text-center">{course.title}</TableCell>
												<TableCell className="text-gray-700 text-center">{course.description}</TableCell>
												<TableCell className="text-center">{(() => {
													const dateStr = course.completion_date || course.due_date;
													if (!dateStr) return 'N/A';
													let dateObj;
													if (typeof dateStr === 'string' && (dateStr.includes('T') || dateStr.includes(' '))) {
														// Handles ISO or 'YYYY-MM-DD HH:mm:ss'
														dateObj = new Date(dateStr.replace(' ', 'T'));
													} else {
														dateObj = new Date(dateStr);
													}
													if (isNaN(dateObj)) return dateStr;
													const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
													const dd = String(dateObj.getDate()).padStart(2, '0');
													const yyyy = dateObj.getFullYear();
													let hours = dateObj.getHours();
													const minutes = String(dateObj.getMinutes()).padStart(2, '0');
													const ampm = hours >= 12 ? 'PM' : 'AM';
													hours = hours % 12;
													if (hours === 0) hours = 12;
													const hourStr = String(hours).padStart(2, '0');
													return `${mm}/${dd}/${yyyy} ${hourStr}:${minutes} ${ampm}`;
												})()}</TableCell>
												<TableCell className="text-center">{typeof course.quiz_score === 'number' ? course.quiz_score : 0}%</TableCell>
												<TableCell className="text-center">
													<Button variant="outline" size="sm" onClick={() => handleAssessment(course, true)}>View Result</Button>
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
					<div>Page {donePage.currentPageSafe} of {donePage.totalPages} • {donePage.totalItems} items</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setCompletedCurrentPage((p) => Math.max(1, p - 1))} disabled={donePage.currentPageSafe <= 1}>Previous</Button>
						<Button variant="outline" onClick={() => setCompletedCurrentPage((p) => Math.min(donePage.totalPages, p + 1))} disabled={donePage.currentPageSafe >= donePage.totalPages}>Next</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Add E-learning Dialog - HR2 Admin Only */}
			{isHR2Admin() && (
				<>
				<Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
					<DialogContent className="max-w-lg w-full" style={{ maxWidth: 520, width: '100%' }}>
						<DialogHeader>
							<DialogTitle>Add New E-learning</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium mb-1 block">Title *</label>
								<Input 
									placeholder="Enter e-learning title..." 
									value={newCourse.title}
									onChange={(e) => setNewCourse(prev => ({...prev, title: e.target.value}))}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">Description *</label>
								<Input 
									placeholder="Enter e-learning description..." 
									value={newCourse.description}
									onChange={(e) => setNewCourse(prev => ({...prev, description: e.target.value}))}
								/>
							</div>
							<div className="flex gap-2">
								<div className="flex-1">
									<label className="text-sm font-medium mb-1 block">Due Date *</label>
									<Input 
										type="date"
										value={newCourse.due_date}
										onChange={e => setNewCourse(prev => ({...prev, due_date: e.target.value}))}
									/>
								</div>
								<div className="flex-1">
									<label className="text-sm font-medium mb-1 block">Due Time *</label>
									<Input 
										type="time"
										value={newCourse.due_time}
										onChange={e => setNewCourse(prev => ({...prev, due_time: e.target.value}))}
									/>
								</div>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">Upload File *</label>
								<Input 
									type="file"
									accept=".pdf,.mp4,.ppt,.pptx,.doc,.docx,.zip,.rar,.avi,.mov,.wmv,.mkv,.webm,.jpg,.jpeg,.png"
									onChange={e => setNewCourse(prev => ({...prev, file: e.target.files[0]}))}
								/>
							</div>
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="text-sm font-medium block">Quiz Questions</label>
									<Button size="sm" variant="outline" type="button" onClick={() => setShowAddQuiz(v => !v)}>
										{showAddQuiz ? 'Hide' : 'Show'}
									</Button>
								</div>
								{showAddQuiz && (
									<div>
										{newQuizQuestions.slice(addQuizPage * QUESTIONS_PER_PAGE, (addQuizPage + 1) * QUESTIONS_PER_PAGE).map((q, qi) => {
											const globalIdx = addQuizPage * QUESTIONS_PER_PAGE + qi;
											return (
												<div key={globalIdx} className="mb-2 p-3 rounded border bg-gray-50 shadow-sm">
													<Input
														placeholder={`Question ${globalIdx + 1}`}
														value={q.question}
														onChange={e => setNewQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, question: e.target.value } : qq))}
														className="mb-2"
													/>
													<div className="space-y-2">
														{q.options.map((opt, oi) => (
															<div key={oi} className="flex items-center gap-2 mb-1">
																<input
																	type="radio"
																	name={`add-answer${globalIdx}`}
																	checked={q.answer === oi}
																	onChange={() => setNewQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, answer: oi } : qq))}
																/>
																<Input
																	placeholder={`Option ${oi + 1}`}
																	value={opt}
																	onChange={e => setNewQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, options: qq.options.map((o, j) => j === oi ? e.target.value : o) } : qq))}
																	className="flex-1"
																/>
																{q.options.length > 2 && (
																	<Button size="sm" variant="destructive" onClick={() => setNewQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, options: qq.options.filter((_, j) => j !== oi), answer: qq.answer >= qq.options.length - 1 ? 0 : qq.answer } : qq))}>-</Button>
																)}
															</div>
														))}
													</div>
													<div className="flex gap-2 mt-2">
														<Button size="sm" variant="outline" onClick={() => setNewQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, options: [...qq.options, ''] } : qq))}>Add Option</Button>
														{newQuizQuestions.length > 1 && (
															<Button size="sm" variant="destructive" onClick={() => {
																setNewQuizQuestions(prev => {
																	const updated = prev.filter((_, i) => i !== globalIdx);
																	// If we removed the last question on the last page, go back a page
																	if ((addQuizPage * QUESTIONS_PER_PAGE) >= updated.length && addQuizPage > 0) {
																		setAddQuizPage(p => p - 1);
																	}
																	return updated;
																});
															}}>Remove Question</Button>
														)}
													</div>
												</div>
											);
										})}
										<div className="flex justify-between items-center mt-2">
											<Button size="sm" variant="outline" type="button" disabled={addQuizPage === 0} onClick={() => setAddQuizPage(p => p - 1)}>Prev</Button>
											<span>Page {addQuizPage + 1} of {Math.ceil(newQuizQuestions.length / QUESTIONS_PER_PAGE)}</span>
											<Button size="sm" variant="outline" type="button" disabled={(addQuizPage + 1) * QUESTIONS_PER_PAGE >= newQuizQuestions.length} onClick={() => setAddQuizPage(p => p + 1)}>Next</Button>
										</div>
										<Button size="sm" variant="default" className="mt-2" onClick={() => setNewQuizQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], answer: 0 }])}>Add Question</Button>
									</div>
								)}
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
								{isCreatingCourse ? 'Uploading...' : 'Add E-learning'}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
				{/* Manage Courses Dialog */}
				<Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
					<DialogContent className="w-full max-h-[80vh] overflow-y-auto" style={{ maxWidth: '1280px' }}>
						<DialogHeader>
							<DialogTitle>Manage Courses</DialogTitle>
						</DialogHeader>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="text-center">Title</TableHead>
										<TableHead className="text-center">Description</TableHead>
										<TableHead className="text-center">Due Date - Due Time</TableHead>
										<TableHead className="text-center">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{courses.length > 0 ? courses.map((course) => (
										<TableRow key={course.id}>
											<TableCell className="text-center">{course.title}</TableCell>
											<TableCell className="text-center">{course.description}</TableCell>
											<TableCell className="text-center">{(() => {
												if (!course.due_date) return '';
												let datePart, timePart;
												if (course.due_date.includes('T')) {
													[datePart, timePart] = course.due_date.split('T');
												} else if (course.due_date.includes(' ')) {
													[datePart, timePart] = course.due_date.split(' ');
												} else {
													datePart = course.due_date;
													timePart = '';
												}
												const [year, month, day] = datePart.split('-');
												const formattedDate = `${month}/${day}/${year}`;
												if (!timePart) return formattedDate;
												const [h, m] = timePart.split(':');
												let hour = parseInt(h, 10);
												const minute = m;
												const ampm = hour >= 12 ? 'PM' : 'AM';
												hour = hour % 12;
												if (hour === 0) hour = 12;
												const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
												return `${formattedDate} - ${hourStr}:${minute} ${ampm}`;
											})()}
											</TableCell>
											<TableCell className="text-center">
												<Button size="sm" variant="outline" onClick={() => {
													setEditingCourse(course);
													setEditQuizQuestions(course.quiz || [{ question: '', options: ['', '', '', ''], answer: 0 }]);
													setShowEditDialog(true);
												}}>Edit</Button>
												<Button size="sm" variant="destructive" className="ml-2" onClick={async () => {
													if (!window.confirm('Are you sure you want to delete this course?')) return;
													try {
														const csrfRes = await fetch(hr2.backend.api.csrfToken, {
															credentials: 'include',
															headers: { Accept: "application/json" }
														});
														if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
														const { csrfToken } = await csrfRes.json();
														   const res = await fetch(`${hr2.backend.api.learningDelete}${course.id}`, {
															method: 'DELETE',
															credentials: 'include',
															headers: { 'X-CSRF-TOKEN': csrfToken }
														});
														if (!res.ok) throw new Error('Failed to delete course');
														toast.success('Course deleted');
														setCourses(courses => courses.filter(c => c.id !== course.id));
													} catch (err) {
														toast.error('Failed to delete course: ' + err.message);
													}
												}}>Delete</Button>
											</TableCell>
										</TableRow>
									)) : (
										<TableRow>
											<TableCell colSpan={5} className="text-center text-gray-600">No courses found.</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</DialogContent>
				</Dialog>
				{/* Edit Course Dialog */}
				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className="max-w-lg w-full" style={{ maxWidth: 520, width: '100%' }}>
						<DialogHeader>
							<DialogTitle>Edit Course</DialogTitle>
						</DialogHeader>
						{editingCourse && (
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium mb-1 block">Title *</label>
									<Input
										value={editingCourse.title}
										onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
									/>
								</div>
								<div>
									<label className="text-sm font-medium mb-1 block">Description *</label>
									<Input
										value={editingCourse.description}
										onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
									/>
								</div>
														<div className="flex gap-2">
															<div className="flex-1">
																<label className="text-sm font-medium mb-1 block">Due Date *</label>
																<Input
																	type="date"
																	value={editingCourse.due_date ? (editingCourse.due_date.split('T')[0]) : ''}
																	onChange={e => setEditingCourse({ ...editingCourse, due_date: e.target.value + (editingCourse.due_time ? 'T' + editingCourse.due_time : '') })}
															/>
														</div>
															<div className="flex-1">
																<label className="text-sm font-medium mb-1 block">Due Time *</label>
																<Input
																	type="time"
																	value={editingCourse.due_date ? (editingCourse.due_date.split('T')[1] || '') : ''}
																	onChange={e => {
																	const date = editingCourse.due_date ? editingCourse.due_date.split('T')[0] : '';
																	setEditingCourse({ ...editingCourse, due_date: date + 'T' + e.target.value, due_time: e.target.value });
																}}
															/>
														</div>
														</div>

														<div>
															<label className="text-sm font-medium mb-1 block">Upload New File</label>
															<Input
																type="file"
																accept=".pdf,.mp4,.ppt,.pptx,.doc,.docx,.zip,.rar,.avi,.mov,.wmv,.mkv,.webm,.jpg,.jpeg,.png"
																onChange={e => setEditingCourse({ ...editingCourse, file: e.target.files[0] })}
															/>
															{editingCourse.file_path && !editingCourse.file && (
																<div className="mt-1 text-xs text-gray-500">Current file: <a href={editingCourse.file_path} target="_blank" rel="noopener noreferrer" className="underline">Download</a></div>
															)}
														</div>
														<div>
															<div className="flex items-center justify-between mb-2">
																<label className="text-sm font-medium block">Quiz Questions</label>
																<Button size="sm" variant="outline" type="button" onClick={() => setShowEditQuiz(v => !v)}>
																	{showEditQuiz ? 'Hide' : 'Show'}
																</Button>
															</div>
															{showEditQuiz && (
																<div>
																	{editQuizQuestions.slice(editQuizPage * QUESTIONS_PER_PAGE, (editQuizPage + 1) * QUESTIONS_PER_PAGE).map((q, qi) => {
																		const globalIdx = editQuizPage * QUESTIONS_PER_PAGE + qi;
																		const key = q.id !== undefined ? q.id : globalIdx;
																		return (
																			<div key={key} className="mb-2 p-3 rounded border bg-gray-50 shadow-sm">
																				<Input
																					placeholder={`Question ${globalIdx + 1}`}
																					value={q.question}
																					onChange={e => setEditQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, question: e.target.value } : qq))}
																					className="mb-2"
																				/>
																				<div className="space-y-2">
																					{q.options.map((opt, oi) => (
																						<div key={oi} className="flex items-center gap-2 mb-1">
																							<input
																								type="radio"
																								name={`edit-answer${key}`}
																								checked={q.answer === oi}
																								onChange={() => setEditQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, answer: oi } : qq))}
																							/>
																							<Input
																								placeholder={`Option ${oi + 1}`}
																								value={opt}
																								onChange={e => setEditQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, options: qq.options.map((o, j) => j === oi ? e.target.value : o) } : qq))}
																								className="flex-1"
																							/>
																							{q.options.length > 2 && (
																								<Button size="sm" variant="destructive" onClick={() => setEditQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, options: qq.options.filter((_, j) => j !== oi), answer: qq.answer >= qq.options.length - 1 ? 0 : qq.answer } : qq))}>-</Button>
																							)}
																						</div>
																					))}
																				</div>
																				<div className="flex gap-2 mt-2">
																					<Button size="sm" variant="outline" onClick={() => setEditQuizQuestions(prev => prev.map((qq, i) => i === globalIdx ? { ...qq, options: [...qq.options, ''] } : qq))}>Add Option</Button>
																					{editQuizQuestions.length > 1 && (
																						<Button size="sm" variant="destructive" onClick={() => setEditQuizQuestions(prev => prev.filter((_, i) => i !== globalIdx))}>Remove Question</Button>
																					)}
																				</div>
																			</div>
																		);
																	})}
																	<div className="flex justify-between items-center mt-2">
																		<Button size="sm" variant="outline" type="button" disabled={editQuizPage === 0} onClick={() => setEditQuizPage(p => p - 1)}>Prev</Button>
																		<span>Page {editQuizPage + 1} of {Math.ceil(editQuizQuestions.length / QUESTIONS_PER_PAGE)}</span>
																		<Button size="sm" variant="outline" type="button" disabled={(editQuizPage + 1) * QUESTIONS_PER_PAGE >= editQuizQuestions.length} onClick={() => setEditQuizPage(p => p + 1)}>Next</Button>
																	</div>
																	<Button size="sm" variant="default" className="mt-2" onClick={() => setEditQuizQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], answer: 0 }])}>Add Question</Button>
																</div>
															)}
														</div>
							</div>
						)}
						<div className="flex justify-end gap-2 mt-6">
							<Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
							<Button onClick={async () => {
								try {
									const csrfRes = await fetch(hr2.backend.api.csrfToken, {
										credentials: 'include',
										headers: { Accept: "application/json" }
									});
									if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
									const { csrfToken } = await csrfRes.json();
									let body, headers, method;
									if (editingCourse.file) {
										body = new FormData();
										body.append('title', editingCourse.title);
										body.append('description', editingCourse.description);
										if (editingCourse.due_date) body.append('due_date', editingCourse.due_date);
										body.append('file', editingCourse.file);
										body.append('quiz', JSON.stringify(editQuizQuestions));
										body.append('_method', 'PUT');
										headers = { 'X-CSRF-TOKEN': csrfToken };
										method = 'POST';
									} else {
										body = JSON.stringify({
											title: editingCourse.title,
											description: editingCourse.description,
											due_date: editingCourse.due_date,
											quiz: editQuizQuestions
										});
										headers = {
											'X-CSRF-TOKEN': csrfToken,
											'Content-Type': 'application/json'
										};
										method = 'PUT';
									}
									   const res = await fetch(`${hr2.backend.api.learningUpdate}${editingCourse.id}`, {
										method,
										credentials: 'include',
										headers,
										body
									});
									if (!res.ok) throw new Error('Failed to update course');
									toast.success('Course updated');
									setShowEditDialog(false);
									try {
										const user = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
										const employeeId = user?.employee_id || user?.employeeID || user?.id;
										   const res2 = await fetch(`${hr2.backend.api.learningCourses}?employee_id=${employeeId}`, {
											credentials: 'include',
											headers: { Accept: "application/json" }
										});
										if (res2.ok) {
											const data2 = await res2.json();
											setCourses(Array.isArray(data2) ? data2 : []);
										}
									} catch (e) {/* ignore fetch errors */}
								} catch (err) {
									toast.error('Failed to update course: ' + err.message);
								}
							}}>Save</Button>
						</div>
					</DialogContent>
				</Dialog>
				{/* Quiz Dialog */}
				<Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>Quiz: {quizCourse?.title || ''}</DialogTitle>
						</DialogHeader>
						{quizLoading ? (
							<div className="text-center py-8">Loading quiz...</div>
						) : quizError ? (
							<div className="text-center text-red-600 py-8">{quizError}</div>
						) : reviewMode ? (
							<div className="text-center">
								<div className="text-xl font-bold mb-2">{reviewData.course?.title || 'Course Result'}</div>
								<div className="text-2xl font-bold mb-4 {reviewData.score >= 70 ? 'text-green-700' : 'text-red-600'}">
									Your Score: {reviewData.score}%
								</div>
								<div className={`text-lg font-semibold mb-6 ${reviewData.score >= 70 ? 'text-green-700' : 'text-red-600'}`}>{reviewData.score >= 70 ? 'Congratulations, you passed!' : 'Sorry, you did not pass.'}</div>
								<Button onClick={() => setShowQuizDialog(false)} className="px-8 py-2 text-lg">Close</Button>
							</div>
						) : !quizSubmitted ? (
							<form onSubmit={e => { e.preventDefault(); handleQuizSubmit(); }}>
								<div className="space-y-6">
									{quizQuestions.length === 0 ? (
										<div className="text-center text-gray-500">No quiz available for this course.</div>
									) : quizQuestions.slice(assessQuizPage * QUESTIONS_PER_PAGE, (assessQuizPage + 1) * QUESTIONS_PER_PAGE).map((q, qIdx) => {
										const globalIdx = assessQuizPage * QUESTIONS_PER_PAGE + qIdx;
										const key = q.id !== undefined ? q.id : globalIdx;
										return (
											<div key={key} className="mb-6 p-4 rounded border bg-gray-50">
												<div className="font-semibold mb-3 text-lg text-gray-800">{q.question}</div>
												<div className="space-y-2">
													{q.options.map((opt, idx) => (
														<label key={idx} className="flex items-center gap-3 cursor-pointer text-base text-gray-700">
														<input
															type="radio"
															name={`quiz-q-${key}`}
															value={idx}
															checked={quizAnswers[key] === idx}
															onChange={() => handleQuizChange(key, idx)}
															required
															className="accent-blue-600 w-5 h-5"
														/>
														<span>{opt}</span>
													</label>
													))}
												</div>
											</div>
										);
									})}
								</div>
								{quizQuestions.length > QUESTIONS_PER_PAGE && (
									<div className="flex justify-between items-center mt-4">
										<Button size="sm" variant="outline" type="button" disabled={assessQuizPage === 0} onClick={() => setAssessQuizPage(p => p - 1)}>Prev</Button>
										<span>Page {assessQuizPage + 1} of {Math.ceil(quizQuestions.length / QUESTIONS_PER_PAGE)}</span>
										<Button size="sm" variant="outline" type="button" disabled={(assessQuizPage + 1) * QUESTIONS_PER_PAGE >= quizQuestions.length} onClick={() => setAssessQuizPage(p => p + 1)}>Next</Button>
									</div>
								)}
								{quizQuestions.length > 0 && (
									<div className="flex justify-end mt-8">
										<Button type="submit" className="px-8 py-2 text-lg">Submit</Button>
									</div>
								)}
							</form>
						) : (
							<div className="text-center">
								<div className="text-3xl font-bold mb-6 text-green-700">Your Score: {quizScore}%</div>
								<Button onClick={() => setShowQuizDialog(false)} className="px-8 py-2 text-lg">Close</Button>
							</div>
						)}
					</DialogContent>
				</Dialog>
				</>
			)}
		</>
	);
}
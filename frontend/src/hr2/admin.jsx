import ProtectedLayout from "@/layout/ProtectedLayout";
import { hr2 } from "@/api/hr2";
import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router";
import AuthContext from "../context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ESS() {
    const [employeeId, setEmployeeId] = useState(null);
    const [searchId, setSearchId] = useState("");
    const [profile, setProfile] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const { auth } = useContext(AuthContext);
    const userRole = auth?.role;
    const isHR2Admin = userRole === 'HR2 Admin';
    const isEmployee = userRole === 'Employee';
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        department: "",
        position: "",
        email: "",
        phone: "",
        address: "",
        birthday: "",
        civil_status: "",
        emergency_contact: "",
        hire_date: "",
        manager: "",
        employee_status: "Active",
        profile_photo_url: "",
    });

    const [newAccountForm, setNewAccountForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Employee",
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 10;
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    const fetchCsrfToken = async () => {
        try {
            const res = await fetch(`${hr2.backend.uri}/api/csrf-token`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch CSRF token.');
            const data = await res.json();
            setCsrfToken(data.csrfToken);
        } catch (e) {
            toast.error('Failed to fetch CSRF token.');
        }
    };

    const loadProfile = async (id) => {
        if (id === null) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(hr2.backend.ess.profile + `/${id}`, { credentials: 'include' });
            if (!res.ok) {
                if (res.status === 404) {
                    toast.error('Profile not found. The employee ID might be invalid.');
                    setDialogOpen(false);
                    return;
                }
                throw new Error('Failed to load profile');
            }
            const profileJson = await res.json();
            setProfile(profileJson);
            setForm(profileJson);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAllEmployees = async () => {
        try {
            const res = await fetch(hr2.backend.ess.profile, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load employee list');
            const data = await res.json();
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (e) {
            toast.error(e.message);
        }
    };


    useEffect(() => {
        loadAllEmployees();
        fetchCsrfToken();
    }, []);

    useEffect(() => {
        if (userRole && !isHR2Admin) {
            navigate('/hr2m', { replace: true });
        }
    }, [userRole, isHR2Admin, navigate]);

    const formatName = (p) => {
        if (!p) return "";
        let name = p.last_name || "";
        if (p.first_name) name = p.first_name + " " + name;
        if (p.middle_name) name = p.first_name + " " + p.middle_name + " " + p.last_name;
        if (p.suffix) name = name + ", " + p.suffix;
        return name.trim();
    };

    const editableFields = isHR2Admin
        ? [
            "profile_photo_url", "phone", "address", "civil_status", "emergency_contact",
            "email", "department", "position", "birthday", "hire_date", "manager", "employee_status",
            "last_name", "first_name", "middle_name", "suffix"
        ]
        : ["profile_photo_url", "phone", "address", "civil_status", "emergency_contact"];

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleNewAccountFormChange = (e) => {
        const { name, value } = e.target;
        setNewAccountForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAccount = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("http://localhost:8091/api/employees", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify(newAccountForm),
            });

            if (res.status === 201) {
                toast.success("Account created successfully!");
                setNewAccountForm({ name: "", email: "", password: "", role: "Employee" });
                setShowAddForm(false);
                await loadAllEmployees();
            } else if (res.status === 422) {
                const errorData = await res.json();
                console.error("Validation Errors:", errorData.errors);
                const errorMessages = Object.values(errorData.errors).flat().join("\n");
                toast.error(`Validation Failed:\n${errorMessages}`);
            } else {
                toast.error(`Error: ${res.statusText}`);
            }
        } catch (error) {
            toast.error(`Failed to create account: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateEmployee = async () => {
        setSaving(true);
        if (!csrfToken) {
            toast.error("CSRF token is not available. Please try again.");
            setSaving(false);
            return;
        }

        try {
            const url = `${hr2.backend.ess.profile}/${employeeId}`;
            const method = 'PATCH';
            const data = { ...form };
            delete data.profile_photo_url;

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const responseData = await res.json();
            if (!res.ok) {
                const errorMessage = responseData.message || 'Failed to process request';
                toast.error(errorMessage);
                setSaving(false);
                return;
            }

            toast.success('Employee profile updated successfully.');
            await loadAllEmployees();
            await fetchCsrfToken();
            setDialogOpen(false);
            setIsEditing(false);
            setEmployeeId(null);
            setDialogData(null);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm(`Are you sure you want to delete employee with ID ${id}?`)) {
            return;
        }
        if (!csrfToken) {
            toast.error("CSRF token is not available. Please try again.");
            return;
        }

        try {
            const res = await fetch(hr2.backend.ess.profile + `/${id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                credentials: 'include',
            });
            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.message || `Failed to delete employee: HTTP ${res.status}`);
            }
            await loadAllEmployees();
            await fetchCsrfToken();
            toast.success(`Employee with ID ${id} has been removed.`);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleSearch = () => {
        if (searchId) {
            const results = employees.filter(emp => emp.id == searchId);
            setFilteredEmployees(results);
        } else {
            setFilteredEmployees(employees);
        }
        setCurrentPage(1);
    };

    const handleDiscard = () => {
        setEmployeeId(null);
        setProfile(null);
        setIsEditing(false);
        setForm({
            first_name: "",
            middle_name: "",
            last_name: "",
            suffix: "",
            department: "",
            position: "",
            email: "",
            phone: "",
            address: "",
            birthday: "",
            civil_status: "",
            emergency_contact: "",
            hire_date: "",
            manager: "",
            employee_status: "Active",
            profile_photo_url: "",
        });
        setNewAccountForm({
            name: "",
            email: "",
            password: "",
            role: "Employee",
        });
    };

    const handleUpdateClick = (empId) => {
        setEmployeeId(empId);
        loadProfile(empId);
        setDialogOpen(true);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setForm(f => ({ ...f, profile_photo_url: url }));
        }
    };

    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="flex flex-1 min-h-screen bg-gray-100" style={{ height: '100vh' }}>
            <main className="flex-1 flex flex-col h-full m-4">
                <Helmet>
                    <title>HR Admin</title>
                </Helmet>
                <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10 -m-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">HR2 Admin (Sample Data Only)</h1>
                </div>
                <div className="flex-1 overflow-y-auto pt-4">
                    <header className="mb-6">
                        <h1 className="text-large md:text-large text-gray-800">
                            {isHR2Admin ? '' : 'Loading...'}
                        </h1>
                    </header>
                    {isHR2Admin ? (
                        <>
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div className="flex items-end gap-3">
                                    <div className="flex flex-col">
                                        <Label className="text-sm text-gray-600 mb-1">Search ID</Label>
                                        <Input type="number" min={1} value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-32" />
                                    </div>
                                        <Button onClick={handleSearch}>Search</Button>
                                    </div>
                                    <Dialog open={showAddForm} onOpenChange={(open) => {
                                        setShowAddForm(open);
                                        if (!open) {
                                            handleDiscard();
                                        }
                                        }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" onClick={() => {
                                                setShowAddForm(true);
                                                setIsEditing(false);
                                                handleDiscard();
                                            }}>Add Employee Account</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Add New Employee Account</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div>
                                                    <Label htmlFor="addName">Name</Label>
                                                    <Input id="addName" name="name" value={newAccountForm.name} onChange={handleNewAccountFormChange} placeholder="Full Name" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="addEmail">Email</Label>
                                                    <Input id="addEmail" name="email" value={newAccountForm.email} onChange={handleNewAccountFormChange} placeholder="employee@example.com" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="addPassword">Password</Label>
                                                    <Input id="addPassword" name="password" type="password" value={newAccountForm.password} onChange={handleNewAccountFormChange} placeholder="••••••••" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="addRole">Role</Label>
                                                    <Select onValueChange={(value) => setNewAccountForm(f => ({ ...f, role: value }))} value={newAccountForm.role}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="HR2 Admin">HR2 Admin</SelectItem>
                                                            <SelectItem value="Employee">Employee</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                                <Button onClick={handleCreateAccount} disabled={saving}>Create Account</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>List of Employees</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Department</TableHead>
                                                        <TableHead>Position</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentEmployees.map(emp => (
                                                        <TableRow key={emp.id}>
                                                            <TableCell className="font-mono text-xs text-gray-500">{emp.id}</TableCell>
                                                            <TableCell>{formatName(emp)}</TableCell>
                                                            <TableCell>{emp.department}</TableCell>
                                                            <TableCell>{emp.position}</TableCell>
                                                            <TableCell>{emp.email}</TableCell>
                                                            <TableCell>
                                                                <Dialog open={dialogOpen && employeeId === emp.id} onOpenChange={(open) => {
                                                                    setDialogOpen(open);
                                                                    if (!open) handleDiscard();
                                                                }}>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleUpdateClick(emp.id)}
                                                                            className="mr-2"
                                                                        >
                                                                            Update
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-3xl sm:max-w-7xl overflow-y-auto max-h-[80vh]">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Update Employee's Profile</DialogTitle>
                                                                        </DialogHeader>
                                                                        <div className="flex flex-col md:flex-row gap-6 items-start py-4">
                                                                            <div className="flex flex-col items-center gap-2">
                                                                            </div>
                                                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <Label htmlFor="lastName">Last Name</Label>
                                                                                    <Input id="lastName" value={form.last_name} onChange={e => handleChange("last_name", e.target.value)} placeholder="Last Name" />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="firstName">First Name</Label>
                                                                                    <Input id="firstName" value={form.first_name} onChange={e => handleChange("first_name", e.target.value)} placeholder="First Name" />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="middleName">Middle Name</Label>
                                                                                    <Input id="middleName" value={form.middle_name} onChange={e => handleChange("middle_name", e.target.value)} placeholder="Middle Name" />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="suffix">Suffix</Label>
                                                                                    <Input id="suffix" value={form.suffix} onChange={e => handleChange("suffix", e.target.value)} placeholder="Suffix" />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="phone">Phone Number</Label>
                                                                                    <Input id="phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="email">Email</Label>
                                                                                    <Input id="email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="address">Address</Label>
                                                                                    <Input id="address" value={form.address} onChange={e => handleChange("address", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="civilStatus">Civil Status</Label>
                                                                                    <Input id="civilStatus" value={form.civil_status} onChange={e => handleChange("civil_status", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                                                                                    <Input id="emergencyContact" value={form.emergency_contact} onChange={e => handleChange("emergency_contact", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="department">Department</Label>
                                                                                    <Input id="department" value={form.department} onChange={e => handleChange("department", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="position">Position/Job Title</Label>
                                                                                    <Input id="position" value={form.position} onChange={e => handleChange("position", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="birthday">Birthday</Label>
                                                                                    <Input id="birthday" value={form.birthday} onChange={e => handleChange("birthday", e.target.value)} type="date" />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="manager">Manager/Supervisor</Label>
                                                                                    <Input id="manager" value={form.manager} onChange={e => handleChange("manager", e.target.value)} />
                                                                                </div>
                                                                                <div>
                                                                                    <Label htmlFor="employeeStatus">Employee Status</Label>
                                                                                    <Input id="employeeStatus" value={form.employee_status} onChange={e => handleChange("employee_status", e.target.value)} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <DialogFooter>
                                                                            <Button variant="outline" className="mr-2" onClick={handleDiscard}>Discard</Button>
                                                                            <Button onClick={handleUpdateEmployee} disabled={saving}>
                                                                                Save Changes
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleRemove(emp.id)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <span className="text-sm text-gray-600">
                                                                    Page {currentPage} of {totalPages}
                                                                </span>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={handlePrevPage}
                                                                    disabled={currentPage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={handleNextPage}
                                                                    disabled={currentPage === totalPages}
                                                                >
                                                                    Next
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <>
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Employees</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Department</TableHead>
                                                    <TableHead>Position</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentEmployees.map(emp => (
                                                    <TableRow key={emp.id}>
                                                        <TableCell>{formatName(emp)}</TableCell>
                                                        <TableCell>{emp.department}</TableCell>
                                                        <TableCell>{emp.position}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <span className="text-sm text-gray-600">
                                                                Page {currentPage} of {totalPages}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                onClick={handlePrevPage}
                                                                disabled={currentPage === 1}
                                                            >
                                                                Previous
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={handleNextPage}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                Next
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                    <ToastContainer position="bottom-right" />
                </main>
            </div>
    );
}

ESS.layout = (page) => <ProtectedLayout children={page} />
export default ESS;
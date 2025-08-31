import ProtectedLayout from "@/layout/ProtectedLayout";
import { hr2 } from "@/api/hr2";
import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useRef } from "react";
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
    // Try to get the logged-in employee's ID from localStorage (adjust as needed for your app)
    const loggedInEmployeeId = localStorage.getItem('employeeId');
    const [searchId, setSearchId] = useState("");
    const [profile, setProfile] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const isHR2Admin = userRole === 'HR2 Admin';
    const isEmployee = userRole === 'Employee';

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
            // Set employeeId for update
            if (profileJson && profileJson.id) {
                setEmployeeId(profileJson.id);
            }
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

    // Placeholder function to fetch the user's role
    const fetchUserRole = async () => {
        try {
            // In a real application, you would make an API call to get the authenticated user's role
            // const res = await fetch('/api/user-role', { credentials: 'include' });
            // const data = await res.json();
            // setUserRole(data.role);

            // For now, we will hardcode the role for testing purposes
            // Change the string below to 'HR2 Admin' to test the admin view
            // and 'Employee' to test the employee view.
            setUserRole('Employee');
        } catch (e) {
            console.error("Failed to fetch user role:", e);
            setUserRole('Employee'); // Default to Employee on error
        }
    };

    useEffect(() => {
        loadAllEmployees();
        fetchCsrfToken();
        fetchUserRole();
    }, []);

    useEffect(() => {
        let userId = null;
        try {
            const authUser = JSON.parse(localStorage.getItem('authUser'));
            if (authUser && authUser.id) {
                userId = authUser.id;
            }
        } catch (e) {}
        if (!userId && loggedInEmployeeId) {
            userId = loggedInEmployeeId;
        }
        if (userId) {
            loadProfile(userId);
        }
    }, [userRole, loggedInEmployeeId]);

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
            // Reload profile and re-set employeeId
            await loadProfile(employeeId);
            setDialogOpen(false);
            setIsEditing(false);
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
                    <title>Employees Profile</title>
                </Helmet>
                <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10 -m-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Your Profile</h1>
                </div>
                <div className="flex-1 overflow-y-auto pt-4">
                    <header className="mb-6">
                        <h1 className="text-xl md:text-3xl font-bold text-gray-800">
                            {isHR2Admin ? '' : isEmployee ? '' : 'Loading...'}
                        </h1>
                    </header>
                    {loading && <div>Loading...</div>}
                    {!loading && (
                        profile ? (
                            <div className="flex justify-center w-full mt-8">
                                <Card className="max-w-full w-full max-h-full">
                                    <CardHeader>
                                        <CardTitle>Your Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col md:flex-row gap-6 items-start py-1">
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={form.profile_photo_url || "https://img.icons8.com/?size=100&id=LREuj015njcj&format=png&color=000000"}
                                                    alt="Profile"
                                                    className="w-32 h-32 rounded-full object-scale-down border"
                                                />
                                                    {isEmployee && editableFields.includes("profile_photo_url") && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => fileInputRef.current.click()}
                                                                className="w-30"
                                                            >Upload Profile</Button>
                                                            <Input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                onChange={handleFileChange}
                                                                className="hidden"
                                                            />
                                                        </>
                                                    )}
                                                    {profile && (
                                                        <div className="mt-4 text-sm text-gray-700 w-48">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="font-semibold text-center text-base">{profile.first_name} {profile.middle_name} {profile.last_name} {profile.suffix}</div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="flex items-center gap-2">
                                                                        <img src={"https://img.icons8.com/?size=100&id=2333&format=png&color=000000"} alt="Position" className="inline w-4 h-4" />
                                                                        <span>{profile.position}</span>
                                                                    </span>
                                                                    -
                                                                    <span className="flex items-center gap-2">
                                                                        <span>{profile.department}</span>
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2"><img src={"https://img.icons8.com/?size=100&id=82785&format=png&color=000000"} alt="Email" className="inline w-4 h-4" /> <span className="text-xs text-gray-500">{profile.email}</span></div>
                                                                <div className="flex items-center gap-2"><img src={"https://img.icons8.com/?size=100&id=Fld0fUcMNHLy&format=png&color=000000"} alt="Phone" className="inline w-4 h-4" /> <span>{profile.phone}</span></div>
                                                                <div className="flex items-center gap-2"><img src={"https://img.icons8.com/?size=100&id=gmrqGLXMVNDf&format=png&color=000000"} alt="Address" className="inline w-4 h-4" /> <span>{profile.address}</span></div>
                                                                <div className="flex items-center gap-2"><img src={"https://img.icons8.com/?size=100&id=1615&format=png&color=000000"} alt="Birthday" className="inline w-4 h-4" /> <span>{profile.birthday}</span></div>
                                                                <div className="flex items-center gap-2"><img src={"https://img.icons8.com/?size=100&id=o7N3nVNi8Ayy&format=png&color=000000"} alt="Emergency Contact" className="inline w-4 h-4" /> <span>{profile.emergency_contact}</span></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                    <div>
                                                        <Label htmlFor="lastName">Last Name</Label>
                                                        <Input id="lastName" value={form.last_name} onChange={e => handleChange("last_name", e.target.value)} placeholder="Last Name" readOnly={!isEmployee} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="firstName">First Name</Label>
                                                        <Input id="firstName" value={form.first_name} onChange={e => handleChange("first_name", e.target.value)} placeholder="First Name" readOnly={!isEmployee} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="middleName">Middle Name</Label>
                                                        <Input id="middleName" value={form.middle_name} onChange={e => handleChange("middle_name", e.target.value)} placeholder="Middle Name" readOnly={!isEmployee} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="suffix">Suffix</Label>
                                                        <Input id="suffix" value={form.suffix} onChange={e => handleChange("suffix", e.target.value)} placeholder="Suffix" readOnly={!isEmployee} />
                                                    </div>
                                                    <div className="opacity-60 pointer-events-none">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input id="email" value={form.email} readOnly />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="phone">Phone Number</Label>
                                                        <Input id="phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} readOnly={!isEmployee} />
                                                    </div>
                                                    <div className="opacity-60 pointer-events-none">
                                                        <Label htmlFor="birthday">Birthday</Label>
                                                        <Input id="birthday" value={form.birthday} type="date" readOnly />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="address">Address</Label>
                                                        <Input id="address" value={form.address} onChange={e => handleChange("address", e.target.value)} readOnly={!isEmployee} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="civilStatus">Civil Status</Label>
                                                        <Input id="civilStatus" value={form.civil_status} onChange={e => handleChange("civil_status", e.target.value)} readOnly={!isEmployee} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                                                        <Input id="emergencyContact" value={form.emergency_contact} onChange={e => handleChange("emergency_contact", e.target.value)} readOnly={!isEmployee} />
                                                    </div>
                                                    <div className="opacity-60 pointer-events-none">
                                                        <Label htmlFor="department">Department</Label>
                                                        <Input id="department" value={form.department} readOnly />
                                                    </div>
                                                    <div className="opacity-60 pointer-events-none">
                                                        <Label htmlFor="position">Position/Job Title</Label>
                                                        <Input id="position" value={form.position} readOnly />
                                                    </div>
                                                </div>
                                            </div>
                                            {isEmployee && (
                                                <div className="flex justify-end mt-4">
                                                    <Button onClick={handleUpdateEmployee} disabled={saving}>
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 mt-8">Profile data not found or not loaded.</div>
                            )
                        )}
                    </div>
                    <ToastContainer position="bottom-right" />
                </main>
            </div>
    );
}

ESS.layout = (page) => <ProtectedLayout children={page} />
export default ESS;
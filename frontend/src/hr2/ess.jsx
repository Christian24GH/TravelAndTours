import ProtectedLayout from "@/layout/ProtectedLayout";
import { hr2 } from "@/api/hr2";
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



function ESS() {
  // TODO: Replace with real authentication/role logic
  // Example: const { user } = useAuth(); const isHRAdmin = user?.role === 'hr_admin';
  const isHRAdmin = false; // set to true to test HR admin view
  const [employeeId, setEmployeeId] = useState(1);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    profile_photo_url: "",
    phone: "",
    address: "",
    civil_status: "",
    emergency_contact: "",
    // HR admin fields
    email: "",
    department: "",
    position: "",
    birthday: "",
    hire_date: "",
    manager: "",
    employee_status: "Active",
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: ""
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Use RESTful endpoint: /api/employees/{id}
  const loadProfile = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Example endpoint: /api/employees/{id}
      const res = await fetch(hr2.backend.ess.profile + `/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load profile');
      const profileJson = await res.json();
      setProfile(profileJson);
      setForm(f => ({
        ...f,
        profile_photo_url: profileJson.profile_photo_url || "",
        phone: profileJson.phone || "",
        address: profileJson.address || "",
        civil_status: profileJson.civil_status || "",
        emergency_contact: profileJson.emergency_contact || "",
        email: profileJson.email || "",
        department: profileJson.department || "",
        position: profileJson.position || "",
        birthday: profileJson.birthday || "",
        hire_date: profileJson.hire_date || "",
        manager: profileJson.manager || "",
        employee_status: profileJson.employee_status || "Active",
        last_name: profileJson.last_name || "",
        first_name: profileJson.first_name || "",
        middle_name: profileJson.middle_name || "",
        suffix: profileJson.suffix || ""
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(employeeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  // Format name as Last Name, First Name, Middle Name, Suffix
  const formatName = (p) => {
    if (!p) return "";
    let name = p.last_name || "";
    if (p.first_name) name += ", " + p.first_name;
    if (p.middle_name) name += ", " + p.middle_name;
    if (p.suffix) name += ", " + p.suffix;
    return name;
  };

  // Editable fields for employee
  const editableFields = isHRAdmin
    ? [
        "profile_photo_url", "phone", "address", "civil_status", "emergency_contact",
        "email", "department", "position", "birthday", "hire_date", "manager", "employee_status",
        "last_name", "first_name", "middle_name", "suffix"
      ]
    : ["profile_photo_url", "phone", "address", "civil_status", "emergency_contact"];

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // PATCH or PUT to /api/employees/{id}
      const res = await fetch(hr2.backend.ess.profile + `/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadProfile(employeeId);
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Employee Self-Service</title>
      </Helmet>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Employee Self-Service</h1>
      </header>

      <div className="mb-4 flex items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Employee ID</label>
          <Input type="number" min={1} value={employeeId} onChange={(e) => setEmployeeId(Number(e.target.value))} className="w-32" />
        </div>
        <Button onClick={() => loadProfile(employeeId)}>Load</Button>
      </div>

  {loading && <p>Loading...</p>}
  {error && <p className="text-red-600">{error}</p>}
  {success && <p className="text-green-600">{success}</p>}

      {!loading && !error && profile && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={form.profile_photo_url || "/default-profile.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                  {editableFields.includes("profile_photo_url") && (
                    <Input
                      className="w-48"
                      value={form.profile_photo_url}
                      onChange={e => handleChange("profile_photo_url", e.target.value)}
                      placeholder="Profile Photo URL"
                    />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 gap-2">
                  <div><span className="font-semibold">Name:</span> {isHRAdmin ? (
                    <>
                      <Input className="mb-1" value={form.last_name} onChange={e => handleChange("last_name", e.target.value)} placeholder="Last Name" />
                      <Input className="mb-1" value={form.first_name} onChange={e => handleChange("first_name", e.target.value)} placeholder="First Name" />
                      <Input className="mb-1" value={form.middle_name} onChange={e => handleChange("middle_name", e.target.value)} placeholder="Middle Name" />
                      <Input className="mb-1" value={form.suffix} onChange={e => handleChange("suffix", e.target.value)} placeholder="Suffix" />
                    </>
                  ) : formatName(profile)}</div>
                  <div><span className="font-semibold">Department:</span> {isHRAdmin ? (
                    <Input value={form.department} onChange={e => handleChange("department", e.target.value)} />
                  ) : (profile.department || '-')}
                  </div>
                  <div><span className="font-semibold">Position/Job Title:</span> {isHRAdmin ? (
                    <Input value={form.position} onChange={e => handleChange("position", e.target.value)} />
                  ) : (profile.position || '-')}
                  </div>
                  <div><span className="font-semibold">Phone Number:</span> {editableFields.includes("phone") ? (
                    <Input value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
                  ) : (profile.phone || '-')}
                  </div>
                  <div><span className="font-semibold">Email:</span> {isHRAdmin ? (
                    <Input value={form.email} onChange={e => handleChange("email", e.target.value)} />
                  ) : (profile.email || '-')}
                  </div>
                  <div><span className="font-semibold">Address:</span> {editableFields.includes("address") ? (
                    <Input value={form.address} onChange={e => handleChange("address", e.target.value)} />
                  ) : (profile.address || '-')}
                  </div>
                  <div><span className="font-semibold">Birthday:</span> {isHRAdmin ? (
                    <Input value={form.birthday} onChange={e => handleChange("birthday", e.target.value)} type="date" />
                  ) : (profile.birthday || '-')}
                  </div>
                  <div><span className="font-semibold">Civil Status:</span> {editableFields.includes("civil_status") ? (
                    <Input value={form.civil_status} onChange={e => handleChange("civil_status", e.target.value)} />
                  ) : (profile.civil_status || '-')}
                  </div>
                  <div><span className="font-semibold">Emergency Contact:</span> {editableFields.includes("emergency_contact") ? (
                    <Input value={form.emergency_contact} onChange={e => handleChange("emergency_contact", e.target.value)} />
                  ) : (profile.emergency_contact || '-')}
                  </div>
                  {isHRAdmin && <>
                    <div><span className="font-semibold">Hire Date:</span> <Input value={form.hire_date} onChange={e => handleChange("hire_date", e.target.value)} type="date" /></div>
                    <div><span className="font-semibold">Manager/Supervisor:</span> <Input value={form.manager} onChange={e => handleChange("manager", e.target.value)} /></div>
                    <div><span className="font-semibold">Employee Status:</span> <Input value={form.employee_status} onChange={e => handleChange("employee_status", e.target.value)} /></div>
                  </>}
                </div>
              </div>
              <div className="mt-4 text-right">
                <Button disabled={saving} onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

ESS.layout = (page) => <ProtectedLayout children={page} />
export default ESS;
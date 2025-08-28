import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"

export default function RegisterDialog({ onApplicantAdded }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:8091/api/applicants", formData)

      // Refresh parent list
      if (onApplicantAdded) {
        onApplicantAdded(res.data)
      }

      // Show success toast
      toast.success("Applicant registered successfully!", { position: "top-center" })

      // Reset form + close dialog
      setFormData({ name: "", email: "", phone: "", position: "" })
      setOpen(false)
    } catch (err) {
      console.error("Error saving applicant:", err)
      toast.error("Failed to register applicant. Check console.", { position: "top-center" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={() => setOpen(true)}
      >
        Add New Applicant
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Register Applicant</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Position Applied"
                required
                className="w-full border rounded-lg px-3 py-2"
              />

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

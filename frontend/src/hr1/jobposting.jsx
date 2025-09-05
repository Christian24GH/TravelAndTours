// src/pages/hr1/JobPosting.jsx
import React, { useEffect, useState } from "react"
import { hr1 } from "@/api/hr1"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"

export default function JobPosting() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [newJob, setNewJob] = useState({ title: "", description: "", location: "" })

  // 🔹 Fetch job postings from backend
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch(hr1.backend.api.jobposting)
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Create job posting
  const handleCreate = async () => {
    if (!newJob.title) return alert("Title is required")
    try {
      await fetch(hr1.backend.api.createJobPosting, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      })
      setNewJob({ title: "", description: "", location: "" })
      fetchJobs()
    } catch (error) {
      console.error("Error creating job:", error)
    }
  }

  // 🔹 Delete job posting
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return
    try {
      await fetch(hr1.backend.api.deleteJobPosting(id), { method: "DELETE" })
      fetchJobs()
    } catch (error) {
      console.error("Error deleting job:", error)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Postings</h1>

      {/* Add Job Posting Form */}
      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Job Title"
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newJob.description}
            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={newJob.location}
            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
          />
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={16} /> Add Job
          </Button>
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500">No job postings found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Location</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{job.title}</td>
                    <td className="p-2 border">{job.description}</td>
                    <td className="p-2 border">{job.location}</td>
                    <td className="p-2 border">{job.status}</td>
                    <td className="p-2 border flex gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// src/pages/hr1/JobPosting.jsx
import React, { useEffect, useState } from "react"
import { hr1 } from "@/api/hr1"
import { toast } from "sonner"

export default function JobPosting() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  // 🔹 Fetch job postings
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch(hr1.backend.api.jobposting)
      if (!res.ok) throw new Error("Network response was not ok", { position: "top-center" })
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to fetch offers", { position: "top-center" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Postings</h1>

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No available job offers found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="p-2 border">{job.title}</td>
                <td className="p-2 border">{job.description}</td>
                <td className="p-2 border">{job.location}</td>
                <td className="p-2 border">{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

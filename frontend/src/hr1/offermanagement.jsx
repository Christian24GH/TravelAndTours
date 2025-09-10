import React, { useState, useEffect } from "react";
import api from "@/api/axios"; // axios instance
import { toast } from "sonner";

const JobPosting = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // For View/Edit modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Fetch vacancies from Core Transaction 2
  const fetchJobs = async () => {
    try {
      const res = await api.get("/core/jobs"); // <-- fetch from core transaction 2
      setJobs(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch vacancies from Core 2", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Delete job (if supported in Core 2)
  const deleteJob = async (id) => {
    try {
      await api.delete(`/core/jobs/${id}`); // <-- adjust if Core 2 supports delete
      setJobs(jobs.filter((job) => job.id !== id));
      toast.success("Vacancy deleted successfully", { position: "top-center" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete vacancy", { position: "top-center" });
    }
  };

  // Update job (if supported in Core 2)
  const updateJob = async () => {
    try {
      const res = await api.put(`/core/jobs/${selectedJob.id}`, selectedJob); // <-- adjust to Core 2 API
      setJobs(
        jobs.map((job) => (job.id === selectedJob.id ? res.data : job))
      );
      toast.success("Vacancy updated successfully", { position: "top-center" });
      setSelectedJob(null);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update vacancy", { position: "top-center" });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Available Vacancies (Core 2)</h2>
      </div>

      {loading ? (
        <p>Loading vacancies...</p>
      ) : jobs.length === 0 ? (
        <p>No vacancies available</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Vacancy Information</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job.id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">
                  <b>Position: {job.title}</b>
                  <br />
                  {job.description}
                </td>
                <td className="border px-4 py-2">{job.location}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      job.status === "open" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="border px-4 py-2 space-x-2">
                  {/* View Button */}
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                      setSelectedJob(job);
                      setEditMode(false);
                    }}
                  >
                    View
                  </button>

                  {/* Edit Button */}
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                      setSelectedJob(job);
                      setEditMode(true);
                    }}
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteJob(job.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for View/Edit */}
      {selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow w-1/2">
            <h3 className="text-lg font-bold mb-4">
              {editMode ? "Edit Vacancy" : "Vacancy Details"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm">Title</label>
                <input
                  type="text"
                  value={selectedJob.title}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, title: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  value={selectedJob.description}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({
                      ...selectedJob,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm">Location</label>
                <input
                  type="text"
                  value={selectedJob.location}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, location: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm">Status</label>
                <select
                  value={selectedJob.status}
                  disabled={!editMode}
                  onChange={(e) =>
                    setSelectedJob({ ...selectedJob, status: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
              {editMode && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={updateJob}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPosting;

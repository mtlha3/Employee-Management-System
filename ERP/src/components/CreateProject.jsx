"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FolderPlus, Calendar, User, FileText, CheckCircle, XCircle, Briefcase } from "lucide-react"

const CreateProject = () => {
  const [formData, setFormData] = useState({
    project_name: "",
    start_date: "",
    end_date: "",
    project_manager_id: "",
    project_manager_name: "",
  })
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdProject, setCreatedProject] = useState(null)

  // Fetch manager info on mount
  useEffect(() => {
    const fetchManagerInfo = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/me`, {
          withCredentials: true,
        })
        setFormData((prev) => ({
          ...prev,
          employeeId: response.data.user?.employee_id || "",
          employeeName: response.data.user?.name || "",
        }))
      } catch (err) {
        console.error("Failed to fetch project manager info:", err)
      }
    }
    fetchManagerInfo()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/projects/create`, formData, {
        withCredentials: true,
      })
      setMessage(response.data.message || "Project created successfully!")
      setCreatedProject(response.data.project)
      setIsError(false)
      setFormData({
        project_name: "",
        start_date: "",
        end_date: "",
        project_manager_id: response.data.project_manager_id,
        project_manager_name: response.data.project_manager_name,
      })
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to create project."
      setMessage(msg)
      setIsError(true)
      setCreatedProject(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <FolderPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Create New Project
          </h1>
          <p className="text-slate-600">Set up a new project with timeline and project manager details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

            {/* Alerts */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl border-l-4 ${
                  isError
                    ? "bg-red-50 border-red-400 text-red-800"
                    : "bg-emerald-50 border-emerald-400 text-emerald-800"
                } shadow-sm relative z-10`}
              >
                <div className="flex items-center">
                  {isError ? (
                    <XCircle className="flex-shrink-0 w-5 h-5 mr-3 text-red-400" />
                  ) : (
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3 text-emerald-400" />
                  )}
                  <span className="font-medium text-sm">{message}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Project Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="project_name"
                    placeholder="Enter project name"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              {/* Manager ID (read-only) */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="project_manager_id"
                    value={formData.employeeId}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>

              {/* Manager Name (read-only) */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    name="project_manager_name"
                    value={formData.employeeName}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg disabled:transform-none disabled:hover:shadow-lg"
              >
                <span className="flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Creating Project..." : "Create Project"}
                </span>
              </button>
            </form>
          </div>

          {/* Project Details Preview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-emerald-600" />
              Project Preview
            </h2>

            {createdProject ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-2">✅ Project Created Successfully!</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Project ID:</span>
                      <span className="font-mono text-slate-800 text-xs">{createdProject.project_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Project Name:</span>
                      <span className="font-semibold text-slate-800">{createdProject.project_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Start Date:</span>
                      <span className="text-slate-800">{formatDate(createdProject.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">End Date:</span>
                      <span className="text-slate-800">{formatDate(createdProject.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Manager:</span>
                      <span className="text-slate-800">{createdProject.project_manager_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Manager ID:</span>
                      <span className="font-mono text-slate-800">{createdProject.project_manager_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Created:</span>
                      <span className="text-slate-800">{formatDate(createdProject.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-600 text-sm mb-4">
                    Fill out the form to create a new project. The project details will appear here once created.
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Project Name:</span>
                      <span className="text-slate-400">{formData.project_name || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="text-slate-400">
                        {formData.start_date ? formatDate(formData.start_date) : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">End Date:</span>
                      <span className="text-slate-400">
                        {formData.end_date ? formatDate(formData.end_date) : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Manager:</span>
                      <span className="text-slate-400">{formData.employeeName || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Manager ID:</span>
                      <span className="text-slate-400">{formData.employeeId || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Project Guidelines:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Choose a descriptive project name</li>
                    <li>• Set realistic start and end dates</li>
                    <li>• Ensure project manager ID is valid</li>
                    <li>• Double-check all details before creating</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProject

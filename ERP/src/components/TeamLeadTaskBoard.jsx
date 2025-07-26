"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import {
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Upload,
  Briefcase,
  Target,
  FolderOpen,
  Loader2,
  Send,
} from "lucide-react"

const TeamLeadTaskBoard = () => {
  const [projects, setProjects] = useState([])
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [projectDevelopers, setProjectDevelopers] = useState({})
  const [selectedDeveloper, setSelectedDeveloper] = useState(null)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    file: null,
  })
  const [openedTasks, setOpenedTasks] = useState({})
  const [developerTasks, setDeveloperTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const API = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/team-lead/projects`, {
          withCredentials: true,
        })
        setProjects(res.data.projects)
      } catch (err) {
        console.error("Error fetching projects:", err)
        Swal.fire("Error", "Failed to load projects", "error")
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleCardClick = async (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null)
      return
    }
    try {
      const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers`)
      setProjectDevelopers((prev) => ({
        ...prev,
        [projectId]: res.data.developers,
      }))
      setExpandedProjectId(projectId)
    } catch (err) {
      console.error("Error fetching developers:", err)
      Swal.fire("Error", "Failed to load developers", "error")
    }
  }

  const groupByRole = (developers) => {
    return developers.reduce((acc, dev) => {
      if (!acc[dev.role]) acc[dev.role] = []
      acc[dev.role].push(dev)
      return acc
    }, {})
  }

  const toggleTaskDropdown = async (projectId, developerId) => {
    const key = `${projectId}_${developerId}`
    setOpenedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    if (!developerTasks[key]) {
      try {
        const res = await axios.get(`${API}/api/projects/projects/${projectId}/developers/${developerId}/tasks`)
        setDeveloperTasks((prev) => ({
          ...prev,
          [key]: res.data.tasks,
        }))
      } catch (err) {
        console.error("Error fetching tasks:", err)
        Swal.fire("Error", "Could not fetch tasks", "error")
      }
    }
  }

  const openTaskModal = (dev) => {
    setSelectedDeveloper(dev)
    setTaskFormData({
      title: "",
      description: "",
      file: null,
    })
  }

  const closeTaskModal = () => {
    setSelectedDeveloper(null)
  }

  const handleChange = (field, value) => {
    setTaskFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e) => {
    setTaskFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }))
  }

  const handleSubmitTask = async (e) => {
    e.preventDefault()
    const { title, description, file } = taskFormData
    const dev = selectedDeveloper

    if (!title || !description || !dev || !expandedProjectId) {
      return Swal.fire("Error", "Please fill in all fields", "error")
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("developerId", dev.employee_id)
    formData.append("project_id", expandedProjectId)
    formData.append("title", title)
    formData.append("description", description)
    if (file) formData.append("file", file)

    try {
      await axios.post(`${API}/api/projects/tasks/assign`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      Swal.fire("Success", "Task assigned successfully!", "success")
      closeTaskModal()
      const key = `${expandedProjectId}_${dev.employee_id}`
      const res = await axios.get(
        `${API}/api/projects/projects/${expandedProjectId}/developers/${dev.employee_id}/tasks`,
      )
      setDeveloperTasks((prev) => ({
        ...prev,
        [key]: res.data.tasks,
      }))
    } catch (err) {
      console.error("Task assignment error:", err.response?.data || err.message)
      Swal.fire("Error", err.response?.data?.message || "Task assignment failed", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const getTaskStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "in progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-slate-500" />
      default:
        return <Clock className="w-4 h-4 text-slate-500" />
    }
  }

  const getTaskStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Task Board...</h2>
            <p className="text-slate-600">Please wait while we fetch your projects and tasks</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Team Lead Task Board
          </h1>
          <p className="text-slate-600">Assign and manage tasks for your team members</p>
        </div>

        {/* Projects List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Projects Available</h3>
              <p className="text-slate-500">You don't have any projects to manage tasks for.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((project) => {
                const isExpanded = expandedProjectId === project.project_id
                const developers = projectDevelopers[project.project_id] || []
                const grouped = groupByRole(developers)

                return (
                  <div key={project.project_id} className="transition-all duration-300">
                    {/* Project Header - Clickable */}
                    <div
                      className="p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleCardClick(project.project_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-lg">
                              {project.project_name}
                            </h2>
                            <p className="text-sm text-slate-600 mb-1">Manager: {project.project_manager_name}</p>
                            <p className="text-xs font-mono text-slate-500">ID: {project.project_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
                              <Users className="w-3 h-3" />
                              <span>{developers.length} developers</span>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Target className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Developer List */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
                        <div className="pt-6">
                          {developers.length > 0 ? (
                            <div className="space-y-6">
                              {Object.entries(grouped).map(([role, devs]) => (
                                <div
                                  key={role}
                                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6"
                                >
                                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <Briefcase className="w-5 h-5 text-emerald-600 mr-2" />
                                    {role} ({devs.length})
                                  </h3>
                                  <div className="space-y-4">
                                    {devs.map((dev) => {
                                      const key = `${project.project_id}_${dev.employee_id}`
                                      const isOpen = openedTasks[key]
                                      const tasks = developerTasks[key] || []

                                      return (
                                        <div
                                          key={dev.employee_id}
                                          className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all duration-200"
                                        >
                                          <div className="flex justify-between items-center">
                                            <div
                                              className="cursor-pointer flex-1"
                                              onClick={() => toggleTaskDropdown(project.project_id, dev.employee_id)}
                                            >
                                              <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                                  <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                  <p className="font-semibold text-slate-800">{dev.name}</p>
                                                  <p className="text-sm text-slate-500 flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Click to view tasks ({tasks.length})
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => openTaskModal(dev)}
                                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
                                            >
                                              <Plus className="w-4 h-4" />
                                              <span>Assign Task</span>
                                            </button>
                                          </div>

                                          {/* Tasks Dropdown */}
                                          {isOpen && (
                                            <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                              <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                                                <FileText className="w-4 h-4 text-emerald-600 mr-2" />
                                                Assigned Tasks
                                              </h4>
                                              {tasks.length > 0 ? (
                                                <div className="space-y-3">
                                                  {tasks.map((task) => (
                                                    <div
                                                      key={task.task_id}
                                                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                                                    >
                                                      <div className="flex items-start justify-between mb-2">
                                                        <h5 className="font-semibold text-slate-800">{task.title}</h5>
                                                        <span
                                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
                                                            task.status,
                                                          )}`}
                                                        >
                                                          {getTaskStatusIcon(task.status)}
                                                          <span className="ml-1 capitalize">{task.status}</span>
                                                        </span>
                                                      </div>
                                                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                                                      <div className="flex items-center text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        <span>Task ID: {task.task_id}</span>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <div className="text-center py-6">
                                                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                  <p className="text-slate-500">No tasks assigned yet.</p>
                                                  <p className="text-sm text-slate-400">
                                                    Click "Assign Task" to get started.
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Developers Found</h3>
                              <p className="text-slate-500">This project doesn't have any developers assigned yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Task Assignment Modal */}
      {selectedDeveloper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Assign Task</h2>
                    <p className="text-sm text-slate-600">Create a new task for {selectedDeveloper.name}</p>
                  </div>
                </div>
                <button onClick={closeTaskModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
              {/* Developer Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{selectedDeveloper.name}</p>
                    <p className="text-sm text-slate-600">{selectedDeveloper.role}</p>
                  </div>
                </div>
              </div>

              {/* Task Title */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700"
                    value={taskFormData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>
              </div>

              {/* Task Description */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Task Description</label>
                <textarea
                  placeholder="Describe the task in detail..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-700 resize-none"
                  value={taskFormData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {/* File Upload */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Attach File (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Upload className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Assign Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamLeadTaskBoard
